import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Post } from "./schemas/post.schema";
import { CreatePostDto } from "./dto/create-post.dto";
import { User } from "../users/schemas/user.schema";
import { UpdatePostDto } from "./dto/update-post.dto";
import { JWTUser } from "@types";

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
      .populate("author", "username avatar")
      .exec();

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return post;
  }

  async getPosts({ page, limit, tag, author }) {
    const query = {};
    if (tag) query["tags"] = tag;
    if (author) query["author"] = new mongoose.Types.ObjectId(author);

    const posts = await this.postModel
      .find(query)
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.postModel.countDocuments(query);

    return {
      posts,
      meta: {
        total,
        page: Number(page),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
    user: User
  ): Promise<Post> {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (
      post.author.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      throw new ForbiddenException("Not authorized to update this post");
    }

    return this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .populate("author", "username avatar");
  }

  async deletePost(id: string, user: User): Promise<{ deleted: boolean }> {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (
      post.author.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      throw new ForbiddenException("Not authorized to delete this post");
    }

    await this.postModel.findByIdAndDelete(id);
    return { deleted: true };
  }

  async updatePublishStatus(
    id: string,
    status: boolean,
    user: JWTUser
  ): Promise<Post> {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException("Post not found");
    }
    if (
      post.author.toString() !== user.userId.toString() &&
      user.role !== "admin"
    ) {
      throw new ForbiddenException("Not authorized to modify this post");
    }

    return await this.postModel
      .findByIdAndUpdate(
        id,
        { published: status, publishedAt: status ? new Date() : null },
        { new: true }
      )
      .populate("author", "username avatar");
  }

  async updateFeatureStatus(id: string, status: boolean): Promise<Post> {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    return this.postModel
      .findByIdAndUpdate(
        id,
        { featured: status, featuredAt: status ? new Date() : null },
        { new: true }
      )
      .populate("author", "username avatar");
  }
}
