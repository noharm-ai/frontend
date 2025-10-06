import styled from "styled-components";
import colors from "src/styles/colors";
import { timingFunctions } from "polished";

export const QuestionContainer = styled.div`
  > div {
    border: 0;
  }

  .tiptap {
    min-height: min(15vh, 300px);
    max-height: 500px;
    background: #fff;
    padding: 1rem;
  }
  .tiptap-menu {
    border-top-left-radius: 18px;
    padding-left: 2rem;
  }
`;

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 24px;
`;

export const ChatBubble = styled.div`
  background: ${colors.commonLighter};
  border: 2px solid #ff8845;
  border-radius: 18px;
  border-top-left-radius: 5px;
  padding: 16px 20px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 100%;
  transition: all 0.5s ${timingFunctions("easeOutQuint")};

  flex: 1;
  margin-right: 2rem;

  &.form {
    width: 90%;
  }

  &.no-padding {
    padding: 0 !important;
  }

  &.user {
    // background: #efedff;
    border: 2px solid #7058f8;
    border-top-left-radius: 18px;
    border-top-right-radius: 5px;
    padding: 23px 20px;
    margin-right: 0;
    margin-left: 2rem;
    align-self: flex-end;
  }

  ol {

    li {
    
      margin-bottom: 0.8rem;
      &:last-child {
        margin-bottom: 0;
      }
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

  p:first-child {
    margin-top: 0;
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

  h2 {
    margin-left: 1rem;
    font-size: 24px;
    color: ${colors.primary};
    font-weight: 600;
`;

export const ScrollableContainer = styled.div`
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 8px;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

export const ScrollAnchor = styled.div`
  height: 1px;
  width: 1px;
`;
