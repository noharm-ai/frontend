import styled from "styled-components/macro";
import { timingFunctions } from "polished";

export const ChooseConciliationContainer = styled.div`
  .conciliation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid #e0e8ec;
    border-radius: 6px;
    margin-top: 15px;
    cursor: pointer;
    transition: all 1s ${timingFunctions("easeOutQuint")};

    &:hover {
      box-shadow: 0px 1px 4px 0px rgb(0 0 0 / 16%);
      border-color: #40a9ff;

      .anticon {
        color: #40a9ff;
      }
    }

    .date {
      font-weight: 500;
      font-size: 13px;
      margin-bottom: 5px;
    }

    .tag {
      margin-top: 10px;
    }
  }

  .action {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }

  .heading {
    margin-top: 15px;
  }
`;
