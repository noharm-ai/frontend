import styled from "styled-components";

import { get } from "styles/utils";

export const CenterLayout = styled.div`
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  aside {
    position: sticky;
    top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  main {
    min-width: 0;
  }

  @media (max-width: 992px) {
    grid-template-columns: 1fr;

    aside {
      position: static;
    }
  }
`;

export const TopicList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 8px;
  background: #fff;
  border-radius: 8px;

  button {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    padding: 6px 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: inherit;

    &:hover {
      background: #f5f5f5;
    }

    &.active {
      background: ${get("colors.primary")};
      color: #fff;
    }
  }

  .count {
    opacity: 0.6;
  }
`;

export const TopicSection = styled.section`
  margin-bottom: 28px;

  h2 {
    font-size: 16px;
    margin: 0 0 12px;

    .ant-btn-link {
      padding: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  &.related {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
`;

export const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
`;

export const ArticleCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover,
  &:focus-visible {
    border-color: ${get("colors.primary")};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .title {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-weight: 600;

    .anticon {
      color: #ff8845;
      margin-top: 4px;
    }

    .external {
      margin-left: auto;
      color: #8c8c8c;
    }
  }

  .description {
    color: #8c8c8c;
    font-size: 13px;
    padding-left: 22px;
  }
`;

export const ArticlePage = styled.article`
  padding: 24px 32px;
  background: #fff;
  border-radius: 8px;

  header {
    margin: 16px 0 20px;

    h1 {
      margin: 0;
      font-size: 24px;
    }

    .meta {
      color: #8c8c8c;
      font-size: 13px;
      margin-top: 4px;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;

      &:empty {
        display: none;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;
