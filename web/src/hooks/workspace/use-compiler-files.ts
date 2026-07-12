import { useCallback } from "react";
import { getLangConfig } from "@/constants/compiler-languages";
import { useCompilerStore } from "@/store/use-compiler-store";

const FILE_EXTENSIONS: Record<string, string> = {
  python: ".py",
  javascript: ".js",
  typescript: ".ts",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  csharp: ".cs",
  go: ".go",
  swift: ".swift",
  rust: ".rs",
  ruby: ".rb",
  plaintext: ".r" 
};

export function useCompilerFiles() {
  const { language, codeCache, setCode, setLanguage } = useCompilerStore();
  const monacoLanguage = getLangConfig(language).monacoLang;
  const currentCode = codeCache[language] ?? getLangConfig(language).defaultCode;

  const handleExport = useCallback(() => {
    const ext = FILE_EXTENSIONS[monacoLanguage] || ".txt";
    const blob = new Blob([currentCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `main${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentCode, monacoLanguage]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".py,.js,.ts,.java,.c,.cpp,.cs,.go,.swift,.rs,.rb,.r,.txt";
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) return;
        
        let targetLang = language;
        const fileName = file.name;
        if (fileName.endsWith(".py")) targetLang = "cpython-3.12.7";
        else if (fileName.endsWith(".js")) targetLang = "nodejs-20.17.0";
        else if (fileName.endsWith(".ts")) targetLang = "typescript-5.6.2";
        else if (fileName.endsWith(".java")) targetLang = "openjdk-jdk-21+35";
        else if (fileName.endsWith(".c")) targetLang = "gcc-13.2.0-c";
        else if (fileName.endsWith(".cpp")) targetLang = "gcc-13.2.0";
        else if (fileName.endsWith(".cs")) targetLang = "dotnetcore-8.0.402";
        else if (fileName.endsWith(".go")) targetLang = "go-1.23.2";
        else if (fileName.endsWith(".swift")) targetLang = "swift-5.10.1";
        else if (fileName.endsWith(".rs")) targetLang = "rust-1.82.0";
        else if (fileName.endsWith(".rb")) targetLang = "ruby-3.3.11";
        else if (fileName.endsWith(".r")) targetLang = "r-4.4.1";

        // Atomic update to the exact language cache
        setCode(targetLang, result);
        if (targetLang !== language) {
          setLanguage(targetLang);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }, [language, setCode, setLanguage]);

  return { handleExport, handleImport };
}
