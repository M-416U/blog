import { Module } from "@nestjs/common";
import {
  CloudinaryService,
  CloudinaryModule as NestJSCloudinaryModule,
} from "nestjs-cloudinary";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [NestJSCloudinaryModule, CloudinaryService, UsersModule],
  providers: [
    {
      provide: "CLOUDINARY_MODULE_MODULE_OPTIONS",
      useValue: {
        cloud_name: "your_cloud_name",
        api_key: "your_api_key",
        api_secret: "your_api_secret",
      },
    },
    NestJSCloudinaryModule,
  ],
  exports: [CloudinaryService],
})
export class CloudinaryConfigModule {}
