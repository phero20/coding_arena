import type { Context } from "hono";
import { type IAcademyService } from "../../services/academy/academy.service";

export class AcademyController {
  private academyService: IAcademyService;

  constructor({ academyService }: { academyService: IAcademyService }) {
    this.academyService = academyService;
  }

  getTracks = async (c: Context) => {
    try {
      const tracks = await this.academyService.getTracks();
      return c.json({
        success: true,
        data: tracks,
      });
    } catch (error) {
      console.error("[AcademyController] Error fetching tracks:", error);
      return c.json(
        {
          success: false,
          error: "Failed to fetch academy tracks",
        },
        500
      );
    }
  };
}
