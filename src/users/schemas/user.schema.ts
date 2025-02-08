import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ enum: ["superadmin", "admin", "writer", "user"], default: "user" })
  role: string;

  @Prop()
  profilePicture?: string;

  @Prop({ default: Date.now })
  lastLogin: Date;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({
    type: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },

        viewedAt: Date,
      },
    ],
    default: [],
  })
  viewedPosts: Array<{ postId: mongoose.Types.ObjectId; viewedAt: Date }>;

  @Prop({
    type: Object,
    default: {
      emailNotifications: true,
      preferredTags: [],
      theme: "light",
    },
  })
  preferences: {
    emailNotifications: boolean;
    preferredTags: string[];
    theme: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
