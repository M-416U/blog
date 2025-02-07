import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AnalyticsService } from "src/analytics/analytics.service";
import { Post } from "src/posts/schemas/post.schema";
import { User } from "src/users/schemas/user.schema";

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private analyticsService: AnalyticsService // Reuse popular posts logic
  ) {}

  async getSuggestions(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select("interests viewedPosts");

    // Get tags from interests + viewed posts
    const userTags = await this.getRelevantTags(user);

    // Find posts matching tags (excluding viewed posts)
    return this.postModel.aggregate([
      {
        $match: {
          tags: { $in: userTags },
          _id: { $nin: user.viewedPosts.map((p) => p.postId) },
        },
      },
      { $sample: { size: 10 } }, // Randomize results
      { $project: { title: 1, tags: 1, viewCount: 1 } },
    ]);
  }

  private async getRelevantTags(user: User): Promise<string[]> {
    if (user.interests.length > 0) return user.interests;

    // Fallback: Get tags from viewed posts
    const viewedPostIds = user.viewedPosts.map((p) => p.postId);
    const viewedPosts = await this.postModel.find({
      _id: { $in: viewedPostIds },
    });
    return viewedPosts.flatMap((post) => post.tags);
  }
}
