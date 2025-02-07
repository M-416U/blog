// src/tracking/schemas/view.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Post } from "../../posts/schemas/post.schema";
import { User } from "../../users/schemas/user.schema";
import mongoose from "mongoose";

@Schema()
export class View {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Post" })
  post: Post;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false })
  user?: User;

  @Prop({ default: Date.now })
  viewedAt: Date;

  @Prop({ required: false })
  duration?: number;
}

export const ViewSchema = SchemaFactory.createForClass(View);
