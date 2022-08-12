import styled from "styled-components/macro";

import { get } from "styles/utils";

const Heading = styled.h1`
  color: ${get("colors.primary")};
  display: block;
  font-family: ${get("fonts.primary")};
  font-size: ${({ size }) => size || "24px"};
  font-weight: ${get("weight.semiBold")};
  margin: ${({ margin }) => margin || 0};
  text-align: ${({ textAlign }) => textAlign || "left"};

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 15px;
    margin-top: 15px;
  }

  .legend {
    font-size: 15px;
    font-weight: 500;
    display: block;
    margin-top: 2px;
    margin-left: 2px;
  }

  .red {
    color: red;
  }
`;

export default Heading;
