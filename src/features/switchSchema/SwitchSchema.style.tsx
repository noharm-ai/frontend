import styled from "styled-components";

export const SwitchSchemaContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #eff1f4;
  height: 100vh;

  > svg {
    margin-bottom: 2rem;
  }

  form {
    width: min(500px, 90%);
  }

  .ant-card-head-title {
    color: #696766;
  }

  .ant-btn {
    margin-top: 2rem;
    font-size: 1.4em;
    height: 50px;
  }
`;
