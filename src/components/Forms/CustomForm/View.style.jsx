import styled from "styled-components";

export const CustomFormViewContainer = styled.div`
  padding: 15px;
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(143, 148, 153, 0.8) #ffffff;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #fff;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(143, 148, 153, 0.8);
  }

  .group {
    margin-bottom: 20px;

    h2 {
      border-bottom: 1px solid #ccc;
      font-size: 18px;
      margin-top: 0;
    }

    .question {
      margin-top: 15px;
      padding-left: 15px;

      .label {
        font-size: 16px;
        font-weight: 500;
      }

      .value {
        p:first-child {
          margin-top: 0;
        }
      }
    }
  }
`;
