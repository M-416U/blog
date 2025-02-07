import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { View } from "./schemas/view.schema";
import { Post } from "../posts/schemas/post.schema";
import { User } from "src/users/schemas/user.schema";

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(View.name) private viewModel: Model<View>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async trackView(
    postId: string,
    userId?: string,
    duration?: number
  ): Promise<void> {
    await this.viewModel.create({ post: postId, user: userId });

    // Update user's viewedPosts
    if (userId) {
      await this.userModel.findByIdAndUpdate(userId, {
        $push: {
          viewedPosts: {
            postId: new mongoose.Types.ObjectId(postId),
            viewedAt: new Date(),
          },
        },
      });
    }

    // 2. Increment post's view count
    await this.postModel.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });
  }
}
