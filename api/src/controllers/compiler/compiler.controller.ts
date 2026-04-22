import { BaseController } from "../base.controller";
import { ICradle } from "../../libs/awilix-container";
import { CompilerService } from "../../services/compiler/compiler.service";
import { ControllerRequest } from "../../types/infrastructure/hono.types";
import { ExecuteCodeInput } from "../../services/validation/compiler.validator";

/**
 * CompilerController handles public compiler/playground requests.
 */
export class CompilerController extends BaseController {
  private readonly compilerService: CompilerService;

  constructor(cradle: ICradle) {
    super(cradle);
    this.compilerService = cradle.compilerService;
  }

  /**
   * Returns available compilers/languages.
   */
  async getLanguages() {
    return await this.compilerService.getLanguages();
  }

  /**
   * Executes code using Wandbox.
   */
  async execute(req: ControllerRequest<ExecuteCodeInput>) {
    return await this.compilerService.execute(req.body);
  }
}
