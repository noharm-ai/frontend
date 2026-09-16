import styled from "styled-components";

import colors from "styles/colors";
import { breakpointsEnum } from "styles/breakpoints";
import { PageHeader } from "styles/PageHeader.style";

// the two-column layout collapses below antd's `lg` (Col lg applies at >= 992px)
const mobile = `@media (max-width: ${breakpointsEnum.lg - 1}px)`;

export const CentralHeader = styled(PageHeader)`
  ${mobile} {
    margin-bottom: 20px;

    .page-header-title {
      font-size: 24px;
    }
  }
`;

export const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const ProgressPanel = styled.div`
  background: ${colors.commonLighter};
  border-radius: 8px;
  padding: 24px 20px;
  text-align: center;

  h3 {
    color: ${colors.primary};
    font-size: 1rem;
    margin: 0 0 12px 0;
  }

  span {
    display: block;
    color: ${colors.text};
    font-size: 0.875rem;
    margin-top: 10px;
  }
`;

export const ProgressRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
`;

export const ProgressNote = styled.p`
  margin: 16px 0 0 0;
  padding-top: 16px;
  border-top: 1px solid ${colors.detail};
  color: ${colors.text};
  font-size: 0.8rem;
  text-align: left;
`;

export const ProgressGroup = styled.div`
  flex: 1;
  min-width: 0;

  .progress-label {
    display: block;
    color: ${colors.primary};
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 6px;
  }
`;

export const ModuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const ModuleRow = styled.div<{ $current: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 20px;
  border-radius: 8px;
  background: ${colors.commonLighter};
  border: 1px solid
    ${(props) => (props.$current ? colors.accentSecondary : colors.detail)};

  ${mobile} {
    /* icon + text on the first line, the action buttons on a second one */
    flex-wrap: wrap;
    gap: 12px 15px;
    padding: 16px;

    > .ant-btn {
      flex: 1 1 auto;
      height: 40px;
    }
  }
`;

export const ModuleIconCircle = styled.div<{
  $status: "completed" | "current";
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  color: ${colors.commonLighter};
  background: ${(props) =>
    props.$status === "completed" ? colors.accent : colors.accentSecondary};
`;

export const ModuleText = styled.div`
  flex: 1;
  min-width: 0;

  ${mobile} {
    /* fills the rest of the first line (icon 36px + gap 15px) so the buttons
       wrap below */
    flex-basis: calc(100% - 51px);
  }

  strong {
    display: block;
    color: ${colors.primary};
    font-size: 1rem;
    overflow-wrap: anywhere;
  }

  .mandatory-tag {
    display: inline-block;
    margin-left: 8px;
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    color: ${colors.commonLighter};
    background: ${colors.danger};
    vertical-align: middle;
  }

  span {
    display: block;
    color: ${colors.text};
    font-size: 0.875rem;
    margin-top: 2px;
  }
`;
