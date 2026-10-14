import styled, { css } from "styled-components";

// a label over its value, the value's unit or date small and grey beside it
const dataList = css`
  .patient-data {
    display: grid;
    gap: 12px 16px;
  }

  .patient-data-item {
    min-width: 0;
  }

  .patient-data-item-label {
    color: #8c8c8c;
    font-size: 12px;
  }

  .patient-data-item-value {
    color: #2e3c5a;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .small {
      color: #8c8c8c;
      font-size: 12px;
      font-weight: 400;
      margin-left: 4px;
    }
  }
`;

// the left side of the summary card: the patient's name, then the measures in one row
export const PatientBox = styled.div`
  ${dataList}

  flex: 1 1 0;
  min-width: 0;
  padding: 14px 20px 16px;

  /* as tall as the follow-up header beside it (FollowUpStatus), whatever the
     name brings along, so both rows below line up */
  .patient-header {
    align-items: center;
    display: flex;
    gap: 8px;
    height: 32px;
    margin-bottom: 6px;
  }

  .patient-name {
    color: #2e3c5a;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .patient-discharge {
    margin: 0;
  }

  .patient-full-data {
    margin-left: auto;
    padding: 0;
  }

  /* each measure as wide as it reads, spread over the row */
  .patient-data {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
`;

// the full patient and admission data, in a modal
export const AdmissionBody = styled.div`
  ${dataList}

  .modal-title {
    margin-bottom: 12px;
  }

  .patient-data + .modal-title {
    margin-top: 24px;
  }

  .patient-data {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;
