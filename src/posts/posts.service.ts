import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Post } from "./schemas/post.schema";
import { CreatePostDto } from "./dto/create-post.dto";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    authorId: string
  ): Promise<Post> {
    const newPost = new this.postModel({
      ...createPostDto,
      author: new mongoose.Types.ObjectId(authorId),
    });
    return newPost.save();
  }

  async getPost(postId: string): Promise<Post> {
    const post = await this.postModel
      .findById(postId)
      .populate("author", "username profilePicture")
      .exec();

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }
}
