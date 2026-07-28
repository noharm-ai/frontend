import styled from "styled-components";

/**
 * Read-only source pane. This is the single scroll container for the source;
 * CustomFormView renders a container with its own `max-height:80vh; overflow`,
 * which would produce a second, nested scrollbar — so we neutralize any direct
 * child's height/overflow and let this box own the scroll.
 */
export const SourceBox = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px 12px;
  background: #fafafa;

  & > div {
    max-height: none;
    overflow: visible;
  }
`;

/**
 * Makes the shared TipTap Editor fill this wrapper's height instead of its
 * built-in 300px cap, so the editable area matches the source column.
 *
 * The wrapper is a flex column; every div between it and the ProseMirror
 * editable must also be a shrinkable flex column (flex:1 + min-height:0),
 * otherwise the default `min-height:auto` lets the editable grow to its
 * content height and escape. We flex:
 *   - the Editor's own EditorContainer (`& > div`)
 *   - a possible EditorContent wrapper div (`& > div > div:not(.tiptap-menu):not(.tiptap)`)
 * and never set display:flex on `.tiptap` itself (that would break text flow).
 * `&&` bumps specificity so `max-height:none` beats the base 300px rule.
 */
export const EditorWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  & > div,
  & > div > div:not(.tiptap-menu):not(.tiptap) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  && .tiptap {
    flex: 1;
    min-height: 0;
    max-height: none;
  }
`;
