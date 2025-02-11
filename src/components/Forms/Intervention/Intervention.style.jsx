import styled from "styled-components";

import { get } from "styles/utils";

export const Box = styled.div`
  border-top: 1px solid ${get("colors.detail")};
  padding: 10px 0;
  width: 100%;

  label.fixed {
    width: 20%;
  }
`;

export const EditorBox = styled.div`
  .ck-content {
    min-height: 100px;
  }
`;

export const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  > * {
    margin-left: 5px;
  }

  .ant-dropdown-button {
    width: auto;
  }
`;

export const InterventionVariableContainer = styled.div`
  margin-top: 30px;

  .variables-title {
    font-weight: 600;
  }

  .variables-legend {
    font-weight: 300;
    font-size: 12px;
  }

  .variables-group {
    margin-top: 10px;

    .variables-group-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }
`;
