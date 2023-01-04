import styled from "styled-components/macro";

import { get } from "styles/utils";
import Heading from "components/Heading";
import { createIndicatorCardClasses } from "components/Screening/ClinicalNotes/index.style";

export const Wrapper = styled.div`
  border: 1px solid ${get("colors.detail")};
  border-radius: 5px;
  overflow: hidden;
`;

export const Name = styled(Heading)`
  padding: 6px 15px;

  @media (max-width: 768px) {
    margin: 0;
  }
`;

export const NameWrapper = styled.div`
  transition: all 0.5s;
  background: ${(props) => (props.hasIntervention ? "#ffcdd2" : "#fff")};

  .btn-container {
    display: flex;
    justify-content: flex-end;

    > i {
      padding-top: 6px;
      margin-right: 7px;
    }
  }
`;

export const Box = styled.div`
  align-items: center;
  border-top: 1px solid ${get("colors.detail")};
  display: flex;
  min-height: 30px;
  padding: 3.5px 15px;

  strong {
    color: #2e3c5a;
  }

  &.recalc {
    display: flex;
    justify-content: center;
    text-align: center;
  }

  &.see-more {
    display: flex;
    justify-content: center;
    text-align: center;

    button {
      color: #696766;
      height: auto;
      padding-right: 2px;
    }

    button:hover span {
      text-decoration: underline;
    }

    .anticon-info-circle {
      color: #1890ff;
    }

    div.tags {
      display: inline-block;
      vertical-align: middle;
    }
  }

  &.experimental {
    .cell strong {
      color: #1890ff;
    }
  }

  .experimental-text {
    cursor: pointer;
    outline: none;
    color: #1890ff;
    border: 0;
    background: #fff;
  }
`;

export const SeeMore = styled.div`
  text-align: center;
  margin-top: 10px;

  .ant-btn-link {
    font-size: 18px;
  }
`;

export const PatientBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  .patient-header {
    display: flex;
    align-items: flex-start;
    padding-bottom: 5px;

    .patient-header-name {
      flex: 1;
      font-size: 18px;
      font-weight: 500;
      color: ${get("colors.primary")};
      transition: color 0.3s linear;

      &.has-intervention {
        color: rgb(207, 19, 34);
      }
    }

    .patient-header-action {
      display: flex;
      align-items: center;

      .patient-menu {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        outline: none;
        border: 0;
        padding: 0;
        cursor: pointer;

        &:hover {
          color: #1890ff;
        }
      }

      > i.anticon {
        display: flex;
        align-items: center;
        margin-right: 5px;
      }
    }
  }

  .patient-body {
    flex: 1;

    .patient-data {
      display: flex;
      flex-wrap: wrap;
      border-bottom: 1px solid #e0e0e0;
      border-left: 1px solid #e0e0e0;
      border-right: 1px solid #e0e0e0;
      border-radius: 5px;
      border-top-left-radius: 0;
      height: 100%;

      .patient-data-item {
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

        &.edit {
          &:hover {
            .patient-data-item-edit {
              opacity: 1;
              pointer-events: all;
              transform: translateX(0);
            }
          }
        }

        &:nth-child(odd) {
          border-right: 1px solid #e0e0e0;
        }

        .patient-data-item-label {
          font-size: 12px;
          font-weight: 300;
          color: ${get("colors.primary")};
        }

        .patient-data-item-value {
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

            ${(props) => createIndicatorCardClasses(props.t)}
          }

          .small {
            font-size: 12px;
            font-weight: 300;
          }

          .hint {
            border-bottom: 2px dotted #999;
          }
        }

        .patient-data-item-edit {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 20%;
          opacity: 0;
          pointer-events: none;
          background: #7ebe9a;
          transform: translateX(100%);
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          display: flex;
          align-items: center;
          justify-content: center;

          &.text {
            height: 40px;
            width: 40px;
          }
        }
      }

      .notes {
        padding: 10px;
        max-height: 220px;
        overflow: auto;
      }
    }

    .ant-tabs-bar {
      margin: 0;
    }

    .ant-tabs-nav .ant-tabs-tab .anticon {
      margin-right: 0;
    }

    .ant-tabs {
      display: flex;
      flex-direction: column;
      height: 100%;

      .ant-tabs-nav {
        margin: 0;
      }

      .ant-tabs-content {
        flex: 1;

        .ant-tabs-tabpane {
          height: 100%;

          &.ant-tabs-tabpane-inactive {
            height: 0;
          }
        }
      }
    }

    .ant-tabs-tab.ant-tabs-tab-active,
    .ant-tabs-tab:hover {
      .anticon {
        color: #1890ff;
      }
    }
  }
`;
