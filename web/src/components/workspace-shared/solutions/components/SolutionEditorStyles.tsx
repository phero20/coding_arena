import React from "react";

export const SolutionEditorStyles: React.FC = () => {
  return (
    <style jsx global>{`
      /* Fix EasyMDE for Dark Mode */
      .solution-editor-root .editor-toolbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: #0d0f12 !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 8px 12px;
      }
      .is-editing-mode .solution-editor-root .editor-toolbar {
        top: 40px; /* Offset when the 'Back to Solution' header is present */
      }
      .solution-editor-root .editor-toolbar button {
        color: rgba(255, 255, 255, 0.7) !important;
        border: 1px solid transparent;
        border-radius: 6px;
        width: 34px;
        height: 34px;
        margin-right: 4px;
        transition: all 0.2s;
      }
      .solution-editor-root .editor-toolbar button:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        color: var(--primary) !important;
      }
      .solution-editor-root .editor-toolbar button.active {
        background: var(--primary) !important;
        color: black !important; /* High contrast for active state */
        opacity: 1 !important;
        border-color: var(--primary) !important;
      }
      .solution-editor-root .editor-toolbar i.separator {
        border-left: 1px solid rgba(255, 255, 255, 0.15);
        margin: 0 10px;
      }
      .solution-editor-root .CodeMirror {
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-top: none !important;
        background: rgba(0, 0, 0, 0.2) !important;
        color: rgba(255, 255, 255, 0.95) !important;
        font-family: var(--font-mono), monospace;
        font-size: 14px;
        line-height: 1.7;
        border-radius: 0 0 8px 8px;
        padding: 16px;
        height: auto !important; /* Grow with content */
        min-height: 400px !important;
      }
      .solution-editor-root .CodeMirror-scroll {
        height: auto !important;
        min-height: 400px !important;
        overflow: visible !important; /* Let content grow */
      }
      .solution-editor-root .CodeMirror-cursor {
        border-left: 2px solid var(--primary) !important;
        opacity: 1 !important;
      }
      .solution-editor-root .CodeMirror-selected {
        background: #403d32 !important;
      }
      .solution-editor-root .CodeMirror-selectedtext {
        color: white !important;
      }

      /* Syntax Highlighting for the EDITOR (Write Mode) */
      .solution-editor-root .cm-header {
        color: var(--primary);
        font-weight: bold;
        font-size: 1.15em !important;
      }
      .solution-editor-root .cm-quote {
        color: #98c379;
        font-style: italic;
      }
      .solution-editor-root .cm-keyword {
        color: #c678dd;
      }
      .solution-editor-root .cm-atom {
        color: #d19a66;
      }
      .solution-editor-root .cm-number {
        color: #d19a66;
      }
      .solution-editor-root .cm-def {
        color: #61afef;
      }
      .solution-editor-root .cm-variable {
        color: #e06c75;
      }
      .solution-editor-root .cm-property {
        color: #61afef;
      }
      .solution-editor-root .cm-operator {
        color: #56b6c2;
      }
      .solution-editor-root .cm-comment {
        color: #5c6370;
        font-style: italic;
      }
      .solution-editor-root .cm-string {
        color: #98c379;
      }
      .solution-editor-root .cm-meta {
        color: #c678dd;
      }
      .solution-editor-root .cm-tag {
        color: #e06c75;
      }
      .solution-editor-root .cm-attribute {
        color: #d19a66;
      }
      .solution-editor-root .cm-link {
        color: var(--primary);
        text-decoration: underline;
      }

      .solution-editor-root .editor-preview-active-side,
      .solution-editor-root .editor-preview-active {
        background: #161a22 !important;
        color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        padding: 24px !important;
      }
      /* Manual Prose Overrides for Preview Accuracy */
      .solution-editor-root .editor-preview h1 {
        font-size: 2rem !important;
        font-weight: 800 !important;
        margin-top: 2.5rem !important;
        margin-bottom: 1.5rem !important;
        color: white !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.5rem;
        line-height: 1.2;
      }
      .solution-editor-root .editor-preview h1:first-child {
        margin-top: 0 !important;
      }
      .solution-editor-root .editor-preview h2 {
        font-size: 1.5rem !important;
        font-weight: 700 !important;
        margin-top: 2.5rem !important;
        margin-bottom: 1.25rem !important;
        color: white !important;
        border-left: 4px solid var(--primary);
        padding-left: 12px;
        line-height: 1.3;
      }
      .solution-editor-root .editor-preview p {
        margin-top: 1.25rem !important;
        margin-bottom: 1.25rem !important;
        line-height: 1.8 !important;
        color: rgba(255, 255, 255, 0.85) !important;
      }
      .solution-editor-root .editor-preview strong {
        font-weight: 800 !important;
        color: var(--primary) !important;
      }
      .solution-editor-root .editor-preview ul,
      .solution-editor-root .editor-preview ol {
        padding-left: 1.5rem !important;
        margin-top: 1.25rem !important;
        margin-bottom: 1.25rem !important;
        list-style: disc !important;
      }
      .solution-editor-root .editor-preview li {
        margin-bottom: 0.75rem !important;
        line-height: 1.6 !important;
      }
      .solution-editor-root .editor-preview li p {
        margin: 0.5rem 0 !important;
      }
      .solution-editor-root .editor-preview code {
        background: rgba(var(--primary-rgb), 0.1) !important;
        padding: 2px 6px !important;
        border-radius: 4px !important;
        font-family: var(--font-mono) !important;
        color: var(--primary) !important;
        font-size: 0.9em;
      }
      .solution-editor-root .editor-preview img {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 8px !important;
        margin: 2rem 0 !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
      .solution-editor-root .editor-preview h3 {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        margin-top: 2rem !important;
        margin-bottom: 1rem !important;
        color: rgba(255, 255, 255, 0.95) !important;
      }
      .solution-editor-root .editor-preview blockquote {
        border-left: 4px solid rgba(255, 255, 255, 0.2) !important;
        background: rgba(255, 255, 255, 0.03);
        padding: 1.25rem 1.75rem !important;
        margin: 2rem 0 !important;
        border-radius: 0 8px 8px 0;
        font-style: italic !important;
        color: rgba(255, 255, 255, 0.7) !important;
      }
      .solution-editor-root .editor-preview pre {
        background: #1a1b1e !important;
        padding: 1.5rem !important;
        border-radius: 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        margin: 1.5rem 0 !important;
        overflow-x: auto !important;
      }
      .solution-editor-root .editor-preview pre code {
        background: transparent !important;
        padding: 0 !important;
        color: #e3e3e3 !important;
        font-size: 0.85rem !important;
        line-height: 1.7 !important;
      }
      /* Re-apply Syntax Highlight for PRE tags in Preview */
      .solution-editor-root .editor-preview .cm-keyword {
        color: #c678dd !important;
      }
      .solution-editor-root .editor-preview .cm-variable {
        color: #e06c75 !important;
      }
      .solution-editor-root .editor-preview .cm-def {
        color: #61afef !important;
      }
      .solution-editor-root .editor-preview .cm-string {
        color: #98c379 !important;
      }
      .solution-editor-root .editor-preview .cm-comment {
        color: #5c6370 !important;
        font-style: italic !important;
      }
      .solution-editor-root .editor-preview .cm-number {
        color: #d19a66 !important;
      }

      .solution-editor-root .editor-statusbar {
        padding: 10px 16px;
        color: rgba(255, 255, 255, 0.3) !important;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      /* Fullscreen & Side-by-Side Fixes */
      .editor-toolbar.fullscreen,
      .CodeMirror-fullscreen {
        z-index: 1000 !important;
        background: #09090b !important;
      }

      /* Side-by-Side Mode Optimization */
      .solution-editor-root .CodeMirror-sided {
        width: 50% !important;
        border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      .solution-editor-root .editor-preview-side {
        width: 50% !important;
        background: #0d0f12 !important;
        border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
        z-index: 40 !important;
        position: fixed !important;
        top: auto !important;
        bottom: 0 !important;
        right: 0 !important;
        height: auto !important;
      }

      /* Fix toolbar in side-by-side */
      .solution-editor-root .editor-toolbar.sided {
        width: 100% !important;
        border-radius: 4px 4px 0 0 !important;
      }
    `}</style>
  );
};
