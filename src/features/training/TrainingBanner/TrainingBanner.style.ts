import styled from "styled-components";

import { TRAINING_COLOR } from "../TrainingController/TrainingController.style";

export const Banner = styled.div`
  position: sticky;
  top: 0;
  z-index: 1091;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 16px;
  background: ${TRAINING_COLOR};
  color: #fff;
  font-weight: 500;

  .anticon {
    font-size: 18px;
  }
`;
