import styled from "styled-components/macro";

import {
  createIndicatorTagClasses,
  createIndicatorCardClasses,
} from "components/Screening/ClinicalNotes/index.style";

export default styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 6px 15px;

  &.full-height {
    height: 100%;
  }

  h3.title {
    font-size: 18px;
    font-weight: 500;
    color: #2e3c5a;
    margin-top: 5px;
    margin-bottom: 10px;
    line-heigth: 1;
  }

  .content {
    flex: 1;

    .exam-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
      row-gap: 8px;

      @media only screen and (min-width: 1515px) {
        column-gap: 15px;
      }
    }

    .stat-number {
      position: absolute;
      top: 15%;
      right: 5%;
      font-size: 48px;
      font-weight: 300;
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
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ccc;

        &:last-child {
          border-bottom: none;
        }

        .date {
          font-size: 12px;
          font-weight: 400;
          margin-bottom: 2px;
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

    .stats {
      display: flex;
      align-items: center;

      &.light {
        font-weight: 400;
      }

      ${(props) => createIndicatorTagClasses(props.t)}
    }
  }

  ${(props) => createIndicatorCardClasses(props.t)}
`;
