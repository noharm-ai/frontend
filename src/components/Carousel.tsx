import styled, { css } from "styled-components";
import { Carousel as AntdCarousel, CarouselProps } from "antd";

import { highContrastTokens } from "styles/highContrast";

export const Carousel: typeof AntdCarousel = styled(
  AntdCarousel,
)<CarouselProps>`
  .slick-dots {
    bottom: -30px;

    li {
      height: 15px;
      button {
        height: 15px;
        border: 1px solid #1677ff;
        font-size: 10px;
        color: #1677ff;
        opacity: 0.5;

        &:hover {
          opacity: 1;
        }

        &:after {
          display: none;
        }
      }
      &:after {
        display: none;
      }
    }

    li.slick-active {
      button {
        height: 15px;
        font-size: 10px;
        border: 1px solid #1677ff;
        color: #1677ff;
        opacity: 1;

        &:after {
          display: none;
        }
      }
    }
  }

  /* High contrast preference: solid dots in a darker blue, the active one
  filled. */
  ${({ theme }) =>
    theme.highContrast &&
    css`
      .slick-dots li button,
      .slick-dots li.slick-active button {
        border-color: ${highContrastTokens.colorPrimary};
        color: ${highContrastTokens.colorPrimary};
        background: #fff;
        opacity: 1;
      }

      .slick-dots li.slick-active button {
        color: #fff;
        background: ${highContrastTokens.colorPrimary};
      }
    `}
`;
