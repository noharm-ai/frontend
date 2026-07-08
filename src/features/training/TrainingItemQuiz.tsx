import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Radio } from "components/Inputs";

import { ITrainingQuestion } from "./TrainingPlayerSlice";
import { QuizContainer, QuestionBlock, AnswerFeedback } from "./TrainingPlayer.style";

interface TrainingItemQuizProps {
  questions: ITrainingQuestion[];
  onPassedChange: (passed: boolean) => void;
}

export function TrainingItemQuiz({
  questions,
  onPassedChange,
}: TrainingItemQuizProps) {
  const { t } = useTranslation();
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});

  const isQuestionCorrect = (questionIndex: number) => {
    const selected = selectedAnswers[questionIndex];

    return (
      selected !== undefined &&
      questions[questionIndex].answers[selected].correct
    );
  };

  useEffect(() => {
    const passed = questions.every((_, index) => isQuestionCorrect(index));

    onPassedChange(passed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswers, questions]);

  return (
    <QuizContainer>
      {questions.map((question, questionIndex) => {
        const selected = selectedAnswers[questionIndex];
        const answeredCorrectly = isQuestionCorrect(questionIndex);

        return (
          <QuestionBlock key={questionIndex}>
            <strong>{question.question}</strong>

            <Radio.Group
              value={selected}
              onChange={(e) =>
                setSelectedAnswers((prev) => ({
                  ...prev,
                  [questionIndex]: e.target.value,
                }))
              }
            >
              {question.answers.map((answer, answerIndex) => (
                <Radio key={answerIndex} value={answerIndex}>
                  {answer.text}
                </Radio>
              ))}
            </Radio.Group>

            {selected !== undefined && (
              <AnswerFeedback $correct={answeredCorrectly}>
                {answeredCorrectly
                  ? t("trainingPlayer.answerCorrect")
                  : t("trainingPlayer.answerIncorrect")}
              </AnswerFeedback>
            )}
          </QuestionBlock>
        );
      })}
    </QuizContainer>
  );
}
