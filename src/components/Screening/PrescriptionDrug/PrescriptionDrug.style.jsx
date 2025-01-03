import styled from "styled-components/macro";
import { timingFunctions } from "polished";

import Collapse from "components/Collapse";
import { get } from "styles/utils";
import breakpoints from "styles/breakpoints";

export const Box = styled.div`
  border-top: 1px solid ${get("colors.detail")};
  padding: 10px 0;

  label.fixed {
    width: 20%;
  }
`;

export const EditorBox = styled.div`
  .ck-content {
    min-height: 200px;
  }
`;

export const ToolBox = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 15px;

  @media (min-width: ${breakpoints.md}) {
    flex-direction: row;
  }

  .filters {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    min-height: 32px;

    .add-filter {
      background-color: #7ebe9a;
      border-color: #7ebe9a;
      border-style: dashed;
      color: #fff;
      cursor: pointer;
      transition: background 0.3s linear;

      &:hover {
        background: #4096ff;
      }
    }

    .ant-tag {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
  }

  .viz-mode {
    display: flex;
    flex-wrap: wrap;

    @media (min-width: ${breakpoints.md}) {
      flex-wrap: nowrap;
    }

    .btn-order {
      transition: transform 0.3s ${timingFunctions("easeOutQuint")};

      &.order-desc {
        transform: rotate(180deg);
      }
    }

    .ant-dropdown-button {
      width: 200px;

      .ant-btn-compact-first-item {
        flex: 1;
      }
    }

    button {
      margin-bottom: 8px;
    }
  }
`;

export const PrescriptionHeader = styled.div`
  display: flex;
  align-items: center;

  .panel-header-description {
    padding-left: 15px;

    div > span {
      padding-left: 15px;
    }

    .p-number {
      padding-right: 10px;
    }

    a {
      color: rgba(0, 0, 0, 0.65);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .title {
      font-size: 16px;
    }

    .subtitle {
      opacity: 0.6;
    }

    .expired {
      color: rgb(207, 19, 34);
    }
  }
`;

export const PrescriptionCollapse = styled(Collapse)`
  > .ant-collapse-item {
    background: #fafafa;
    margin-bottom: 10px;
    transition: background 0.3s linear;

    .ant-collapse-header {
      align-items: center;

      .panel-header {
        transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
      }

      &:hover {
        .panel-header {
          transform: translateX(2px);
        }
      }

      .ant-collapse-extra {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;

        > div {
          margin-left: 10px;
        }

        .tag-badge {
          margin-right: 0;
        }

        .ant-badge-dot {
          background: #f57f17;
        }

        .ant-badge,
        .anticon {
          margin-left: 5px;
        }

        .ant-btn {
          color: rgba(0, 0, 0, 0.65);
        }
      }
    }

    &.checked {
      background: #dcedc8;
    }

    .ant-collapse-content {
      background: #fff !important;
    }

    & > .ant-collapse-content > .ant-collapse-content-box {
      padding-right: 2px;
      padding-left: 2px;
    }
  }
`;

export const GroupCollapse = styled(PrescriptionCollapse)`
  > .ant-collapse-item {
    background: #e0e8ec;
    border-bottom: 0 !important;

    &.checked {
      & > .ant-collapse-content {
        border-left: 2px solid #dcedc8;
      }

      & > .ant-collapse-content > .ant-collapse-content-box {
        &::after {
          background: #dcedc8;
        }
      }
    }

    .ant-collapse-content-active {
      padding-top: 15px;
    }

    & > .ant-collapse-content > .ant-collapse-content-box {
      padding-right: 0;
      padding-left: 10px;

      position: relative;

      &::after {
        position: absolute;
        content: " ";
        width: 20px;
        height: 3px;
        bottom: 0;
        left: -10px;
        background: #e0e8ec;
      }
    }

    & > .ant-collapse-content {
      background: #fff !important;
      border-left: 3px solid #e0e8ec;
      border-radius: 0;
    }
  }
`;

export const InterventionListContainer = styled.div`
  .intervention {
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

    .description {
      font-size: 14px;
    }

    .tag {
      margin-top: 10px;
    }
  }

  .action {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
  }
`;

export const DrugAlertsCollapse = styled(Collapse)`
  border: 1px solid #ffccc7 !important;
  background: #fff2f0;

  .ant-collapse-item {
    &.high {
      .tag {
        background: #f44336;
        border-color: #f44336;
        color: #fff;
      }
    }

    &.medium {
      .tag {
        background: #f57f17;
        border-color: #f57f17;
        color: #fff;
      }
    }

    &.low {
      .tag {
        background: #ffc107;
        border-color: #ffc107;
        color: #fff;
      }
    }

    .ant-collapse-header {
      align-items: center;
      padding: 12px 10px;
    }
  }

  .ant-collapse-content.ant-collapse-content-active {
    padding-top: 0;

    .ant-collapse-content-box {
      padding-left: 35px;
    }
  }
`;

export const AlertTagsContainer = styled.div`
  .ant-tag {
    margin-right: 5px !important;
    font-size: 14px;
  }
`;
