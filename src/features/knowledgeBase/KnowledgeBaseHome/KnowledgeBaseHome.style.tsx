import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

import colors from "styles/colors";
import { breakpointsEnum } from "styles/breakpoints";

const mobile = `@media (max-width: ${breakpointsEnum.md - 1}px)`;

export const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 48px 40px 40px;
  margin-bottom: 28px;
  /* same look as the training video cover (TrainingPlayer.style VideoCover) */
  background: linear-gradient(135deg, #eef6f5 0%, #f7faf9 100%);
  color: ${colors.primary};

  /* the cover's quarter circle, anchored top-left, plus a half circle at the
     bottom-right; both sized to stay clear of the centered text */
  &::before,
  &::after {
    content: "";
    position: absolute;
    background: linear-gradient(
      135deg,
      ${colors.accentSecondary},
      ${colors.accent}
    );
  }

  &::before {
    top: 0;
    left: 0;
    width: 24%;
    height: 80%;
    border-radius: 0 0 100% 0;
  }

  /* centered on the bottom edge: the hero clips its lower half */
  &::after {
    right: 60px;
    bottom: -100px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
  }

  ${mobile} {
    padding: 28px 18px 24px;
    border-radius: 12px;

    &::before {
      width: 26%;
      height: 22%;
    }

    &::after {
      right: 8px;
      bottom: -32px;
      width: 64px;
      height: 64px;
    }
  }

  .hero-inner {
    position: relative;
    max-width: 760px;
    margin: 0 auto;
    text-align: center;
  }

  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    background: #a991d6;
    color: ${colors.commonLighter};
    box-shadow: 0 1px 3px rgba(46, 60, 90, 0.1);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h1 {
    color: ${colors.primary};
    font-size: 2.1rem;
    font-weight: 600;
    line-height: 1.2;
    margin: 14px 0 8px;

    ${mobile} {
      font-size: 1.5rem;
    }
  }

  .hero-subtitle {
    color: ${colors.text};
    font-size: 1rem;
    margin: 0 0 26px;

    ${mobile} {
      font-size: 0.9rem;
      margin-bottom: 18px;
    }
  }
`;

export const SearchBox = styled.div`
  .ant-input-affix-wrapper {
    height: 56px;
    padding: 0 18px;
    border: 0;
    border-radius: 14px;
    box-shadow: 0 10px 28px rgba(46, 60, 90, 0.14);
    font-size: 1.05rem;

    ${mobile} {
      height: 48px;
      font-size: 0.95rem;
    }
  }

  .ant-input-prefix {
    margin-right: 12px;
    color: ${colors.accentSecondary};
    font-size: 1.25rem;
  }
`;

export const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 0.8rem;
  color: ${colors.text};

  button {
    padding: 4px 12px;
    border: 1px solid ${colors.detail};
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.7);
    color: ${colors.primary};
    font-size: 0.8rem;
    cursor: pointer;
    transition:
      background 0.2s,
      border-color 0.2s;

    &:hover,
    &:focus-visible {
      background: ${colors.commonLighter};
      border-color: ${colors.accentSecondary};
      outline: none;
    }
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  h2 {
    color: ${colors.primary};
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0;
  }

  .section-count {
    color: ${colors.text};
    font-size: 0.85rem;
    white-space: nowrap;
  }
`;

export const Categories = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
`;

export const CategoryChip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid
    ${(props) => (props.$active ? colors.primary : colors.detail)};
  background: ${(props) =>
    props.$active ? colors.primary : colors.commonLighter};
  color: ${(props) => (props.$active ? colors.commonLighter : colors.primary)};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover,
  &:focus-visible {
    border-color: ${colors.primary};
    outline: none;
  }

  .chip-count {
    min-width: 20px;
    padding: 0 6px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 18px;
    text-align: center;
    background: ${(props) =>
      props.$active ? "rgba(255, 255, 255, 0.2)" : "#eff1f4"};
  }
`;

const articleCard = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: ${colors.commonLighter};
  box-shadow: 0 1px 2px rgba(46, 60, 90, 0.06);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    border-color: rgba(112, 189, 195, 0.6);
    box-shadow: 0 10px 24px rgba(46, 60, 90, 0.1);
    outline: none;

    .card-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(112, 189, 195, 0.14);
    color: ${colors.accentSecondary};
    font-size: 1.05rem;
  }

  .card-title {
    flex: 1;
    min-width: 0;
    color: ${colors.primary};
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .card-arrow {
    color: ${colors.accentSecondary};
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.2s;
  }

  .card-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 10px 0 0;
    color: ${colors.text};
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .card-snippet {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 10px 0 0;
    padding-left: 12px;
    border-left: 3px solid rgba(112, 189, 195, 0.5);
    color: ${colors.text};
    font-size: 0.85rem;
    line-height: 1.55;

    mark {
      padding: 0 2px;
      border-radius: 3px;
      background: rgba(126, 190, 154, 0.3);
      color: inherit;
    }
  }

  .card-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: auto;
    padding-top: 14px;
  }

  .card-tag {
    padding: 1px 8px;
    border-radius: 6px;
    background: #eff1f4;
    color: ${colors.primary};
    font-size: 0.72rem;
  }

  .card-external {
    margin-left: auto;
    color: ${colors.text};
    font-size: 0.75rem;
  }
`;

export const ArticleCard = styled(Link)`
  ${articleCard}
`;

// external articles (no content here yet) open the old copy in a new tab
export const ExternalArticleCard = styled.a`
  ${articleCard}
`;

export const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const RelevanceBadge = styled.span<{ $level: "high" | "medium" }>`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${(props) =>
    props.$level === "high"
      ? "rgba(126, 190, 154, 0.22)"
      : "rgba(112, 189, 195, 0.16)"};
  color: ${colors.primary};
`;

export const HelpBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 32px;
  padding: 22px 24px;
  border-radius: 12px;
  background: ${colors.commonLighter};
  border: 1px dashed ${colors.detail};

  ${mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .help-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(126, 190, 154, 0.18);
    color: ${colors.accent};
    font-size: 1.3rem;
  }

  .help-text {
    flex: 1;

    strong {
      display: block;
      color: ${colors.primary};
      font-size: 1rem;
    }

    span {
      color: ${colors.text};
      font-size: 0.875rem;
    }
  }
`;

export const StateBox = styled.div`
  padding: 40px 20px;
  border-radius: 12px;
  background: ${colors.commonLighter};
  text-align: center;

  strong {
    display: block;
    color: ${colors.primary};
    font-size: 1rem;
    margin-bottom: 4px;
  }

  span {
    color: ${colors.text};
    font-size: 0.875rem;
  }
`;
