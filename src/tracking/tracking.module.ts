import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { View, ViewSchema } from "./schemas/view.schema";
import { TrackingService } from "./tracking.service";
import { TrackingController } from "./tracking.controller";
import { UsersModule } from "src/users/users.module";
import { PostsModule } from "src/posts/posts.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: View.name, schema: ViewSchema }]),
    PostsModule,
    UsersModule,
  ],
  providers: [TrackingService],
  controllers: [TrackingController],
})
export class TrackingModule {}
