// Judge0 language ID → human-readable name
export const LANGUAGE_ID_TO_NAME: Record<string, string> = {
  '45': 'Assembly (NASM 2.14.02)',
  '46': 'Bash (5.0.0)',
  '47': 'Basic (FreeBasic 1.07.1)',
  '50': 'C (GCC 9.2.0)',
  '54': 'C++ (GCC 9.2.0)',
  '51': 'C# (Mono 6.6.0.161)',
  '60': 'Go (1.13.5)',
  '62': 'Java (OpenJDK 13.0.1)',
  '63': 'JavaScript (Node.js 12.14.0)',
  '70': 'Python (2.7.17)',
  '71': 'Python (3.8.1)',
  '72': 'Ruby (2.7.0)',
  '73': 'Rust (1.40.0)',
  '74': 'TypeScript (3.7.4)',
  '78': 'Kotlin (1.3.70)',
  '79': 'Objective-C (Clang 7.0.1)',
  '80': 'R (4.0.0)',
  '82': 'SQL (SQLite 3.27.2)',
  '83': 'Swift (5.2.3)',
  '85': 'Perl (5.28.1)',
  '86': 'Clojure (1.10.1)',
  '87': 'F# (Mono 6.6.0.161)',
  '88': 'Groovy (3.0.3)',
  '89': 'Scala (2.13.2)',
}

export const getLanguageName = (languageId: string): string =>
  LANGUAGE_ID_TO_NAME[languageId] ?? `Language ${languageId}`
