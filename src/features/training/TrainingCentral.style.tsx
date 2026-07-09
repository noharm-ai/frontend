import styled from "styled-components";

import colors from "styles/colors";

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
`;

export const ModuleIconCircle = styled.div<{
  $status: "completed" | "current" | "locked";
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
  background: ${(props) => {
    if (props.$status === "completed") return colors.accent;
    if (props.$status === "current") return colors.accentSecondary;
    return colors.fifth;
  }};
`;

export const ModuleText = styled.div`
  flex: 1;

  strong {
    display: block;
    color: ${colors.primary};
    font-size: 1rem;
  }

  span {
    display: block;
    color: ${colors.text};
    font-size: 0.875rem;
    margin-top: 2px;
  }
`;

export const ModuleAction = styled.div<{
  $status: "completed" | "current" | "locked";
}>`
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => {
    if (props.$status === "completed") return colors.accent;
    if (props.$status === "locked") return colors.fourth;
    return colors.text;
  }};
`;

export const BadgesPanel = styled.div`
  background: ${colors.commonLighter};
  border-radius: 8px;
  padding: 24px 20px;
  text-align: center;

  .anticon {
    font-size: 28px;
    color: ${colors.fifth};
    margin-bottom: 10px;
  }

  h3 {
    color: ${colors.primary};
    font-size: 1rem;
    margin: 0 0 6px 0;
  }

  p {
    color: ${colors.text};
    font-size: 0.875rem;
    margin: 0;
  }
`;
