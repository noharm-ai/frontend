import styled from "styled-components/macro";

import { get } from "styles/utils";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: ${get("colors.commonLighter")};
  border: 1px solid ${get("colors.fifth")};
  border-radius: 5px;
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
  padding: 30px;
  text-align: center;
  transition: box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
  }
`;

export const Excerpt = styled.p`
  font-size: 16px;
  margin: ${({ margin }) => margin || 0};
`;
