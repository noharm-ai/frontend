import styled from "styled-components";

import { PageHeader } from "styles/PageHeader.style";

export const StickyPageHeader = styled(PageHeader)`
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 20px;
  padding: 16px 0;
  background: #eff1f4;
  border-bottom: 1px solid #e0e3e9;
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

  .variable-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
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
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 2rem;
  align-items: start;

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

export const SidePanelStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 0;
  align-self: start;
  max-height: calc(100vh - 1rem);
  overflow-y: auto;

  @media (max-width: 992px) {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
`;

export const SidePanel = styled.div`
  padding: 1rem 1.5rem;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;

  .side-panel-title {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
  }
`;
