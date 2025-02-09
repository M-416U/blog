import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { CreatePostDto } from "./dto/create-post.dto";
import { User } from "src/users/schemas/user.schema";
import { PostsService } from "./posts.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ContentStatusDto } from "./dto/content-status.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";

@ApiTags("Posts")
@Controller("posts")
export class PostsController {
  constructor(
    private postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("writer", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new post (Writer/Admin)" })
  @UseInterceptors(FileInterceptor("thumbnail"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        content: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" },
        },
        thumbnail: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() thumbnail: Express.Multer.File,
    @Request() req: { user: User }
  ) {
    let thumbnailUrl = null;
    if (thumbnail) {
      const uploadResult = await this.cloudinaryService.uploadFile(thumbnail);
      thumbnailUrl = uploadResult.secure_url;
    }
    return this.postsService.createPost(
      { ...createPostDto, thumbnail: thumbnailUrl },
      req.user._id
    );
  }
  @Get()
  @ApiOperation({ summary: "Get paginated posts list" })
  async getPosts(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("tag") tag?: string,
    @Query("author") author?: string
  ) {
    return this.postsService.getPosts({ page, limit, tag, author });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get post by ID (Public)" })
  async getPost(@Param("id") postId: string) {
    return this.postsService.getPost(postId);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("writer", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update post (Writer/Admin)" })
  async updatePost(
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: { user: User }
  ) {
    return this.postsService.updatePost(id, updatePostDto, req.user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("writer", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete post (Writer/Admin)" })
  async deletePost(@Param("id") id: string, @Request() req: { user: User }) {
    return this.postsService.deletePost(id, req.user);
  }

  @Post(":id/publish")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("writer", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Publish/unpublish post" })
  async togglePublishStatus(
    @Param("id") id: string,
    @Body() contentStatusDto: ContentStatusDto,
    @Request() req: { user: User }
  ) {
    return this.postsService.updatePublishStatus(
      id,
      contentStatusDto.status,
      req.user
    );
  }

  @Post(":id/feature")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Feature/unfeature post" })
  async toggleFeatureStatus(
    @Param("id") id: string,
    @Body() contentStatusDto: ContentStatusDto
  ) {
    return this.postsService.updateFeatureStatus(id, contentStatusDto.status);
  }
}
