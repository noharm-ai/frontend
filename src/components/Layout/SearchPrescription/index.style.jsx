import styled from "styled-components";
import { timingFunctions } from "polished";

import { get } from "styles/utils";

export const SearchPrescriptionContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 350px;
  display: flex;
  align-items: center;

  @media (min-width: ${get("breakpoints.lg")}) {
    max-width: 600px;
  }

  &.big {
    max-width: none;

    .ant-input-wrapper {
      .ant-input-affix-wrapper {
        input {
          font-size: 24px;
        }
      }
    }

    .ant-input-search-button {
      height: 53px;
      width: 53px;
    }
  }

  .ant-input-wrapper {
    .ant-input-affix-wrapper {
      background: #fafafa;

      input {
        background: #fafafa;

        &::placeholder {
          color: #2e3c5a;
          font-weight: 300;
        }
      }
    }
  }

  .search-result {
    position: absolute;
    left: 0;
    top: 100%;
    width: 100%;
    max-height: 300px;
    background: #fff;
    display: flex;
    flex-direction: column;
    z-index: 10;
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
    overflow-y: auto;
    box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
      0 9px 28px 8px rgb(0 0 0 / 5%);
    transition: all 0.5s ${timingFunctions("easeOutQuint")};

    &.open {
      opacity: 1;
      transform: translateY(-0);
      pointer-events: all;
    }

    > div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s linear;
      padding: 5px 15px;
      cursor: pointer;

      &:focus {
        outline: none;
      }

      &.active {
        background: #e6f7ff;

        .search-result-info-primary {
          color: #1890ff;
        }
      }

      &.not-found {
        align-self: center;
        cursor: default;

        &:hover {
          background: #fff;
        }
      }
    }

    .search-result-info {
      div {
        line-height: 1.5;
      }

      .search-result-info-primary {
        font-size: 1rem;
        font-weight: 500;
        color: #696766;
        transition: color 0.2s linear;

        span {
          font-weight: 300;
        }
      }

      .search-result-info-secondary {
        font-size: 0.875rem;
        font-weight: 400;
        color: #2e3c5a;
        margin-top: 5px;
      }
    }
  }
`;
