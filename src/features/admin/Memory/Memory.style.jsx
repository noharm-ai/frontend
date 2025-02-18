import styled from "styled-components";

export const MemoryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 2rem;
  row-gap: 2rem;

  .box {
    position: relative;
    background: #fff;
    border-radius: 5px;
    padding: 1rem;

    h3 {
      margin-bottom: 5px;
      margin-top: 5px;
    }

    .box-legend {
      margin-bottom: 15px;
    }

    .loader {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
      opacity: 0;
      transition: all 0.3s ease-out;

      &.loading {
        opacity: 1;
        pointer-events: all;
      }
    }

    textarea {
      width: 100%;
      height: 15rem;
      padding: 0.5rem;

      &:focus {
        outline: none;
      }
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  }
`;
