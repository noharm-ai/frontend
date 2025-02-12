import styled from "styled-components";

export const MaxDoseReferenceContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;

  .ref-item {
    display: grid;
    grid-template-columns: 6.5rem 7rem 10rem 4rem;
    border-bottom: 1px solid rgba(5, 5, 5, 0.2);
  }

  .ref-item:last-child {
    border-bottom: 0;
  }

  .ref-label {
    display: flex;
    align-items: center;
    font-weight: 300;
  }

  .ref-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    text-align: right;
    font-weight: 400;

    .empty {
      color: red;
    }
  }

  .ref-unit {
    display: flex;
    align-items: center;
    font-weight: 400;
    padding-left: 0.3rem;
  }

  .ref-action {
    padding: 0.5rem 0;
  }
`;

export const ConversionDetailsPopover = styled.div`
  display: flex;
  align-items: center;
`;
