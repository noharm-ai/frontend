import styled from "styled-components";

import Modal from "components/Modal";
import colors from "styles/colors";

export const WelcomeModal = styled(Modal)`
  .ant-modal-close {
    top: 12px;
    inset-inline-end: 12px;
    color: ${colors.text};

    &:hover {
      color: ${colors.primary};
    }
  }
`;

export const WelcomeLayout = styled.div`
  display: flex;
  align-items: stretch;
  min-height: 560px;
`;

export const WelcomeVisual = styled.div`
  flex: 0 0 340px;
  background: #f0f4f5;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 767px) {
    display: none;
  }
`;

export const WelcomeContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 40px 40px 32px;
`;

export const WelcomeIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .welcome-eyebrow {
    color: ${colors.accentSecondary};
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }

  .welcome-title {
    margin: 0;
    color: ${colors.primary};
    font-size: 1.875rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.4px;
  }

  .welcome-lead {
    margin: 0;
    max-width: 460px;
    color: ${colors.text};
    font-size: 0.9375rem;
    line-height: 1.55;
    text-wrap: pretty;

    strong {
      color: ${colors.primary};
      font-weight: 600;
    }
  }
`;

export const TrainingCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border: 1px solid ${colors.detail};
  border-radius: 8px;
`;

export const TrainingCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .training-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${colors.accentSecondary};
    color: ${colors.commonLighter};
    font-size: 15px;
  }

  strong {
    display: block;
    color: ${colors.primary};
    font-size: 1rem;
    font-weight: 600;
  }

  span {
    display: block;
    color: ${colors.text};
    font-size: 0.8125rem;
  }
`;

export const TrainingHighlights = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 9px;
    color: ${colors.text};
    font-size: 0.875rem;
  }

  .anticon {
    flex-shrink: 0;
    color: ${colors.accent};
    font-size: 14px;
  }

  strong {
    color: ${colors.primary};
    font-weight: 600;
  }
`;

export const TrainingNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 12px;
  border: 1px solid #91caff;
  border-radius: 8px;
  background: #e6f4ff;
  color: ${colors.primary};
  font-size: 0.8125rem;
  line-height: 1.45;

  .anticon {
    flex-shrink: 0;
    margin-top: 2px;
    color: #1677ff;
  }
`;

export const WelcomeActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;

  .welcome-buttons {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ant-btn {
    height: 40px;
    padding: 0 22px;
    white-space: nowrap;
  }

  .welcome-hint {
    color: #898685;
    font-size: 0.75rem;
    line-height: 1.4;
  }
`;
