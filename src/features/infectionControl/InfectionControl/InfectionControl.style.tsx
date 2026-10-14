import styled from "styled-components";
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

// the patient and the follow-up side by side in one card, stacked on
// narrower screens
export const SummaryCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.03),
    0 1px 6px -1px rgba(0, 0, 0, 0.02),
    0 2px 4px 0 rgba(0, 0, 0, 0.02);
  display: flex;
  margin-bottom: 24px;
  overflow: hidden;

  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

export const StateBox = styled.div`
  padding: 40px 0;
  text-align: center;
`;

// in place of the follow-up when it failed to load
export const FollowUpError = styled.div`
  align-items: flex-start;
  background: #fafafa;
  border-left: 1px solid #f0f0f0;
  color: #595959;
  display: flex;
  flex: 0 0 42%;
  flex-direction: column;
  font-size: 13px;
  gap: 8px;
  justify-content: center;
  padding: 14px 20px 16px;

  @media (max-width: 992px) {
    border-left: 0;
    border-top: 1px solid #f0f0f0;
  }
`;
