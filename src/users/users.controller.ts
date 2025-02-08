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
  Get,
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
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { UserPreferencesDto } from "./dto/preferences.dto";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService
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

  @Post("preferences")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Save user preferences" })
  async savePreferences(
    @Request() req: { user: User },
    @Body() preferencesDto: UserPreferencesDto
  ) {
    return this.usersService.savePreferences(req.user._id, preferencesDto);
  }

  @Get("preferences")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user preferences" })
  async getPreferences(@Request() req: { user: User }) {
    return this.usersService.getPreferences(req.user._id);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "All users retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll() {
    return this.usersService.findMany({});
  }
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Request() req: { user: User }) {
    return req.user;
  }
  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post("me/avatar")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    try {
      const uploadResult = await this.cloudinaryService.uploadFile(file);

      return this.usersService.updateProfile(req.user._id, {
        profilePicture: uploadResult.secure_url,
      });
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        message: "Failed to upload avatar",
        error: error.message,
      };
    }
  }
}
