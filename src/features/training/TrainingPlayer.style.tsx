import styled, { keyframes } from "styled-components";

import colors from "styles/colors";
import { Radio } from "components/Inputs";
import Modal from "components/Modal";

export const StepsPanel = styled.div`
  height: 100%;
  background: ${colors.commonLighter};
  border-radius: 8px;
  padding: 20px;
`;

export const BackRow = styled.div`
  display: flex;
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
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 12px;
`;

export const ProgressLabel = styled.div`
  color: ${colors.text};
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 6px 0 20px 0;
`;

export const StepsDivider = styled.div`
  border-top: 1px solid #f0f0f0;
  margin: 0 0 20px 0;
`;

export const LessonsLabel = styled.div`
  color: ${colors.text};
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

export const LessonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const LessonItem = styled.li<{ $active: boolean; $clickable: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  background: ${(props) =>
    props.$active ? "rgba(112, 189, 195, 0.12)" : "transparent"};

  &:hover {
    background: ${(props) =>
      props.$clickable && !props.$active
        ? "rgba(112, 189, 195, 0.06)"
        : undefined};
  }
`;

export const LessonNumber = styled.span<{
  $active: boolean;
  $finished: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) =>
    props.$finished || props.$active ? colors.accentSecondary : "transparent"};
  color: ${(props) =>
    props.$finished || props.$active ? colors.commonLighter : colors.text};
`;

export const LessonTitle = styled.span<{ $active: boolean }>`
  flex: 1;
  font-size: 0.875rem;
  color: ${(props) => (props.$active ? colors.primary : colors.text)};
  font-weight: ${(props) => (props.$active ? 700 : 400)};
`;

export const PendingBadge = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${colors.text};
  opacity: 0.45;
  font-size: 0.875rem;
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

    img {
      display: block;
      max-width: 70%;
      height: auto;
      margin: 32px auto;
      border-radius: 8px;
      cursor: pointer;
    }
  }
`;

export const ImagePreview = styled.img`
  display: block;
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
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
  max-width: 820px;
  margin-top: 30px;
`;

export const FooterProgress = styled.span`
  color: ${colors.text};
  font-size: 0.875rem;
`;

export const QuizHint = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 820px;
  margin-top: 16px;
  color: ${colors.danger};
  font-size: 0.8125rem;
`;

export const CompletionModal = styled(Modal)`
  .ant-modal-content {
    overflow: hidden;
    border-radius: 16px;
  }

  .ant-modal-close {
    top: 12px;
    inset-inline-end: 12px;
    color: ${colors.text};

    &:hover {
      color: ${colors.primary};
    }
  }
`;

const badgePop = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.4) rotate(-25deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.12) rotate(6deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
`;

const ringPulse = keyframes`
  0% {
    opacity: 0.55;
    transform: scale(0.85);
  }
  70% {
    opacity: 0;
    transform: scale(1.6);
  }
  100% {
    opacity: 0;
    transform: scale(1.6);
  }
`;

const confettiFall = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, -24px, 0) rotate(0deg);
  }
  12% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--drift, 0px), 250px, 0) rotate(540deg);
  }
`;

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const CompletionHero = styled.div`
  position: relative;
  overflow: hidden;
  padding: 34px 24px 30px;
  background: linear-gradient(135deg, #eef6f5 0%, #f7faf9 100%);
  text-align: center;

  /* same corner shape as the video cover */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 40%;
    height: 70%;
    border-radius: 0 0 100% 0;
    background: linear-gradient(
      135deg,
      ${colors.accentSecondary},
      ${colors.accent}
    );
    pointer-events: none;
  }

  .completion-confetti {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .completion-confetti i {
    position: absolute;
    top: 0;
    display: block;
    opacity: 0;
    animation: ${confettiFall} var(--duration) ease-in var(--delay) forwards;
  }

  .completion-badge {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 82px;
    height: 82px;
    border-radius: 50%;
    background: ${colors.commonLighter};
    box-shadow: 0 8px 22px rgba(46, 60, 90, 0.18);
    animation: ${badgePop} 620ms cubic-bezier(0.34, 1.56, 0.64, 1) both;

    &::before,
    &::after {
      content: "";
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid rgba(126, 190, 154, 0.8);
      animation: ${ringPulse} 2s ease-out 500ms infinite;
    }

    &::after {
      animation-delay: 1.2s;
    }

    .anticon {
      font-size: 40px;
      color: ${colors.accent};
    }
  }

  .completion-eyebrow {
    position: relative;
    z-index: 1;
    display: block;
    margin-top: 18px;
    color: #4f9b7a;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    animation: ${riseIn} 480ms ease-out 260ms both;
  }

  h2 {
    position: relative;
    z-index: 1;
    margin: 6px 0 0;
    color: ${colors.primary};
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.4px;
    animation: ${riseIn} 480ms ease-out 340ms both;
  }

  @media (prefers-reduced-motion: reduce) {
    .completion-confetti {
      display: none;
    }

    .completion-badge,
    .completion-badge::before,
    .completion-badge::after,
    .completion-eyebrow,
    h2 {
      animation: none;
    }

    .completion-badge::before,
    .completion-badge::after {
      opacity: 0.4;
      transform: none;
    }
  }
`;

export const CompletionBody = styled.div`
  padding: 26px 32px 30px;
  text-align: center;
  animation: ${riseIn} 480ms ease-out 420ms both;

  .completion-message {
    margin: 0 auto;
    max-width: 420px;
    color: ${colors.text};
    font-size: 0.9375rem;
    line-height: 1.55;
    text-wrap: pretty;

    strong {
      color: ${colors.primary};
      font-weight: 600;
    }
  }

  @media (max-width: 480px) {
    padding: 22px 20px 26px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const CompletionStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 22px 0 24px;

  .completion-stat {
    flex: 0 1 150px;
    padding: 12px 14px;
    border: 1px solid ${colors.detail};
    border-radius: 10px;
    background: #f7fafb;

    strong {
      display: block;
      color: ${colors.primary};
      font-size: 1.375rem;
      font-weight: 600;
      line-height: 1.2;
    }

    span {
      display: block;
      margin-top: 2px;
      color: ${colors.text};
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;

    .completion-stat {
      flex: 1 1 auto;
    }
  }
`;

export const CompletionActions = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
`;
