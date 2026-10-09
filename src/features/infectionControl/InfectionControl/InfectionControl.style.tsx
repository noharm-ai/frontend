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

// in place of the follow-up card when it failed to load
export const FollowUpError = styled.div`
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 24px 16px;
`;
