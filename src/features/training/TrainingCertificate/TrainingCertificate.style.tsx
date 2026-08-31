import styled from "styled-components";

import colors from "styles/colors";

// hidden on screen and revealed only in the print context, the same approach
// the report pages use for their .show-print sections
export const CertificatePage = styled.div`
  display: none;

  @media print {
    display: block;
    width: 297mm;
    height: 209mm;
    box-sizing: border-box;
    padding: 10mm;
    background: ${colors.commonLighter};
    font-family:
      "Roboto",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      "Helvetica Neue",
      Arial,
      sans-serif;
    color: ${colors.primary};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .certificate-frame {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    box-sizing: border-box;
    padding: 12mm 25mm;
    text-align: center;
    border: 3px solid ${colors.accentSecondary};
    outline: 1px solid ${colors.primary};
    outline-offset: -7px;
  }

  .certificate-brand {
    width: 230px;
    margin-bottom: 12mm;

    svg {
      width: 100%;
      height: auto;

      .cls-2 {
        fill: ${colors.primary};
      }
    }
  }

  h1 {
    margin: 0 0 10mm;
    color: ${colors.primary};
    font-size: 2.6rem;
    font-weight: 600;
    letter-spacing: 5px;
    text-transform: uppercase;
  }

  .certificate-certify {
    margin: 0 0 4mm;
    color: ${colors.text};
    font-size: 1.15rem;
  }

  .certificate-user {
    margin: 0 0 6mm;
    font-size: 2.1rem;
    font-weight: 600;
  }

  .certificate-module {
    margin: 4mm 0 0;
    font-size: 1.6rem;
    font-weight: 600;
  }

  .certificate-summary {
    margin: 10mm 0 0;
    color: ${colors.text};
    font-size: 1rem;
  }

  .certificate-footer {
    position: absolute;
    right: 0;
    bottom: 8mm;
    left: 0;
    color: ${colors.text};
    font-size: 0.85rem;
  }
`;
