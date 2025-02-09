import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JWTUser } from '@types';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: JWTUser): Promise<Comment> {
    const comment = new this.commentModel({
      content: createCommentDto.content,
      author: new Types.ObjectId(user.userId),
      post: new Types.ObjectId(createCommentDto.postId),
      parentComment: createCommentDto.parentCommentId 
        ? new Types.ObjectId(createCommentDto.parentCommentId)
        : null,
    });

    return await comment.save();
  }

  async findAllByPost(postId: string): Promise<Comment[]> {
    return await this.commentModel
      .find({ post: new Types.ObjectId(postId) })
      .populate('author', 'username avatar')
      .populate('parentComment')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate('author', 'username avatar')
      .populate('parentComment')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: JWTUser): Promise<Comment> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== user.userId && !['admin', 'superadmin'].includes(user.role)) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateCommentDto.content;
    comment.isEdited = true;

    return await comment.save();
  }

  async remove(id: string, user: JWTUser): Promise<void> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== user.userId && !['admin', 'superadmin'].includes(user.role)) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await comment.deleteOne();
  }
}
