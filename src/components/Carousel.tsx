import styled from "styled-components";
import { Carousel as AntdCarousel, CarouselProps } from "antd";

export const Carousel: typeof AntdCarousel = styled(
  AntdCarousel
)<CarouselProps>`
  .slick-dots {
    bottom: -20px;

    li {
      button {
        height: 5px;
        background: #454545;
      }
    }

    li.slick-active {
      button {
        height: 5px;
        background: #454545;
      }
    }
  }
`;
