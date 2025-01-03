import styled from "styled-components/macro";

import { get } from "styles/utils";

const Heading = styled.h1`
  color: ${get("colors.primary")};
  display: block;
  font-size: ${({ size }) => size || "18px"};
  font-weight: ${get("weight.semiBold")};
  text-align: ${({ textAlign }) => textAlign || "left"};

  @media (min-width: ${get("breakpoints.lg")}) {
    font-size: ${({ size }) => size || "30px"};
    margin: ${({ margin }) => margin || 0};
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

export const AffixedHeader = styled.h1`
  color: ${get("colors.primary")};
  display: block;
  font-size: 14px;
  font-weight: ${get("weight.semiBold")};

  @media (min-width: ${get("breakpoints.lg")}) {
    font-size: 18px;
    margin: ${({ margin }) => margin || 0};
  }

  .legend {
    font-size: 12px;
    font-weight: 300;
    display: block;
    margin-top: 2px;

    @media (min-width: ${get("breakpoints.lg")}) {
      font-size: 14px;
      margin: ${({ margin }) => margin || 0};
    }
  }
`;

export default Heading;
