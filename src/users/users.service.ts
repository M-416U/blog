import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { FilterQuery, Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { User } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserPreferencesDto } from "./dto/preferences.dto";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createAdmin(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await this.userModel.create({
      email,
      passwordHash,
      role: "admin",
    });

    return {
      id: user._id,
      email: user.email,
      role: user.role,
    };
  }

  async updateRole(userId: string, newRole: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Prevent changing superadmin role
    if (user.role === "superadmin") {
      throw new UnauthorizedException("Cannot modify superadmin role");
    }

    user.role = newRole;
    await user.save();

    return {
      id: user._id,
      email: user.email,
      role: user.role,
    };
  }
  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    return this.userModel
      .findOneAndUpdate({ _id: userId }, { $set: updateData })
      .select("-passwordHash");
  }
  async findOne(userId: string) {
    return await this.userModel
      .findOne({ _id: new mongoose.Types.ObjectId(userId) })
      .select("-passwordHash -_v");
  }
  async findMany(query: FilterQuery<User>) {
    return this.userModel.find(query).select("-passwordHash -_v");
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await this.userModel.findById(userId);
    if (!(await bcrypt.compare(oldPassword, user.passwordHash))) {
      throw new UnauthorizedException("Invalid old password");
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    return user.save();
  }
  async savePreferences(
    userId: string,
    preferences: UserPreferencesDto
  ): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { preferences }, { new: true })
      .select("preferences");

    return updatedUser;
  }

  async getPreferences(userId: string) {
    const user = await this.userModel.findById(userId).select("preferences");

    return user.preferences;
  }
  async updateInterests(userId: string, interests: string[]) {
    return this.userModel
      .findByIdAndUpdate(userId, { $set: { interests } }, { new: true })
      .select("-passwordHash");
  }
}
