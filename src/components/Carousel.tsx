import styled from "styled-components";
import { Carousel as AntdCarousel, CarouselProps } from "antd";

export const Carousel: typeof AntdCarousel = styled(
  AntdCarousel
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
`;
