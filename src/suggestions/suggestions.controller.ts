import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { SuggestionsService } from "./suggestions.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { User } from "src/users/schemas/user.schema";

@ApiTags("Suggestions")
@Controller("suggestions")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuggestionsController {
  constructor(private suggestionsService: SuggestionsService) {}

  @Get()
  @ApiOperation({ summary: "Get personalized post suggestions" })
  async getSuggestions(@Request() req: { user: User }) {
    return this.suggestionsService.getSuggestions(req.user._id);
  }
}
