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
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { CreatePostDto } from "./dto/create-post.dto";
import { User } from "src/users/schemas/user.schema";
import { PostsService } from "./posts.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ContentStatusDto } from "./dto/content-status.dto";

@ApiTags("Posts")
@Controller("posts")
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("writer", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new post (Writer/Admin)" })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: { user: User }
  ) {
    return this.postsService.createPost(createPostDto, req.user._id);
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
