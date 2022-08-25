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
  will-change: transform;
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

  .name {
    font-size: 1.125rem;
    font-weight: 500;
    padding: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .attributes {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid #e0e0e0;
    border-radius: 5px;
    border-top-left-radius: 0;
    height: 100%;

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
    top: 100%;
    display: flex;

    .tab {
      padding: 0.5rem 0.6rem;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom-left-radius: 2px;
      border-bottom-right-radius: 2px;
      margin-right: 0.2rem;
      background: #fafafa;
      transition: background 0.3s linear;

      &.active {
        background: #fff;

        .anticon {
          color: #1890ff;
        }
      }

      &:hover {
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
