import styled from "styled-components";
import { Row } from "antd";

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

// the patient card and the follow-up, side by side on wide screens
export const TopRow = styled(Row)`
  margin-bottom: 24px;
`;

export const StateBox = styled.div`
  padding: 40px 0;
  text-align: center;
`;
