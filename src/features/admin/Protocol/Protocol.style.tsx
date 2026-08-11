import styled from "styled-components";

import { PageHeader } from "styles/PageHeader.style";

export const StickyPageHeader = styled(PageHeader)`
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 20px;
  padding: 16px 0;
  background: #eff1f4;

  transition:
    padding 0.2s ease,
    box-shadow 0.2s ease;

  .page-header-title {
    transition: font-size 0.2s ease;
  }

  &.is-stuck {
    padding: 8px 5px;
    box-shadow: 0 4px 12px rgba(46, 60, 90, 0.12);

    .page-header-title {
      font-size: 22px;
    }
  }
`;

export const VariableContainer = styled.div`
  padding: 1rem;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;

  .variable-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .variable-heading {
    min-width: 0;
  }

  .variable-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .variable-summary {
    display: block;
    overflow: hidden;
    font-size: 12px;
    color: #999;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const VariableGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: 1440px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
`;

export const EditorLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 520px;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: minmax(0, 1fr) 440px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

export const FormSection = styled.div`
  margin-bottom: 2rem;

  .form-section-title {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
  }
`;

export const StepsCard = styled.div`
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;

  .ant-steps-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px !important;
    height: 40px !important;
    font-size: 17px !important;
    color: #999 !important;
    background: #f5f5f5 !important;
    border-radius: 50%;
    transition:
      background 0.2s ease,
      color 0.2s ease;
  }

  .ant-steps-item-title {
    font-weight: 600;
  }

  .ant-steps-item-description {
    font-size: 12px;
  }

  .ant-steps-item-process .ant-steps-item-icon {
    color: #fff !important;
    background: #1677ff !important;
  }

  .ant-steps-item-finish .ant-steps-item-icon {
    color: #1677ff !important;
    background: #e6f4ff !important;
  }

  .ant-steps-item-error .ant-steps-item-icon {
    color: #ff4d4f !important;
    background: #fff2f0 !important;
  }

  .ant-steps-item:not(.ant-steps-item-process):hover .ant-steps-item-icon {
    color: #1677ff !important;
    background: #e6f4ff !important;
  }
`;

export const TriggerLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;

  .trigger-result {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 6px;

    .trigger-result-title {
      margin: 0 0 0.75rem;
      font-size: 14px;
      font-weight: 600;
    }
  }

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const SidePanelStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 1rem;
  align-self: start;
  max-height: calc(100vh - 2rem);

  @media (max-width: 992px) {
    position: static;
    max-height: none;
  }
`;

export const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 1 auto;
  min-height: 0;
  padding: 1rem 1.5rem;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;

  .side-panel-title {
    flex-shrink: 0;
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
  }

  .side-panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .side-panel-tabs {
    .ant-tabs-nav {
      margin-bottom: 1rem;
    }
  }

  @media (max-width: 992px) {
    flex: none;

    .side-panel-body {
      overflow-y: visible;
    }
  }
`;
