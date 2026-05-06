import { DriverOptions, ExecutionPackage } from "./core/types";
import { JavaProvider } from "./languages/java/java-provider";

const providers = {
  java: new JavaProvider(),
  // python: new PythonProvider(), (Coming soon)
};

/**
 * The primary entry point for the Judge Driver system.
 */
export async function generateExecutionPackage(opts: DriverOptions): Promise<ExecutionPackage> {
  const provider = providers[opts.language.toLowerCase() as keyof typeof providers];
  
  if (!provider) {
    throw new Error(`Unsupported language: ${opts.language}`);
  }

  return provider.generate(opts);
}

export * from "./core/types";
export * from "./core/constants";
export * from "./core/type-ast";
export * from "./core/compare";
export * from "./core/codec-registry";
