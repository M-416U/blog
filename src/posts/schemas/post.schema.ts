import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "../../users/schemas/user.schema";
import mongoose from "mongoose";

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string; // Raw markdown

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User" })
  author: User;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ type: [String] })
  tags: string[];
  @Prop({ default: false })
  published: boolean;

  @Prop()
  publishedAt?: Date;

  @Prop({ default: false })
  featured: boolean;

  @Prop()
  featuredAt?: Date;
  @Prop({ default: Date.now })
  createdAt: Date;
}
export const PostSchema = SchemaFactory.createForClass(Post);
