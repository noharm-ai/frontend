import styled from "styled-components/macro";

export const DrugFormStatusContainer = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  border: 2px solid;
  font-weight: 500;
  background: ${(props) => (props.completed ? "#f6ffed" : "#fff7e6")};
  border-color: ${(props) => (props.completed ? "#b7eb8f" : "#ffd591")};
  color: ${(props) => (props.completed ? "#389e0d" : "#d46b08")};
  cursor: pointer;
  transition: all 0.3s linear;

  .drug-form-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-right: 10px;
  }

  .drug-form-status-action {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 10px;
    border-left: 1px solid;
    border-color: ${(props) => (props.completed ? "#b7eb8f" : "#ffd591")};
  }
`;
