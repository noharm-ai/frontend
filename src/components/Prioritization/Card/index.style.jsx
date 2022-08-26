import styled from "styled-components/macro";
import { timingFunctions } from "polished";

import { get } from "styles/utils";

const getAlertColor = (type) => {
  switch (type) {
    case "green":
      return "#7ebe9a";
    case "yellow":
      return "#e4da66";
    case "orange":
      return "orange";
    case "red":
      return "#e46666";
    default:
      return "#ccc";
  }
};

export const Card = styled.div`
  position: relative;
  background: #fff;
  border-radius: 5px;
  border-bottom-left-radius: 0;
  transition: all 0.3s ${timingFunctions("easeOutQuint")};
  cursor: pointer;

  &:before {
    content: "";
    position: absolute;
    width: 100%;
    height: 5px;
    left: 0;
    top: 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background: ${({ alert }) => getAlertColor(alert)};
  }

  &:hover {
    .name {
      color: #1890ff;
    }
  }

  .card-header {
    display: flex;
    border-bottom: 1px solid #e0e0e0;

    .name {
      flex: 1;
      font-size: 1rem;
      font-weight: 500;
      padding: 1rem 0.5rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.3s linear;
    }

    .stamp {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 0.5rem;
      background: #fafafa;

      .stamp-label {
        font-size: 12px;
        font-weight: 300;
        color: ${get("colors.primary")};
      }

      .stamp-value {
        text-align: right;
        font-size: 14px;
        font-weight: 500;
        color: ${get("colors.primary")};
      }
    }
  }

  .attributes {
    display: flex;
    flex-wrap: wrap;
    border-radius: 5px;
    border-top-left-radius: 0;
    height: 100%;

    &.col-3 {
      .attributes-item {
        width: 25%;
      }
    }

    .attributes-item {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 50%;
      padding: 5px 0;
      padding-left: 10px;
      border-bottom: 1px solid #e0e0e0;
      overflow-x: clip;

      &.full {
        width: 100%;
        border-bottom: 0;
        border-right: 0 !important;
      }

      &:nth-child(odd) {
        border-right: 1px solid #e0e0e0;
      }

      .attributes-item-label {
        font-size: 12px;
        font-weight: 300;
        color: ${get("colors.primary")};
      }

      .attributes-item-value {
        font-size: 12px;
        font-weight: 500;
        color: ${get("colors.primary")};
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        @media only screen and (min-width: 1400px) {
          font-size: 14px;
        }

        &.text {
          white-space: normal;
          font-weight: 400;
        }

        .small {
          font-size: 12px;
          font-weight: 300;
        }

        .hint {
          border-bottom: 2px dotted #999;
        }
      }
    }
  }

  .tabs {
    position: absolute;
    left: 0;
    bottom: -2.2rem;
    z-index: -1;
    display: flex;

    .tab {
      padding: 1rem 0.8rem 0.5rem 0.8rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom-left-radius: 2px;
      border-bottom-right-radius: 2px;
      margin-right: 0.2rem;
      background: #fafafa;
      transition: all 0.3s ${timingFunctions("easeOutQuint")};

      &.active,
      &:hover {
        background: #fff;
        transform: translateY(5px);

        .anticon {
          color: #1890ff;
        }
      }

      .anticon {
        font-size: 1.125rem;
        transition: color 0.3s linear;
      }
    }
  }
`;

export const AlertContainer = styled.div`
  display: flex;
  padding: 0.5rem 0;

  .alert {
    padding: 3px 0;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    text-align: center;
    font-weight: 500;
    min-width: 60px;
    font-size: 14px;
    border: 1px solid #f68c97;
    background: #f8dee2;
    margin-right: 0.2rem;
  }
`;
