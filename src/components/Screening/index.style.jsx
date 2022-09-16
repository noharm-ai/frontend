import styled from "styled-components/macro";

import Tabs from "components/Tabs";
import { get } from "styles/utils";

export const ScreeningTabs = styled(Tabs)`
  .ant-tabs-nav {
    width: 100%;
    margin: 0;
  }

  &.breaktab-2 {
    .ant-tabs-nav .ant-tabs-tab:nth-child(3) {
      margin-left: 50px !important;
    }
  }

  &.breaktab-3 {
    .ant-tabs-nav .ant-tabs-tab:nth-child(4) {
      margin-left: 50px !important;
    }
  }

  &.breaktab-4 {
    .ant-tabs-nav .ant-tabs-tab:nth-child(5) {
      margin-left: 50px !important;
    }
  }

  &.breaktab-5 {
    .ant-tabs-nav .ant-tabs-tab:nth-child(6) {
      margin-left: 50px !important;
    }
  }

  .ant-tabs-bar {
    margin-bottom: 0;
  }

  .ant-tabs-content {
    background: #fff;
    border-radius: 4px;
    box-shadow: 3px 0px 4px rgba(4, 0, 6, 0.15);
    min-height: 100px;
  }
`;

export const BoxWrapper = styled.section`
  background: ${get("colors.commonLighter")};
  border-radius: 4px;
  box-shadow: 3px 0px 4px rgba(4, 0, 6, 0.15);
  padding: 25px;
  padding-bottom: 5px;
`;

export const PrescriptionActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding-bottom: 15px;
`;

export const PeriodTags = styled.div`
  span {
    &:hover {
      background: #fff;
      font-weight: 700;
      transition: all 0.2s linear;
    }
  }
`;
