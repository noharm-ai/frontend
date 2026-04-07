import styled from "styled-components";

export const CarePlanLayout = styled.div`
  display: flex;
  gap: 16px;
  height: 60vh;
  min-height: 400px;
`;

export const SnippetsPanel = styled.div`
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--nh-border-color, #d9d9d9);
  border-radius: 6px;
  overflow: hidden;

  .ant-tabs-nav {
    margin: 0;
    padding: 0 8px;
    background: #fafafa;
    border-bottom: 1px solid var(--nh-border-color, #d9d9d9);
  }

  .panel-scroll {
    height: calc(60vh - 80px);
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

export const TemplateButton = styled.button`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid var(--nh-border-color, #d9d9d9);
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
  color: var(--nh-text-color);
  gap: 2px;

  .template-title {
    font-weight: 600;
    color: var(--nh-heading-color);
  }

  .template-desc {
    font-size: 12px;
    opacity: 0.65;
    line-height: 1.3;
  }

  &:hover {
    background: #f0f5ff;

    .template-title {
      color: var(--nh-primary-color, #1890ff);
    }
  }
`;

export const EditorPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--nh-border-color, #d9d9d9);
  border-radius: 6px;

  /* EditorContainer */
  > div {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: none;
    border-radius: 6px;
  }

  /* EditorContent wrapper div (Tiptap inserts an extra div between EditorContainer and .tiptap) */
  > div > div:not(.tiptap-menu) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .tiptap-menu {
    border-radius: 6px 6px 0 0;
    flex-shrink: 0;
  }

  .tiptap {
    flex: 1;
    min-height: 0 !important;
    max-height: unset !important;
    overflow-y: auto;
    border-radius: 0 0 6px 6px;
  }
`;
