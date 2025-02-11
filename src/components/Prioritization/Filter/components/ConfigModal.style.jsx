import styled from "styled-components";

export const ConfigModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 50vh;
  overflow-y: auto;

  div.main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 5px;
    border-bottom: 1px solid #ccc;

    > div:nth-child(1) {
      width: 100%;
      padding-right: 20px;
    }

    > div:nth-child(2) {
      padding-right: 10px;
    }
  }

  div.detail {
    height: 0;
    max-height: 0;
    transition: max-height 0.5s ease-out;

    textarea {
      display: none;
    }

    &.active {
      padding: 10px;
      height: auto;
      max-height: 300px;

      textarea {
        display: block;
        min-height: 200px;
      }
    }
  }
`;
