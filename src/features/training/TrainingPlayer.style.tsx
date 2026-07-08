import styled from "styled-components";

import colors from "styles/colors";
import { Radio } from "components/Inputs";

export const StepsPanel = styled.div`
  height: 100%;
  background: ${colors.commonLighter};
  border-radius: 8px;
  padding: 20px;
`;

export const BackRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;

  .ant-btn {
    padding: 0;
    height: auto;
    color: ${colors.text};
    font-size: 0.8125rem;

    &:hover {
      color: ${colors.accentSecondary};
    }
  }
`;

export const ModuleTitle = styled.div`
  color: ${colors.primary};
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 12px;
`;

export const ProgressLabel = styled.div`
  color: ${colors.text};
  font-size: 0.8125rem;
  margin: 6px 0 20px 0;
`;

export const Eyebrow = styled.div`
  color: ${colors.accentSecondary};
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 6px;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${colors.text};
    font-size: 0.8125rem;
  }
`;

export const ItemContent = styled.div`
  max-width: 820px;

  .item-text {
    p {
      color: ${colors.text};
      font-size: 0.95rem;
      line-height: 1.6;
    }

    ul {
      margin: 0 0 16px 0;
      padding-left: 20px;

      li {
        color: ${colors.text};
        font-size: 0.95rem;
        line-height: 1.6;
      }
    }
  }
`;

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgb(0 0 0 / 12%);

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export const VideoCover = styled.div`
  position: absolute;
  inset: 0;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #eef6f5 0%, #f7faf9 100%);
`;

export const CoverShape = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 55%;
  height: 65%;
  border-radius: 0 0 100% 0;
  background: linear-gradient(
    135deg,
    ${colors.accentSecondary},
    ${colors.accent}
  );
`;

export const CoverBrand = styled.div`
  position: absolute;
  top: 20px;
  left: 24px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }

  strong {
    display: block;
    color: ${colors.commonLighter};
    font-size: 0.875rem;
  }

  span {
    display: block;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.75rem;
  }
`;

export const CoverPlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.commonLighter};
  color: ${colors.primary};
  font-size: 22px;
  box-shadow: 0 6px 16px rgb(0 0 0 / 20%);
`;

export const CoverTitle = styled.div`
  position: absolute;
  bottom: 20px;
  left: 24px;
  z-index: 1;

  span {
    display: block;
    color: ${colors.primary};
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.2;
  }
`;

export const QuizCard = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: ${colors.commonLighter};
  border: 1px solid ${colors.detail};
  border-radius: 8px;
`;

export const QuizHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .quiz-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${colors.primary};
    font-weight: 600;
  }

  .quiz-progress {
    color: ${colors.text};
    font-size: 0.8125rem;
  }
`;

export const QuestionText = styled.strong`
  display: block;
  color: ${colors.primary};
  margin-bottom: 14px;
`;

export const AnswerRadio = styled(Radio)`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 0 10px 0;
  padding: 12px 16px;
  border: 1px solid ${colors.detail};
  border-radius: 8px;
  color: ${colors.text};

  &.ant-radio-wrapper-checked {
    border-color: ${colors.accentSecondary};
    background: rgba(112, 189, 195, 0.08);
    color: ${colors.primary};
  }
`;

export const AnswerFeedback = styled.div<{ $correct: boolean }>`
  margin-top: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => (props.$correct ? colors.accent : colors.danger)};
`;

export const QuizActions = styled.div`
  margin-top: 16px;
`;

export const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
`;

export const FooterProgress = styled.span`
  color: ${colors.text};
  font-size: 0.875rem;
`;
