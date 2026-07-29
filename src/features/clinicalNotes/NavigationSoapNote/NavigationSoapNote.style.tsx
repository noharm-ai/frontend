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

export const SnippetsPanel = styled.div`
  width: 280px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--nh-border-color, #d9d9d9);
  border-radius: 6px;
  overflow: hidden;

  .panel-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .ant-collapse {
    border-radius: 0;
    border: none;
    border-bottom: none;
  }

  .ant-collapse-item {
    border-bottom: 1px solid var(--nh-border-color, #d9d9d9);
  }

  .ant-collapse-header {
    font-weight: 500;
    font-size: 13px;
  }

  .ant-collapse-content-box {
    padding: 4px 0;
  }
`;

export const SearchWrapper = styled.div`
  padding: 8px;
  border-bottom: 1px solid var(--nh-border-color, #d9d9d9);
`;

export const SnippetButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  color: var(--nh-text-color);
  line-height: 1.4;

  &:hover {
    background: #f0f5ff;
    color: var(--nh-primary-color, #1890ff);
  }

  &::before {
    content: "+ ";
    opacity: 0.5;
  }
`;
