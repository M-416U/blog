import { Module } from "@nestjs/common";
import { SuggestionsController } from "./suggestions.controller";
import { SuggestionsService } from "./suggestions.service";
import { UsersModule } from "../users/users.module";
import { PostsModule } from "../posts/posts.module";
import { AnalyticsModule } from "src/analytics/analytics.module";

@Module({
  imports: [UsersModule, PostsModule, AnalyticsModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
})
export class SuggestionsModule {}
