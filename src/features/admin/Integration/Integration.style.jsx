import styled from "styled-components";
import { timingFunctions } from "polished";

export const IntegrationContainer = styled.div`
  .process-card {
    .ant-card-body {
      transition: all 0.3s ${timingFunctions("easeOutQuint")};
    }

    .ant-card-actions {
      transition: all 0.3s ${timingFunctions("easeOutQuint")};
    }

    &.loading {
      .ant-card-body {
        opacity: 0.5;
      }

      .ant-card-actions {
        background: #f0f0f0;
      }
    }
  }
`;
