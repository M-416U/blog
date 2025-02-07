import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AnalyticsService } from "./analytics.service";

@ApiTags("Analytics")
@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "superadmin")
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get("views/time")
  @ApiOperation({ summary: "Get views grouped by time period" })
  async getViewsOverTime(
    @Query("period") period: "daily" | "weekly" | "monthly"
  ) {
    return this.analyticsService.getViewsOverTime(period);
  }

  @Get("posts/popular")
  async getPopularPosts(@Query("limit") limit = 10) {
    return this.analyticsService.getPopularPosts(Number(limit));
  }

  @Get("users/registrations")
  @Roles("admin", "superadmin")
  @ApiOperation({ summary: "User registration trends (Admin+)" })
  async getUserRegistrations(
    @Query("period") period: "daily" | "weekly" | "monthly"
  ) {
    return this.analyticsService.getUserRegistrations(period);
  }

  @Get("users/activity")
  @Roles("admin", "superadmin")
  async getActiveUsersCount() {
    return this.analyticsService.getActiveUsersCount();
  }

  @Get("users/roles")
  @Roles("admin", "superadmin")
  async getRoleDistribution() {
    return this.analyticsService.getRoleDistribution();
  }
}
