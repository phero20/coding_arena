/**
 * Compiler Playground — static language configuration.
 * Source of truth: Wandbox compiler IDs + Monaco language mappings.
 */

export interface CompilerLangConfig {
  /** Exact Wandbox compiler name — sent to /compiler/execute */
  id: string;
  /** Display name for the UI */
  name: string;
  /** Monaco Editor language ID */
  monacoLang: string;
  /** Default "Hello World" boilerplate */
  defaultCode: string;
}

export const COMPILER_LANGUAGES: CompilerLangConfig[] = [
  {
    id: "cpython-3.12.7",
    name: "Python",
    monacoLang: "python",
    defaultCode: 'print("Hello, World!")',
  },
  {
    id: "r-4.4.1",
    name: "R",
    monacoLang: "plaintext",
    defaultCode: 'print("Hello, World!")',
  },
  {
    id: "nodejs-20.17.0",
    name: "JavaScript",
    monacoLang: "javascript",
    defaultCode: 'console.log("Hello, World!");',
  },
  {
    id: "typescript-5.6.2",
    name: "TypeScript",
    monacoLang: "typescript",
    defaultCode: 'console.log("Hello, World!");',
  },
  {
    id: "openjdk-jdk-21+35",
    name: "Java",
    monacoLang: "java",
    defaultCode:
      'class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  },
  {
    id: "gcc-13.2.0-c",
    name: "C",
    monacoLang: "c",
    defaultCode:
      '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  },
  {
    id: "gcc-13.2.0",
    name: "C++",
    monacoLang: "cpp",
    defaultCode:
      '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  },
  {
    id: "mono-6.12.0.199",
    name: "C#",
    monacoLang: "csharp",
    defaultCode:
      'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
  },
  {
    id: "dotnetcore-8.0.402",
    name: "C# (.NET)",
    monacoLang: "csharp",
    defaultCode:
      'using System;\nConsole.WriteLine("Hello, World!");',
  },
  {
    id: "go-1.23.2",
    name: "Go",
    monacoLang: "go",
    defaultCode:
      'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  },
  {
    id: "swift-5.10.1",
    name: "Swift",
    monacoLang: "swift",
    defaultCode: 'print("Hello, World!")',
  },
  {
    id: "rust-1.82.0",
    name: "Rust",
    monacoLang: "rust",
    defaultCode: 'fn main() {\n    println!("Hello, World!");\n}',
  },
  {
    id: "ruby-3.3.11",
    name: "Ruby",
    monacoLang: "ruby",
    defaultCode: 'puts "Hello, World!"',
  },
];

/** Lookup by Wandbox compiler ID */
export const getLangConfig = (id: string) =>
  COMPILER_LANGUAGES.find((l) => l.id === id) ?? COMPILER_LANGUAGES[0];
