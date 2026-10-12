import styled from "styled-components";
import { Row } from "antd";
import { timingFunctions } from "polished";

import { PageHeader } from "styles/PageHeader.style";

// the shared page header, wrapping its action below the title on phones.
// Once scrolled past it sticks to the top, compact and translucent like the
// screening header
export const Header = styled(PageHeader)`
  transition: all 0.5s ${timingFunctions("easeOutQuint")};

  &.affixed {
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    padding: 6px 12px;
    margin-bottom: 0;
    box-shadow:
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02);
    backdrop-filter: blur(8px);

    .page-header-title {
      font-size: 18px;
    }
  }

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
