import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QuestionCircleOutlined } from "@ant-design/icons";

import Button from "components/Button";

import { ITrainingQuestion } from "./TrainingPlayerSlice";
import {
  QuizCard,
  QuizHeader,
  QuestionText,
  AnswerRadio,
  AnswerFeedback,
  QuizActions,
} from "./TrainingPlayer.style";

interface TrainingItemQuizProps {
  questions: ITrainingQuestion[];
  onPassedChange: (passed: boolean) => void;
}

export function TrainingItemQuiz({
  questions,
  onPassedChange,
}: TrainingItemQuizProps) {
  const { t } = useTranslation();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number>();
  const [verified, setVerified] = useState(false);

  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const isCorrect = selected !== undefined && question.answers[selected].correct;

  const handleSelect = (value: number) => {
    setSelected(value);
    setVerified(false);
  };

  const handleVerify = () => {
    setVerified(true);

    if (isCorrect && isLastQuestion) {
      onPassedChange(true);
    }
  };

  const handleNextQuestion = () => {
    setQuestionIndex((index) => index + 1);
    setSelected(undefined);
    setVerified(false);
  };

  return (
    <QuizCard>
      <QuizHeader>
        <span className="quiz-title">
          <QuestionCircleOutlined />
          {t("trainingPlayer.quizTitle")}
        </span>
        <span className="quiz-progress">
          {t("trainingPlayer.questionProgress", {
            current: questionIndex + 1,
            total: questions.length,
          })}
        </span>
      </QuizHeader>

      <QuestionText>{question.question}</QuestionText>

      {question.answers.map((answer, answerIndex) => (
        <AnswerRadio
          key={answerIndex}
          checked={selected === answerIndex}
          disabled={verified && isCorrect}
          onChange={() => handleSelect(answerIndex)}
        >
          {answer.text}
        </AnswerRadio>
      ))}

      {verified && (
        <AnswerFeedback $correct={isCorrect}>
          {isCorrect
            ? t("trainingPlayer.answerCorrect")
            : t("trainingPlayer.answerIncorrect")}
        </AnswerFeedback>
      )}

      <QuizActions>
        {!verified && (
          <Button
            type="primary"
            disabled={selected === undefined}
            onClick={handleVerify}
          >
            {t("trainingPlayer.verifyAnswer")}
          </Button>
        )}

        {verified && isCorrect && !isLastQuestion && (
          <Button type="primary" onClick={handleNextQuestion}>
            {t("trainingPlayer.nextQuestion")}
          </Button>
        )}

        {verified && isCorrect && isLastQuestion && (
          <AnswerFeedback $correct>
            {t("trainingPlayer.quizPassed")}
          </AnswerFeedback>
        )}
      </QuizActions>
    </QuizCard>
  );
}
