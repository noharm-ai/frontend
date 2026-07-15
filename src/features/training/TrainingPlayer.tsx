import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col } from "antd";
import DOMPurify from "dompurify";
import {
  LeftOutlined,
  ArrowRightOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import Button from "components/Button";
import Progress from "components/Progress";
import LoadBox from "components/LoadBox";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import { PageHeader } from "styles/PageHeader.style";
import colors from "styles/colors";

import { fetchTrainingItems, finishTrainingItem } from "./TrainingPlayerSlice";
import { fetchTrainingList } from "./TrainingCentralSlice";
import { TrainingItemQuiz } from "./TrainingItemQuiz";
import { YoutubeEmbed } from "./YoutubeEmbed";
import {
  ItemContent,
  FooterRow,
  FooterProgress,
  StepsPanel,
  Eyebrow,
  MetaRow,
  ModuleTitle,
  ProgressLabel,
  StepsDivider,
  LessonsLabel,
  LessonList,
  LessonItem,
  LessonNumber,
  LessonTitle,
  PendingBadge,
  BackRow,
  CompletionModalContent,
  QuizHint,
  ImagePreview,
} from "./TrainingPlayer.style";

export function TrainingPlayer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.trainingPlayer.list);
  const status = useAppSelector((state) => state.trainingPlayer.status);
  const moduleList = useAppSelector((state) => state.trainingCentral.list);

  const [currentStep, setCurrentStep] = useState(0);
  const [passedByItem, setPassedByItem] = useState<Record<number, boolean>>({});
  const [locallyFinishedIds, setLocallyFinishedIds] = useState<
    Record<number, boolean>
  >({});
  const [itemStartedAt, setItemStartedAt] = useState(() => Date.now());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTrainingItems(params.id)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });
  }, [dispatch, t, params.id]);

  useEffect(() => {
    if (!moduleList.length) {
      dispatch(fetchTrainingList({}));
    }
  }, [dispatch, moduleList.length]);

  const sortedItems = useMemo(
    () => [...list].sort((a, b) => a.position - b.position),
    [list],
  );

  const currentItem = sortedItems[currentStep];
  const isItemFinished = (item: (typeof sortedItems)[number]) =>
    item.finished || Boolean(locallyFinishedIds[item.id]);

  useEffect(() => {
    if (currentItem) {
      setItemStartedAt(Date.now());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem?.id]);
  const moduleName =
    moduleList.find((module) => module.id === currentItem?.trainingId)?.title ??
    currentItem?.trainingId;
  const isLastStep = currentStep === sortedItems.length - 1;
  const hasText = Boolean(currentItem?.text?.trim());
  const hasQuiz = Boolean(currentItem?.questions?.length);
  const passed =
    Boolean(passedByItem[currentItem?.id]) ||
    Boolean(currentItem && isItemFinished(currentItem));
  const finishedCount = sortedItems.filter(isItemFinished).length;
  const progressPercent = sortedItems.length
    ? Math.round((finishedCount / sortedItems.length) * 100)
    : 0;

  if (status === "loading" || !currentItem) {
    return <LoadBox />;
  }

  const goToPrevious = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const goToNext = () => {
    const durationSeconds = Math.round((Date.now() - itemStartedAt) / 1000);

    dispatch(
      finishTrainingItem({ idTrainingItem: currentItem.id, durationSeconds }),
    ).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
        return;
      }

      setLocallyFinishedIds((prev) => ({ ...prev, [currentItem.id]: true }));

      if (isLastStep) {
        if (response.payload?.data?.moduleFinished) {
          setShowCompletionModal(true);
        } else {
          notification.success({ message: t("trainingPlayer.completed") });
          navigate("/treinamento");
        }
      }
    });

    if (!isLastStep) {
      setCurrentStep((step) => step + 1);
    }
  };

  return (
    <>
      <Row gutter={24} justify="center" align="stretch">
        <Col xs={7}>
          <StepsPanel>
            <BackRow>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => navigate("/treinamento")}
              >
                {t("trainingPlayer.backToCentral")}
              </Button>
            </BackRow>

            <ModuleTitle>{moduleName}</ModuleTitle>
            <Progress
              percent={progressPercent}
              size="small"
              strokeColor={colors.accentSecondary}
            />
            <ProgressLabel>
              {t("trainingPlayer.lessonProgress", {
                lesson: currentStep + 1,
                total: sortedItems.length,
              })}
            </ProgressLabel>

            <StepsDivider />

            <LessonsLabel>{t("trainingPlayer.lessonsListLabel")}</LessonsLabel>
            <LessonList>
              {sortedItems.map((item, index) => {
                const finished = isItemFinished(item);
                const unlocked =
                  finished ||
                  index === 0 ||
                  isItemFinished(sortedItems[index - 1]);

                return (
                  <LessonItem
                    key={item.id}
                    $active={index === currentStep}
                    $clickable={unlocked}
                    onClick={() => {
                      if (unlocked) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    <LessonNumber
                      $active={index === currentStep}
                      $finished={finished}
                    >
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
          </StepsPanel>
        </Col>

        <Col xs={17}>
          <PageHeader>
            <div>
              <Eyebrow>
                {t("trainingPlayer.moduleLessonLabel", {
                  module: moduleName,
                  lesson: currentStep + 1,
                  total: sortedItems.length,
                })}
              </Eyebrow>
              <h1 className="page-header-title">{currentItem.title}</h1>
              <MetaRow>
                {currentItem.video && (
                  <span>
                    <VideoCameraOutlined />
                    {t("trainingPlayer.videoLabel")}
                  </span>
                )}
                {hasText && (
                  <span>
                    <FileTextOutlined />
                    {t("trainingPlayer.readingLabel")}
                  </span>
                )}
                {hasQuiz && (
                  <span>
                    <QuestionCircleOutlined />
                    {t("trainingPlayer.quizLabel")}
                  </span>
                )}
              </MetaRow>
            </div>
          </PageHeader>

          <ItemContent>
            {currentItem.video && (
              <YoutubeEmbed
                url={currentItem.video}
                title={currentItem.title}
                moduleName={moduleName}
              />
            )}

            {hasText && (
              <div
                className="item-text"
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.tagName === "IMG") {
                    setPreviewImageSrc((target as HTMLImageElement).src);
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(currentItem.text!),
                }}
              />
            )}

            {hasQuiz && (
              <TrainingItemQuiz
                key={currentItem.id}
                questions={currentItem.questions!}
                onPassedChange={(itemPassed) =>
                  setPassedByItem((prev) => ({
                    ...prev,
                    [currentItem.id]: itemPassed,
                  }))
                }
              />
            )}
          </ItemContent>

          {hasQuiz && !passed && (
            <QuizHint>
              <ExclamationCircleOutlined />
              {t("trainingPlayer.completeQuizHint")}
            </QuizHint>
          )}

          <FooterRow>
            <Button
              icon={<LeftOutlined />}
              onClick={goToPrevious}
              disabled={currentStep === 0}
            >
              {t("trainingPlayer.previous")}
            </Button>

            <FooterProgress>
              {t("trainingPlayer.lessonProgress", {
                lesson: currentStep + 1,
                total: sortedItems.length,
              })}
            </FooterProgress>

            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={goToNext}
              disabled={hasQuiz && !passed}
            >
              {isLastStep
                ? t("trainingPlayer.finish")
                : t("trainingPlayer.markCompleted")}
            </Button>
          </FooterRow>
        </Col>
      </Row>

      <DefaultModal
        open={showCompletionModal}
        footer={null}
        centered
        destroyOnHidden
        onCancel={() => navigate("/treinamento")}
      >
        <CompletionModalContent>
          <CheckCircleFilled />
          <h2>{t("trainingPlayer.moduleCompletedTitle")}</h2>
          <p>
            {t("trainingPlayer.moduleCompletedMessage", { module: moduleName })}
          </p>
          <Button type="primary" onClick={() => navigate("/treinamento")}>
            {t("trainingPlayer.backToCentral")}
          </Button>
        </CompletionModalContent>
      </DefaultModal>

      <DefaultModal
        open={Boolean(previewImageSrc)}
        footer={null}
        centered
        destroyOnHidden
        width="auto"
        onCancel={() => setPreviewImageSrc(null)}
      >
        <ImagePreview src={previewImageSrc ?? undefined} alt="" />
      </DefaultModal>
    </>
  );
}
