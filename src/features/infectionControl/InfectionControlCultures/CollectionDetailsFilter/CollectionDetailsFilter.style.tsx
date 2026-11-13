import styled from "styled-components";

// the secondary filters, one under the other, in the popover
export const DetailsForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 280px;

  .details-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .details-label {
    color: #595959;
    font-size: 12px;
    font-weight: 600;
  }

  .details-actions {
    display: flex;
    justify-content: flex-end;
  }
`;
