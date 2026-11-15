import styled from "styled-components";

import { get } from "styles/utils";

interface HeadingProps {
  $size?: string;
  $textAlign?: string;
  $margin?: string;
}

const Heading = styled.h1<HeadingProps>`
  color: ${get("colors.primary")};
  display: block;
  font-size: ${({ $size }) => $size || "18px"};
  font-weight: ${get("weight.semiBold")};
  text-align: ${({ $textAlign }) => $textAlign || "left"};

  @media (min-width: ${get("breakpoints.lg")}) {
    font-size: ${({ $size }) => $size || "30px"};
    margin: ${({ $margin }) => $margin || 0};
  }

  .legend {
    font-size: 14px;
    font-weight: 400;
    display: block;
    margin-top: 2px;
  }

  .red {
    color: red;
  }
`;

export const AffixedHeader = styled.h1<Pick<HeadingProps, "$margin">>`
  color: ${get("colors.primary")};
  display: block;
  font-size: 14px;
  font-weight: ${get("weight.semiBold")};

  @media (min-width: ${get("breakpoints.lg")}) {
    font-size: 18px;
    margin: ${({ $margin }) => $margin || 0};
  }

  .legend {
    font-size: 12px;
    font-weight: 300;
    display: block;
    margin-top: 2px;

    @media (min-width: ${get("breakpoints.lg")}) {
      font-size: 14px;
      margin: ${({ $margin }) => $margin || 0};
    }
  }
`;

export default Heading;
