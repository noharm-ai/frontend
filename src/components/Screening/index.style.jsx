import styled from "styled-components";
import { FloatButton } from "antd";
import { timingFunctions } from "polished";

import Tabs from "components/Tabs";
import { get } from "styles/utils";

export const ScreeningFloatButtonGroup = styled(FloatButton.Group)`
  > button {
    .ant-float-btn-body {
      background: #a991d6;
    }
  }
`;

export const ScreeningTabs = styled(Tabs)`
  .ant-tabs-nav {
    width: 100%;
    margin: 0;
    z-index: 1;
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
    min-height: 100px;
    padding-bottom: 5px;
  }

  .ant-tabs-tab {
    background: rgba(255, 255, 255, 0.5) !important;

    &.ant-tabs-tab-active {
      background: rgba(255, 255, 255, 1) !important;
    }
  }
`;

export const BoxWrapper = styled.section`
  background: ${get("colors.commonLighter")};
  border-radius: 4px;
  padding: 15px 12px;
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

export const DrugFormStatusBox = styled.div`
  position: fixed;
  right: 10rem;
  bottom: 1rem;
`;

export const TableLink = styled.a`
  color: rgba(0, 0, 0, 0.65);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const DrugLink = styled.a`
  display: inline-block;
  position: relative;
  color: rgba(0, 0, 0, 0.65);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &.missing-substance {
    &:after {
      position: absolute;
      content: "";
      left: 0;
      bottom: 0;
      height: 0;
      width: 100%;
      border: 1px dashed #ffa39e;
    }
  }
`;

export const TableTags = styled.div`
  display: flex;
  justify-content: space-evenly;

  span.tag {
    display: flex;
    align-items: center;
    width: 20px;
    cursor: pointer;

    &.gtm-tag-alert {
      width: 30px;
    }
  }
`;

export const ScreeningHeader = styled.div`
  margin-bottom: 15px;
  transition: all 0.5s ${timingFunctions("easeOutQuint")};

  &.affixed {
    background: rgba(255, 255, 255, 0.8);
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 3px;
    margin-bottom: 0;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    backdrop-filter: blur(8px);
  }
`;
