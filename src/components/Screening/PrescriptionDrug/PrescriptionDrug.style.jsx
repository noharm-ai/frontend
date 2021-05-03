import styled from 'styled-components/macro';

import Collapse from '@components/Collapse';
import { get } from '@styles/utils';

export const Box = styled.div`
  border-top: 1px solid ${get('colors.detail')};
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

export const PrescriptionHeader = styled.div`
  display: inline-block;
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
`;

export const PrescriptionPanel = styled(Collapse.Panel)`
  background: #fafafa;
  margin-bottom: 10px;

  .ant-collapse-header {
    .panel-header {
      transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    }

    &:hover {
      .panel-header {
        transform: translateX(2px);
      }
    }

    .ant-collapse-extra {
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
`;

export const GroupPanel = styled(PrescriptionPanel)`
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
      content: ' ';
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
`;
