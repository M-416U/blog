import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PostsModule } from "./posts/posts.module";
import { TrackingModule } from "./tracking/tracking.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { SuggestionsModule } from "./suggestions/suggestions.module";
import { CloudinaryConfigModule } from "./cloudinary/cloudinary.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UsersModule,
    PostsModule,
    TrackingModule,
    AnalyticsModule,
    SuggestionsModule,
    CloudinaryConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
