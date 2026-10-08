import styled from "styled-components";

import colors from "styles/colors";
import { breakpointsEnum } from "styles/breakpoints";

// the sidebar drops below the article under antd's `lg`
const mobile = `@media (max-width: ${breakpointsEnum.lg - 1}px)`;

export const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 0;
  border: 0;
  background: none;
  color: ${colors.primary};
  font-size: 0.875rem;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: ${colors.accentSecondary};
    outline: none;
  }
`;

export const ArticleShell = styled.article`
  padding: 40px 48px 48px;
  border-radius: 14px;
  background: ${colors.commonLighter};
  box-shadow: 0 1px 2px rgba(46, 60, 90, 0.06);

  ${mobile} {
    padding: 24px 18px 28px;
  }
`;

export const ArticleHeader = styled.header`
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${colors.detail};

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
  }

  .article-tag {
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(112, 189, 195, 0.14);
    color: ${colors.primary};
    font-size: 0.75rem;
    font-weight: 500;
  }

  h1 {
    color: ${colors.primary};
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.25;
    margin: 0;

    ${mobile} {
      font-size: 1.5rem;
    }
  }

  .article-lead {
    margin: 12px 0 0;
    color: ${colors.text};
    font-size: 1.05rem;
    line-height: 1.55;
  }

  .article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 16px;
    color: ${colors.text};
    font-size: 0.8rem;

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

export const ArticleBody = styled.div`
  max-width: 760px;
  color: #3d4556;
  font-size: 1rem;
  line-height: 1.75;

  h2 {
    scroll-margin-top: 24px;
    color: ${colors.primary};
    font-size: 1.35rem;
    font-weight: 600;
    line-height: 1.3;
    margin: 40px 0 12px;

    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    color: ${colors.primary};
    font-size: 1.1rem;
    font-weight: 600;
    margin: 28px 0 8px;
  }

  p {
    margin: 0 0 16px;
  }

  strong {
    color: ${colors.primary};
    font-weight: 600;
  }

  ul,
  ol {
    margin: 0 0 18px;
    padding-left: 22px;

    li {
      margin-bottom: 6px;
      padding-left: 4px;
    }

    li::marker {
      color: ${colors.accentSecondary};
    }
  }

  a {
    color: #2f8f97;
    text-decoration: underline;
    text-decoration-color: rgba(47, 143, 151, 0.35);
    text-underline-offset: 3px;

    &:hover {
      text-decoration-color: currentColor;
    }
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 24px auto;
    border: 1px solid ${colors.detail};
    border-radius: 10px;
    box-shadow: 0 6px 20px rgba(46, 60, 90, 0.08);
    cursor: zoom-in;
  }

  table {
    max-width: 100%;
    border-collapse: collapse;
    margin: 0 0 18px;

    td,
    th {
      padding: 6px 10px;
      border: 1px solid ${colors.detail};
    }
  }

  .kb-video {
    position: relative;
    margin: 24px 0;
    padding-top: 56.25%;
    border-radius: 12px;
    overflow: hidden;
    background: ${colors.commonDarker};

    iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  }
`;

export const Sidebar = styled.aside`
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${mobile} {
    position: static;
  }
`;

export const SidePanel = styled.section`
  padding: 20px;
  border-radius: 12px;
  background: ${colors.commonLighter};
  box-shadow: 0 1px 2px rgba(46, 60, 90, 0.06);

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    color: ${colors.primary};
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
`;

export const TocList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 2px solid ${colors.detail};

  button {
    display: block;
    width: 100%;
    margin-left: -2px;
    padding: 5px 0 5px 12px;
    border: 0;
    border-left: 2px solid transparent;
    background: none;
    color: ${colors.text};
    font-size: 0.85rem;
    line-height: 1.4;
    text-align: left;
    cursor: pointer;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover,
    &:focus-visible {
      color: ${colors.primary};
      outline: none;
    }

    &[aria-current="true"] {
      border-left-color: ${colors.accentSecondary};
      color: ${colors.primary};
      font-weight: 600;
    }
  }
`;

export const LinkList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;

  button {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: none;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;

    &:hover,
    &:focus-visible {
      background: #eff1f4;
      outline: none;
    }
  }

  .link-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    font-size: 0.9rem;
    background: rgba(112, 189, 195, 0.14);
    color: ${colors.accentSecondary};

    &.lesson {
      background: rgba(126, 190, 154, 0.18);
      color: ${colors.accent};
    }
  }

  .link-text {
    flex: 1;
    min-width: 0;

    strong {
      display: block;
      color: ${colors.primary};
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.35;
    }

    span {
      display: block;
      margin-top: 2px;
      color: ${colors.text};
      font-size: 0.75rem;
      line-height: 1.35;
    }
  }
`;

export const ImagePreview = styled.img`
  display: block;
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
`;

export const StateBox = styled.div`
  padding: 48px 20px;
  border-radius: 12px;
  background: ${colors.commonLighter};
  text-align: center;

  strong {
    display: block;
    color: ${colors.primary};
    font-size: 1.05rem;
    margin-bottom: 6px;
  }

  span {
    display: block;
    color: ${colors.text};
    font-size: 0.875rem;
    margin-bottom: 16px;
  }
`;
