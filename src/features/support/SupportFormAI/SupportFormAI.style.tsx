import styled from "styled-components";
import colors from "src/styles/colors";

export const QuestionContainer = styled.div`
  .form-label {
    font-size: 1.125rem;
  }

  .tiptap {
    min-height: 30vh;
    max-height: 500px;
  }
`;

export const ChatContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`;

export const ChatBubble = styled.div`
  background: ${colors.commonLighter};
  border: 2px solid #ff8845;
  border-radius: 18px;
  padding: 16px 20px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  flex: 1;

  &::after {
    content: "";
    position: absolute;
    left: 24px;
    top: -17px;
    width: 0;
    height: 0;
    border-top: 11px solid transparent;
    border-bottom: 11px solid transparent;
    border-right: 11px solid #ff8845;
    transform: rotate(90deg);
  }
`;

export const ResponseContent = styled.div`
  color: ${colors.text};
  line-height: 1.6;

  p {
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const ActionSection = styled.div`
  text-align: center;
  margin-top: 30px;
`;

export const ActionText = styled.p`
  font-size: 18px;
  color: ${colors.text};
  margin-bottom: 20px;
`;

export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin-left: 1rem;
    font-size: 24px;
    color: ${colors.primary};
    font-weight: 600;
`;
