import styled from "styled-components";

import { PageHeader } from "styles/PageHeader.style";

// the shared page header, wrapping its action below the title on phones
export const Header = styled(PageHeader)`
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 12px;

    .page-header-actions > * {
      margin-left: 0;
    }
  }
`;

export const Section = styled.section`
  margin-bottom: 24px;

  .section-title {
    color: #2e3c5a;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
`;

export const PatientBox = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
  padding: 14px 20px;

  .patient-name {
    color: #2e3c5a;
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .patient-data {
    display: grid;
    gap: 10px 24px;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .patient-data-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .patient-data-label {
    color: #8c8c8c;
    font-size: 12px;
  }

  .patient-data-value {
    color: #2e3c5a;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .patient-data-extra {
    color: #8c8c8c;
    font-size: 12px;
    font-weight: 400;
    margin-left: 4px;
  }
`;

export const StateBox = styled.div`
  padding: 40px 0;
  text-align: center;
`;
