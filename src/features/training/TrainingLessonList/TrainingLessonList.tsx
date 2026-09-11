import { useTranslation } from "react-i18next";
import { CheckCircleFilled, ClockCircleOutlined } from "@ant-design/icons";

import { ITrainingItem } from "../TrainingPlayerSlice";
import {
  LessonList,
  LessonItem,
  LessonNumber,
  LessonTitle,
  PendingBadge,
} from "../TrainingPlayer.style";

interface TrainingLessonListProps {
  items: ITrainingItem[];
  currentStep: number;
  isItemFinished: (item: ITrainingItem) => boolean;
  onSelect: (index: number) => void;
}

/**
 * The ordered lesson list of a module. Shared by the desktop side panel and
 * the mobile drawer, so both unlock lessons by the same rule: a lesson opens
 * once the one before it is finished.
 */
export function TrainingLessonList({
  items,
  currentStep,
  isItemFinished,
  onSelect,
}: TrainingLessonListProps) {
  const { t } = useTranslation();

  return (
    <LessonList>
      {items.map((item, index) => {
        const finished = isItemFinished(item);
        const unlocked =
          finished || index === 0 || isItemFinished(items[index - 1]);

        return (
          <LessonItem
            key={item.id}
            $active={index === currentStep}
            $clickable={unlocked}
            onClick={() => {
              if (unlocked) {
                onSelect(index);
              }
            }}
          >
            <LessonNumber $active={index === currentStep} $finished={finished}>
              {finished ? <CheckCircleFilled /> : index + 1}
            </LessonNumber>
            <LessonTitle $active={index === currentStep}>
              {item.title}
            </LessonTitle>
            {!finished && (
              <PendingBadge title={t("trainingPlayer.pendingLesson")}>
                <ClockCircleOutlined />
              </PendingBadge>
            )}
          </LessonItem>
        );
      })}
    </LessonList>
  );
}
