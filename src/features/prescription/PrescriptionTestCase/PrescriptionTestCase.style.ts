import styled from "styled-components";

export const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;

  .ant-card-body {
    padding: 12px 16px;
  }
`;

export const SideTitle = styled.div`
  color: #2e3c5a;
  font-weight: 600;
  margin-bottom: 8px;
`;

// up to 100 items: the links scroll, the column staying on screen
export const NavLinks = styled.div`
  max-height: calc(100vh - 220px);
  overflow-y: auto;
`;
