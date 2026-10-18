import styled from "styled-components";

// the modal scrolls the document; the document itself is what gets printed,
// whole
export const ReportBody = styled.div`
  max-height: 75vh;
  overflow-y: auto;
  padding-right: 8px;
`;

export const ReportDocument = styled.div`
  color: #2e3c5a;
  font-size: 13px;
  line-height: 1.45;

  @media print {
    font-size: 11px;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .report-header {
    align-items: center;
    border-bottom: 2px solid #2e3c5a;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 8px;
    padding-right: 24px;

    @media print {
      padding-right: 0;
    }

    .report-title {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    h1 {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }
  }

  // the brand goes to paper only; the screen already carries it
  .report-brand {
    flex-shrink: 0;
    width: 120px;

    @media screen {
      display: none;
    }

    svg {
      display: block;

      // the logo's lettering is white, for the dark menu
      .cls-2 {
        fill: rgb(34, 57, 91);
      }
    }
  }

  section + section {
    margin-top: 20px;
  }

  h2 {
    border-bottom: 1px solid #d9d9d9;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 10px 0;
    padding-bottom: 4px;
    break-after: avoid;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 12px 0 6px 0;
    break-after: avoid;
  }

  h4 {
    color: #595959;
    font-size: 12px;
    font-weight: 600;
    margin: 10px 0 4px 0;
    text-transform: uppercase;
    break-after: avoid;
  }

  .report-muted {
    color: #8c8c8c;
    font-weight: 400;
  }

  p.report-muted {
    margin: 0 0 6px 0;
  }

  .report-label {
    color: #8c8c8c;
    display: block;
    font-size: 11px;
  }

  .report-fields {
    display: grid;
    gap: 6px 20px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 0;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    dt {
      color: #8c8c8c;
      font-size: 11px;
    }

    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
  }

  .report-block {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 4px 12px 12px 12px;

    & + .report-block {
      margin-top: 12px;
    }
  }

  .report-table {
    border-collapse: collapse;
    color: inherit;
    /* tables do not inherit it in every print context */
    font-size: inherit;
    width: 100%;

    th,
    td {
      border: 1px solid #e0e0e0;
      padding: 3px 6px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #fafafa;
      font-weight: 600;
    }

    tr {
      break-inside: avoid;
    }

    .report-row-with-notes td {
      border-bottom: none;
    }

    .report-row-notes td {
      border-top: none;
      color: #595959;
    }
  }

  .report-list {
    margin: 0;
    padding-left: 18px;
  }

  .report-alert strong {
    margin-right: 4px;
  }

  .report-conforming {
    color: #389e0d;
    font-weight: 600;
  }

  .report-non-conforming {
    color: #cf1322;
    font-weight: 600;
  }

  .report-notes {
    margin-top: 6px;
    white-space: pre-wrap;
  }

  .report-evaluation {
    border-top: 1px dashed #d9d9d9;
    margin-top: 10px;
    padding-top: 8px;
    break-inside: avoid;
  }

  .report-evaluation-title {
    margin-bottom: 4px;
  }
`;
