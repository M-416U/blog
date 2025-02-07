import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post } from "src/posts/schemas/post.schema";
import { View } from "src/tracking/schemas/view.schema";
import { User } from "src/users/schemas/user.schema";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(View.name) private viewModel: Model<View>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>
  ) {}

  async getViewsOverTime(period: string) {
    const format = this.getDateFormat(period);
    return this.viewModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format, date: "$viewedAt" } },
          count: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getPopularPosts(limit: number) {
    return this.postModel.aggregate([
      { $sort: { viewCount: -1 } },
      { $limit: limit },
      { $project: { title: 1, viewCount: 1, author: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
    ]);
  }

  private getDateFormat(period: string) {
    return (
      {
        daily: "%Y-%m-%d",
        weekly: "%Y-%U",
        monthly: "%Y-%m",
      }[period] || "%Y-%m-%d"
    );
  }
  async getUserRegistrations(period: string) {
    const format = this.getDateFormat(period);
    return this.userModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getActiveUsersCount(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.userModel.aggregate([
      {
        $match: {
          lastLogin: { $gte: cutoffDate },
        },
      },
      { $count: "activeUsers" },
    ]);
  }

  async getRoleDistribution() {
    return this.userModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $project: { role: "$_id", count: 1, _id: 0 } },
    ]);
  }
}
