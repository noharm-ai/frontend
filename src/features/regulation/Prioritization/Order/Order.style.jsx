import styled from "styled-components";
import { timingFunctions } from "polished";

export const OrderContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .order-item {
    min-width: 10rem;
    margin-right: 0.5rem;

    .order-item-label {
      font-weight: 500;
    }

    .order-item-value {
      &.flex {
        display: flex;
      }

      .ant-select {
        width: 100%;

        .ant-tag {
          margin-left: 0.5rem;
        }
      }

      .prioritization-select {
        .ant-select-selector {
          background-color: #70bdc4;
        }

        .ant-select-selection-item {
          color: #fff;
          font-weight: 500;
        }

        .ant-select-arrow {
          color: #fff;
        }
      }

      .order-desc,
      .order-asc {
        transition: transform 0.3s ${timingFunctions("easeOutQuint")};
      }

      .order-desc {
        transform: rotate(180deg);
      }
    }
  }
`;
