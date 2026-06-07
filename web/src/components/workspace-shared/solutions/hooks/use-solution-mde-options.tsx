import { useMemo } from "react";
import ReactDOMServer from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const useSolutionMdeOptions = () => {
  return useMemo(() => {
    return {
      autofocus: true,
      spellChecker: false,
      placeholder: "Write your solution...",
      status: ["lines", "words"] as any,
      minHeight: "400px",
      renderingConfig: {
        singleLineBreaks: true,
        codeSyntaxHighlighting: true,
      },
      toolbarSticky: false,
      previewRender: (plainText: string) => {
        return ReactDOMServer.renderToString(
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {plainText}
            </ReactMarkdown>
          </div>,
        );
      },
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        {
          name: "code",
          action: (editor: any) => {
            const cm = editor.codemirror;
            const selection = cm.getSelection();
            const text = selection || "// write your java code here";
            cm.replaceSelection("```java\n" + text + "\n```");
          },
          className: "fa fa-code",
          title: "Code Block (Java)",
        },
        "|",
        "preview",
      ] as any,
      shortcuts: {
        toggleFullScreen: null,
      },
    };
  }, []) as any;
};
