import { Express } from "express";
import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { User } from "./schemas/user.schema";
import { UpdateInterestsDto } from "./dto/update-interests.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "nestjs-cloudinary";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(
    private usersService: UsersService,
    private cloudinary: CloudinaryService
  ) {}

  @Post("admins")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create new admin (SuperAdmin only)" })
  @ApiResponse({ status: 201, description: "Admin created successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createAdmin(createUserDto);
  }

  @Put(":id/role")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("superadmin", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user role (Admin/SuperAdmin only)" })
  @ApiResponse({ status: 200, description: "Role updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateRole(
    @Param("id") userId: string,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    return this.usersService.updateRole(userId, updateRoleDto.role);
  }

  @Put("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateProfile(
    @Request() req: { user: User },
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(req.user._id, updateProfileDto);
  }

  @Put("me/password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async changePassword(
    @Request() req: { user: any },
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    return this.usersService.changePassword(
      req.user.userId,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword
    );
  }

  @Put("me/interests")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateInterests(
    @Request() req: { user: User },
    @Body() updateInterestsDto: UpdateInterestsDto
  ) {
    return this.usersService.updateInterests(
      req.user._id,
      updateInterestsDto.interests
    );
  }
  @Post("me/avatar")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: User }
  ) {
    const result = await this.cloudinary
      .uploadFile(file, {
        folder: "avatars",
        allowed_formats: ["jpg", "png", "jpeg"],
      })
      .catch(() => {
        throw new BadRequestException("Invalid file type");
      });

    return this.usersService.updateProfile(req.user._id, {
      profilePicture: result.secure_url,
    });
  }
}
