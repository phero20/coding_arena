import { DriverOptions, ExecutionPackage } from "./core/types";
import { JavaProvider } from "./languages/java/java-provider";
import { PythonProvider } from "./languages/python/python-provider";
import { CppProvider } from "./languages/cpp/cpp-provider";
import { CProvider } from "./languages/c/c-provider";
import { JavaScriptProvider } from "./languages/javascript/javascript-provider";
import { TypeScriptProvider } from "./languages/typescript/typescript-provider";
import { CSharpProvider } from "./languages/csharp/csharp-provider";
import { RustProvider } from "./languages/rust/rust-provider";
import { GoProvider } from "./languages/go/go-provider";

const providers = {
  java: new JavaProvider(),
  python: new PythonProvider(),
  cpp: new CppProvider(),
  c: new CProvider(),
  javascript: new JavaScriptProvider(),
  typescript: new TypeScriptProvider(),
  csharp: new CSharpProvider(),
  rust: new RustProvider(),
  go: new GoProvider(),
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
