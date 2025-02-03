import styled from "styled-components/macro";
import breakpoints from "styles/breakpoints";
import { timingFunctions } from "polished";

import { get } from "styles/utils";

const getAlertColor = (type) => {
  switch (type) {
    case "green":
      return "#7CB342";
    case "yellow":
      return "#FDD835";
    case "orange":
      return "#FB8C00";
    case "red":
      return "#E53935";
    default:
      return "#959595";
  }
};

export const Card = styled.div`
  position: relative;
  background: #fff;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  transition: all 1s ${timingFunctions("easeOutQuint")};
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
  cursor: pointer;
  min-height: 18.125rem;
  font-size: 10px;

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
    box-shadow: 0px -2px 10px rgb(0 0 0 / 32%);

    .name {
      color: #1890ff;
    }
  }

  .card-header {
    display: flex;
    border-bottom: 1px solid #e0e0e0;

    .name {
      flex: 1;
      font-size: 1.6em;
      font-weight: 500;
      padding: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.3s linear;

      &.discharged {
        padding-bottom: 0.2rem;
        padding-top: 0.7rem;
      }

      .discharge {
        font-size: 0.75em;
        font-weight: 400;r
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .stamp {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 0.5rem;
      background: #fafafa;
      border-top-right-radius: 5px;
      border-bottom-left-radius: 5px;
      transition: all 0.3s linear;

      &.highlight {
        background-color: #70bdc4;

        .stamp-label {
          font-weight: 400;
          color: #fff;
        }

        .stamp-value {
          font-weight: 600;
          color: #fff;
        }
      }

      .stamp-label {
        font-size: 1.2em;
        font-weight: 300;
        color: ${get("colors.primary")};
        transition: all 0.3s linear;
      }

      .stamp-value {
        text-align: right;
        font-size: 1.4em;
        font-weight: 500;
        color: ${get("colors.primary")};
        transition: all 0.3s linear;
      }
    }

    .tags {
      .tag {
        display: inline-block;
        font-size: 11px;
        font-weight: 300;
        border-width: 1px;
        border-style: solid;
        border-radius: 5px;
        padding: 0 5px;
        margin-left: 5px;
        cursor: pointer;

        &:first-child {
          margin-left: 0;
        }
      }
    }
  }

  .attribute-container {
    &.border-bottom {
      border-bottom: 1px solid #e0e0e0;
    }
  }

  .attributes {
    display: flex;
    flex-wrap: wrap;
    border-top-left-radius: 0;
    border-bottom: 1px solid #e0e0e0;
    height: 100%;

    &:last-child {
      border-bottom: 0;
    }

    .attributes-item {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 0.5rem 1rem;

      overflow-x: clip;

      &.col-6 {
        width: 50%;
      }

      &.col-3 {
        width: 25%;
      }

      &.col-4 {
        width: 33.33333333%;
      }

      &.col-12 {
        width: 100%;
      }

      &:not(:last-child) {
        border-right: 1px solid #e0e0e0;
      }

      .attributes-item-label {
        font-size: 1.2em;
        font-weight: 300;
        color: ${get("colors.primary")};
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        margin-bottom: 0.2em;
      }

      .attributes-item-value {
        font-size: 1.2em;
        font-weight: 500;
        color: ${get("colors.primary")};
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        @media only screen and (min-width: 1400px) {
          font-size: 1.4em;
        }

        &.text {
          white-space: normal;
          font-weight: 400;
        }

        .small {
          font-size: 1.2em;
          font-weight: 300;
        }

        .hint {
          border-bottom: 2px dotted #999;
        }

        &.tags {
          padding: 10px 15px 10px 5px;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
      }
    }
  }

  .tabs {
    position: absolute;
    right: 0.5rem;
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

      &:last-child {
        margin-right: 0;
      }

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
  flex-wrap: wrap;
  padding-bottom: 0.5rem;
  min-height: 2.875rem;

  .alert {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px 0;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    text-align: center;
    font-weight: 500;
    min-width: 50px;
    font-size: 13px;
    border: 1px solid #f68c97;
    background: #f8dee2;
    margin-right: 0.3rem;
    margin-top: 0.5rem;

    @media (min-width: ${breakpoints.xxl}) {
      font-size: 14px;
      min-width: 60px;
      margin-right: 0.4rem;
    }

    span {
      margin-right: 2px;
    }
  }
`;
