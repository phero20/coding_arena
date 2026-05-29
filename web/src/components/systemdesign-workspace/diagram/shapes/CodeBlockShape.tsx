import {
  BaseBoxShapeUtil,
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  T,
  TLShapeId,
} from 'tldraw';
import { useRef } from 'react';

export interface CodeBlockShapeProps {
  w: number;
  h: number;
  code: string;
  language: string;
  fontSize: number;
}

export interface ICodeBlockShape {
  id: TLShapeId;
  type: 'code-block';
  props: CodeBlockShapeProps;
  [key: string]: any;
}

/**
 * Lightweight, high-speed Regex-based Syntax Highlighter tuned for Java and whiteboard presentation
 * Returns the raw string HTML to avoid wrapper element style pollution
 */
function getHighlightedHtml(code: string, language: string): string {
  if (!code) return '<span style="color: #6b7280; font-style: italic;">// Double click to write code...</span>';

  // Escape HTML characters
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Style comments
  html = html.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)/g, '<span style="color: #6b7280; font-style: italic;">$1</span>');

  // Style strings
  html = html.replace(/(['"`])(.*?)\1/g, '<span style="color: #38bdf8;">$1$2$1</span>');

  // Style keywords (Java, C++, JS, etc.)
  const keywords = /\b(public|private|protected|class|interface|enum|extends|implements|static|final|void|int|double|float|long|short|byte|char|boolean|if|else|for|while|do|switch|case|break|continue|return|new|this|super|throw|throws|try|catch|finally|import|package|const|let|var|function|def|struct|func)\b/g;
  html = html.replace(keywords, '<span style="color: #f43f5e; font-weight: bold;">$1</span>');

  // Style classes and types
  const types = /\b(String|System|Integer|Double|Float|Long|Boolean|Math|List|ArrayList|Map|HashMap|Set|HashSet|Override|Object)\b/g;
  html = html.replace(types, '<span style="color: #fbbf24;">$1</span>');

  // Style numbers
  html = html.replace(/\b(\d+)\b/g, '<span style="color: #c084fc;">$1</span>');

  // Style method calls
  html = html.replace(/\b(\w+)(?=\()/g, '<span style="color: #ea580c;">$1</span>');

  return html;
}

export class CodeBlockShapeUtil extends BaseBoxShapeUtil<any> {
  static override type = 'code-block' as const;

  static override props = {
    w: T.number,
    h: T.number,
    code: T.string,
    language: T.string,
    fontSize: T.number,
  };

  override canBind = () => true;
  override canEdit = () => true;
  override canResize = () => true;

  override getDefaultProps() {
    return {
      w: 360,
      h: 80,
      code: '',
      language: 'java',
      fontSize: 14,
    };
  }

  override getGeometry(shape: ICodeBlockShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: ICodeBlockShape) {
    const { w, h, code, language, fontSize } = shape.props;
    const isEditing = this.editor.getEditingShapeId() === shape.id;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const calculateAutoHeight = (codeText: string, currentFontSize: number) => {
      const lines = codeText.split('\n').length || 1;
      const codeHeight = lines * currentFontSize * 1.5;
      const padding = 24; // 12px top + 12px bottom
      const borders = 4;
      return codeHeight + padding + borders;
    };

    const handleCodeChange = (newCode: string) => {
      const autoHeight = calculateAutoHeight(newCode, fontSize);
      this.editor.updateShapes([
        {
          id: shape.id,
          props: {
            code: newCode,
            h: Math.max(autoHeight, h), // Grow block vertically as content expands
          },
        } as any,
      ]);
    };

    // Shared style sheet ensuring 100% pixel-perfect caret character alignment
    // Explicitly overrides margins, border styles, and text spacing properties
    const commonStyles: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      padding: '12px',
      fontFamily: 'Consolas, Monaco, "Courier New", Courier, monospace',
      fontSize: `${fontSize}px`,
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      boxSizing: 'border-box',
      border: '0px solid transparent',
      outline: 'none',
      letterSpacing: 'normal',
      textAlign: 'left',
      tabSize: 4,
    };

    return (
      <HTMLContainer id={shape.id}>
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#18181b',
            border: '2px solid #3f3f46',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'all',
          }}
          onPointerDown={(e) => {
            if (isEditing) {
              e.stopPropagation();
            }
          }}
        >
          {/* Code Workspace area */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              backgroundColor: '#18181b',
              overflow: 'hidden',
            }}
          >
            {isEditing ? (
              <>
                {/* Syntax Highlight layer - raw HTML insert to prevent element styling contamination */}
                <pre
                  style={{
                    ...commonStyles,
                    color: '#ffffff',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    zIndex: 1,
                  }}
                  dangerouslySetInnerHTML={{ __html: getHighlightedHtml(code, language) }}
                />

                {/* Interactive caret/editing layer */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const start = e.currentTarget.selectionStart;
                      const end = e.currentTarget.selectionEnd;
                      const val = e.currentTarget.value;
                      const newVal = val.substring(0, start) + '    ' + val.substring(end);
                      handleCodeChange(newVal);
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                        }
                      }, 0);
                    }
                  }}
                  autoFocus
                  spellCheck={false}
                  style={{
                    ...commonStyles,
                    backgroundColor: 'transparent',
                    color: 'transparent', // Hide plain text so background styles stand out
                    caretColor: '#ffffff', // Keep text insertion caret visible
                    resize: 'none',
                    overflow: 'hidden',
                    zIndex: 2,
                  }}
                />
              </>
            ) : (
              <pre
                style={{
                  ...commonStyles,
                  color: '#ffffff',
                  overflow: 'hidden',
                  userSelect: 'none',
                }}
                dangerouslySetInnerHTML={{ __html: getHighlightedHtml(code, language) }}
              />
            )}
          </div>
        </div>
      </HTMLContainer>
    );
  }

  getIndicatorPath(shape: ICodeBlockShape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, shape.props.h, 8);
    return path;
  }
}
