import { z } from "zod";
import { createCompanySchema, updateCompanySchema } from "../../validators/company/company.admin.validator";

export type CreateCompanyPayload = z.infer<typeof createCompanySchema>;
export type UpdateCompanyPayload = z.infer<typeof updateCompanySchema>;
