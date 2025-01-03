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

export default Heading;
