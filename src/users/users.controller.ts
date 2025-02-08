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
import { UpdateInterestsDto } from "./dto/update-interests.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { UserPreferencesDto } from "./dto/preferences.dto";
import { JWTUser } from "@types";

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
    return await this.usersService.createAdmin(createUserDto);
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
    return await this.usersService.updateRole(userId, updateRoleDto.role);
  }
  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Request() req: { user: any }) {
    return await this.usersService.findOne(req.user.userId);
  }
  @Put("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateProfile(
    @Request() req: { user: JWTUser },
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return await this.usersService.updateProfile(
      req.user.userId,
      updateProfileDto
    );
  }

  @Put("me/password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async changePassword(
    @Request() req: { user: JWTUser },
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    return await this.usersService.changePassword(
      req.user.userId,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword
    );
  }

  @Put("me/interests")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateInterests(
    @Request() req: { user: JWTUser },
    @Body() updateInterestsDto: UpdateInterestsDto
  ) {
    return await this.usersService.updateInterests(
      req.user.userId,
      updateInterestsDto.interests
    );
  }

  @Post("preferences")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Save user preferences" })
  async savePreferences(
    @Request() req: { user: JWTUser },
    @Body() preferencesDto: UserPreferencesDto
  ) {
    return await this.usersService.savePreferences(
      req.user.userId,
      preferencesDto
    );
  }

  @Get("preferences")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user preferences" })
  async getPreferences(@Request() req: { user: JWTUser }) {
    return await this.usersService.getPreferences(req.user.userId);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "All users retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll() {
    return await this.usersService.findMany({});
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
    return await this.usersService.findOne(id);
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
    @Request() req: { user: JWTUser }
  ) {
    try {
      const uploadResult = await this.cloudinaryService.uploadFile(file);

      return await this.usersService.updateProfile(req.user.userId, {
        avatar: uploadResult.secure_url,
      });
    } catch (error) {
      return {
        status: 500,
        message: "Failed to upload avatar",
        error: error.message,
      };
    }
  }
}
