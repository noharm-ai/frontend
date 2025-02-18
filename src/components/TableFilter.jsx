import styled from "styled-components";

const TableFilter = styled.span`
  span {
    margin-left: 10px;
  }

  button span {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }

  button {
    margin-right: 10px;
    margin-bottom: 15px;
  }

  button.active {
    background-color: #eee;
  }
`;

export default TableFilter;
