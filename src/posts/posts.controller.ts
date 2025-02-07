import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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

  @Get(":id")
  @ApiOperation({ summary: "Get post by ID (Public)" })
  async getPost(@Param("id") postId: string) {
    return this.postsService.getPost(postId);
  }
}
