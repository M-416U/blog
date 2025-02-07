// src/tracking/tracking.controller.ts
import { Controller, Post, Param, Request, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { TrackingService } from "./tracking.service";

@ApiTags("Tracking")
@Controller("tracking")
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post("posts/:postId/view")
  @ApiOperation({ summary: "Track a post view (authenticated or anonymous)" })
  async trackPostView(
    @Param("postId") postId: string,
    @Request() req: { user?: { _id: string } } // Optional user
  ) {
    await this.trackingService.trackView(
      postId,
      req.user?._id // User ID if authenticated
    );
    return { success: true };
  }
}
