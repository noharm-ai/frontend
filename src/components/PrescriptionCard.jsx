import styled from "styled-components/macro";

import {
  createIndicatorTagClasses,
  createIndicatorCardClasses,
} from "components/Screening/ClinicalNotes/index.style";
import { get } from "styles/utils";

export default styled.div`
  position: relative;
  display: flex;
  flex-direction: column;

  border-radius: 5px;
  padding: 6px 15px;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
    0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);

  &.full-height {
    height: 100%;
  }

  h3.title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 400;
    color: #2e3c5a;
    margin-top: 5px;
    margin-bottom: 10px;
    line-heigth: 1;
  }

  .stat-marker {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 6px;
    width: 100%;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  .content {
    flex: 1;

    .exam-list {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr;
      column-gap: 10px;
      row-gap: 8px;

      @media (min-width: ${get("breakpoints.md")}) {
        grid-template-columns: 1fr 1fr;
      }

      @media only screen and (min-width: 1515px) {
        column-gap: 15px;
      }
    }

    .stat-number {
      position: absolute;
      top: 30%;
      right: 5%;
      font-size: 34px;
      font-weight: 300;
    }

    .stat-variation {
      .stat-variation-number {
        display: flex;
        align-items: center;
        font-size: 30px;
        font-weight: 300;

        .anticon {
          font-size: 30px;
          margin-left: 5px;
        }
      }

      .stat-variation-percentage {
        font-size: 13px;
      }
    }

    .text-content {
      max-height: 185px;
      overflow: auto;
      margin-top: 10px;
      min-height: 60px;
      font-weight: 500;

      &::-webkit-scrollbar-track {
        background-color: #f5f5f5;
        border-radius: 10px;
      }

      &::-webkit-scrollbar {
        width: 10px;
        background-color: #f5f5f5;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #2e3c5a;
        border: 2px solid #555555;
        border-radius: 10px;
      }

      .list-item {
        display: flex;
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ccc;

        > div:first-child {
          flex: 1;
        }

        &:last-child {
          border-bottom: none;
        }

        .date {
          font-size: 12px;
          font-weight: 400;
          margin-bottom: 2px;
        }
      }

      .text-link {
        padding-right: 10px;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    min-height: 31px;

    .action {
      &.bold {
        button {
          font-weight: 500;
        }
      }

      button {
        padding-right: 0;
      }
    }
  }

  .stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    &.light {
      font-weight: 400;
    }

    &.stats-center {
      max-width: 290px;
      margin: 0 auto;
    }

    ${(props) => createIndicatorTagClasses(props.t)}
  }

  ${(props) => createIndicatorCardClasses(props.t)}
`;
