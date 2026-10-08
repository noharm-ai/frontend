import styled, { css } from "styled-components";

import colors from "styles/colors";
import { breakpointsEnum } from "styles/breakpoints";

const mobile = `@media (max-width: ${breakpointsEnum.md - 1}px)`;

const purple = "#a991d6";
const BADGE_SIZE = 56;
const BADGE_SIZE_MOBILE = 44;
/* the knowledge base hero's rendered height (its search box and suggestions
   make it taller); matching it keeps the corner shapes in the same proportion */
const HERO_HEIGHT = 341;
const HERO_HEIGHT_MOBILE = 358;

export const Hero = styled.section`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: ${HERO_HEIGHT}px;
  border-radius: 16px;
  padding: 48px 40px;
  margin-bottom: 32px;
  /* same look as the knowledge base hero (KnowledgeBaseHome.style Hero) */
  background: linear-gradient(135deg, #eef6f5 0%, #f7faf9 100%);
  color: ${colors.primary};

  /* a quarter circle anchored top-left, plus a half circle at the
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
    min-height: ${HERO_HEIGHT_MOBILE}px;
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
    width: 100%;
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
    background: ${purple};
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
    margin: 0;

    ${mobile} {
      font-size: 0.9rem;
    }
  }
`;

export const MonthGroup = styled.section`
  max-width: 920px;
  margin: 0 auto 12px;

  /* the month title only: news contents carry their own h2 */
  > h2 {
    margin: 0 0 16px;
    padding-left: ${BADGE_SIZE + 24}px;
    color: ${colors.text};
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;

    ${mobile} {
      padding-left: ${BADGE_SIZE_MOBILE + 14}px;
    }
  }
`;

export const Timeline = styled.ol`
  position: relative;
  max-width: 920px;
  margin: 0 auto 24px;
  padding: 0;
  list-style: none;

  /* the line joining the date badges */
  &::before {
    content: "";
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: ${BADGE_SIZE / 2 - 1}px;
    width: 2px;
    border-radius: 2px;
    background: linear-gradient(
      to bottom,
      ${colors.accentSecondary},
      ${colors.detail}
    );

    ${mobile} {
      left: ${BADGE_SIZE_MOBILE / 2 - 1}px;
    }
  }
`;

export const NewsItem = styled.li`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;

  ${mobile} {
    gap: 14px;
  }
`;

export const DateBadge = styled.div<{ $highlight?: boolean }>`
  position: relative;
  flex: 0 0 ${BADGE_SIZE}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${BADGE_SIZE}px;
  height: ${BADGE_SIZE}px;
  border: 2px solid ${colors.accentSecondary};
  border-radius: 50%;
  background: ${colors.commonLighter};
  color: ${colors.primary};
  /* a ring in the page background color cuts the timeline line */
  box-shadow: 0 0 0 5px #eff1f4;
  line-height: 1;

  .day {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .month {
    margin-top: 2px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  ${({ $highlight }) =>
    $highlight &&
    css`
      border-color: transparent;
      background: linear-gradient(
        135deg,
        ${colors.accentSecondary},
        ${colors.accent}
      );
      color: ${colors.commonLighter};
    `}

  ${mobile} {
    flex-basis: ${BADGE_SIZE_MOBILE}px;
    width: ${BADGE_SIZE_MOBILE}px;
    height: ${BADGE_SIZE_MOBILE}px;

    .day {
      font-size: 1rem;
    }
  }
`;

export const NewsCard = styled.article<{ $highlight?: boolean }>`
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 22px 28px;
  border-radius: 14px;
  background: ${colors.commonLighter};

  /* the notch pointing at the date badge */
  &::before {
    content: "";
    position: absolute;
    top: ${BADGE_SIZE / 2 - 7}px;
    left: -7px;
    width: 14px;
    height: 14px;
    background: inherit;
    transform: rotate(45deg);
    border-radius: 2px;
  }

  /* recent news carry an accent stripe on the left */
  box-shadow: 0 1px 2px rgba(46, 60, 90, 0.06);

  ${({ $highlight }) =>
    $highlight &&
    css`
      box-shadow:
        inset 4px 0 0 ${colors.accent},
        0 1px 2px rgba(46, 60, 90, 0.06);
    `}

  ${mobile} {
    padding: 18px 18px;

    &::before {
      top: ${BADGE_SIZE_MOBILE / 2 - 7}px;
    }
  }

  .news-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
    color: ${colors.text};
    font-size: 0.8rem;
  }

  .news-new {
    padding: 1px 10px;
    border-radius: 999px;
    background: ${purple};
    color: ${colors.commonLighter};
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h3 {
    margin: 0;
    color: ${colors.primary};
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .news-lead {
    margin: 8px 0 0;
    color: ${colors.text};
    font-size: 0.95rem;
    line-height: 1.55;
  }

  .news-content {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid ${colors.detail};
  }
`;

export const StateBox = styled.div`
  max-width: 920px;
  margin: 0 auto;
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
  }
`;

export const LoadMore = styled.div`
  max-width: 920px;
  margin: 0 auto 24px;
  text-align: center;
  color: ${colors.text};
  font-size: 0.875rem;

  .load-more-end {
    padding-left: ${BADGE_SIZE + 24}px;

    ${mobile} {
      padding-left: ${BADGE_SIZE_MOBILE + 14}px;
    }
  }
`;
