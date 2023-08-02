import styled from "styled-components/macro";

export const SummaryContainer = styled.div`
  width: max(50vw, 700px);
  margin: 0 auto;
`;

export const SummaryPanel = styled.div`
  background: #fff;
  padding: 2em;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
  font-size: 18px;
  transition: all 0.5s linear;
  min-height: 4em;

  &.loading {
    display: flex;
    justify-content: center;
    min-height: 4em;
    align-items: center;
    opacity: 0.5;
  }

  &.error {
    background: #f8dee2;
    border: 1px solid #f68c97;
    display: flex;
    justify-content: center;
  }

  .group {
    display: flex;

    > div {
      width: 50%;
    }
  }

  .attribute {
    display: flex;
    flex-direction: column;
    margin-bottom: 1em;

    label {
      font-size: 0.875em;
      font-weight: 600;
    }

    span {
      font-size: 1em;
    }
  }
`;

export const SummaryHeader = styled.h2`
  color: #2e3c5a;
`;
