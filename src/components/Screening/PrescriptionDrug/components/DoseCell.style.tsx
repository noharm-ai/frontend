import styled from "styled-components";

export const DoseCellPopover = styled.div`
  display: flex;
  flex-direction: column;

  .info-table {
    font-size: 12px;
    border-collapse: collapse;

    th,
    td {
      padding: 2px 8px;
      border: 1px solid #f0f0f0;
      vertical-align: top;
      text-align: left;

      &.center {
        text-align: center;
      }

      &.right {
        text-align: right;
      }

      &.header {
        background: #f5f5f5;
        font-weight: 600;
        color: #2e3c5a;
        white-space: nowrap;
      }
    }

    td {
      color: #595959;
      line-height: 1.3;

      .missing-data {
        color: red;
      }
    }
  }

  .differentiated-dose-note,
  .missing-convert-factor-note {
    max-width: 320px;
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.4;
    color: #595959;
  }
`;

// the dose of an item whose unit has no conversion factor to the drug's
// default unit: underlined like a drug without substance (DrugLink)
export const DoseValue = styled.span`
  &.missing-convert-factor {
    position: relative;

    &:after {
      position: absolute;
      content: "";
      left: 0;
      bottom: 0;
      height: 0;
      width: 100%;
      border: 1px dashed #ffa39e;
    }
  }
`;
