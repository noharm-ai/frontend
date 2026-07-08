import styled from "styled-components";

import colors from "styles/colors";

export const StepsPanel = styled.div`
  background: ${colors.commonLighter};
  border-radius: 8px;
  padding: 20px;
`;

export const ItemContent = styled.div`
  margin-top: 30px;

  .item-text {
    p {
      color: ${colors.text};
      font-size: 0.95rem;
      line-height: 1.6;
    }
  }
`;

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

export const QuizContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;

export const QuestionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  background: ${colors.commonLighter};
  border: 1px solid ${colors.detail};
  border-radius: 8px;

  strong {
    color: ${colors.primary};
  }

  .ant-radio-wrapper {
    display: flex;
    color: ${colors.text};
  }
`;

export const AnswerFeedback = styled.span<{ $correct: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => (props.$correct ? colors.accent : colors.danger)};
`;

export const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;
