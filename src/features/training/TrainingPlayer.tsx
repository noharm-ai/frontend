import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Row, Col, Drawer } from "antd";
import DOMPurify from "dompurify";
import {
  LeftOutlined,
  ArrowRightOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TrophyFilled,
  ExclamationCircleOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { Creators as UserCreators } from "store/ducks/user";
import notification from "components/notification";
import Button from "components/Button";
import Progress from "components/Progress";
import LoadBox from "components/LoadBox";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";
import colors from "styles/colors";

import { fetchTrainingItems, finishTrainingItem } from "./TrainingPlayerSlice";
import { fetchTrainingList } from "./TrainingCentralSlice";
import { TrainingCertificate } from "./TrainingCertificate/TrainingCertificate";
import { TrainingItemQuiz } from "./TrainingItemQuiz";
import { TrainingLessonList } from "./TrainingLessonList/TrainingLessonList";
import { YoutubeEmbed } from "./YoutubeEmbed";
import { useIsMobile } from "./useIsMobile";
import {
  PlayerHeader,
  ItemContent,
  FooterRow,
  FooterProgress,
  StepsPanel,
  MobileStepsBar,
  LessonsDrawer,
  Eyebrow,
  MetaRow,
  ModuleTitle,
  ProgressLabel,
  StepsDivider,
  LessonsLabel,
  BackRow,
  CompletionModal,
  CompletionHero,
  CompletionBody,
  CompletionStats,
  CompletionActions,
  QuizHint,
  ImagePreview,
} from "./TrainingPlayer.style";

const CONFETTI_COLORS = ["#7ebe9a", "#70bdc3", "#f5c451", "#e46666", "#2e3c5a"];

// deterministic so the burst is identical on every replay
const CONFETTI_PIECES = Array.from({ length: 20 }, (_, i) => ({
  key: i,
  left: (i * 17 + 7) % 100,
  width: 5 + (i % 4) * 2,
  height: 8 + (i % 3) * 3,
  drift: ((i % 5) - 2) * 18,
  delay: ((i * 13) % 16) / 10,
  duration: 2.4 + ((i * 7) % 10) / 10,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  radius: i % 3 === 0 ? "50%" : "2px",
}));

export function TrainingPlayer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.trainingPlayer.list);
  const status = useAppSelector((state) => state.trainingPlayer.status);
  const moduleList = useAppSelector((state) => state.trainingCentral.list);
  const isMobile = useIsMobile();

  const [currentStep, setCurrentStep] = useState(0);
  const [lessonsOpen, setLessonsOpen] = useState(false);
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

      // the header reads these counts; the authentication payload that seeds
      // them is only refreshed on the next login
      if (response.payload?.data?.training) {
        dispatch(
          UserCreators.userSetAccountField({
            training: response.payload.data.training,
          }),
        );
      }

      if (response.payload?.data?.moduleFinished) {
        // keeps the Training Central progress panel in sync
        dispatch(fetchTrainingList({}));
      }

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

  const lessonProgressLabel = t("trainingPlayer.lessonProgress", {
    lesson: currentStep + 1,
    total: sortedItems.length,
  });

  const backButton = (
    <Button
      type="text"
      icon={<LeftOutlined />}
      onClick={() => navigate("/treinamento")}
    >
      {t("trainingPlayer.backToCentral")}
    </Button>
  );

  const lessonList = (
    <TrainingLessonList
      items={sortedItems}
      currentStep={currentStep}
      isItemFinished={isItemFinished}
      onSelect={(index) => {
        setCurrentStep(index);
        setLessonsOpen(false);
      }}
    />
  );

  return (
    <>
      <Row gutter={[24, 16]} justify="center" align="stretch">
        {isMobile ? (
          // phones and tablets: the lesson list would push the content below
          // the fold, so it moves into a drawer behind a compact header
          <Col xs={24}>
            <MobileStepsBar>
              <BackRow>{backButton}</BackRow>

              <div className="mobile-steps-head">
                <ModuleTitle>{moduleName}</ModuleTitle>
                <Button
                  icon={<UnorderedListOutlined />}
                  onClick={() => setLessonsOpen(true)}
                  aria-label={t("trainingPlayer.lessonsListLabel")}
                >
                  {t("trainingPlayer.lessonsListLabel")}
                </Button>
              </div>

              <Progress
                percent={progressPercent}
                size="small"
                strokeColor={colors.accentSecondary}
              />
              <ProgressLabel>{lessonProgressLabel}</ProgressLabel>
            </MobileStepsBar>

            <Drawer
              open={lessonsOpen}
              placement="bottom"
              size="auto"
              title={t("trainingPlayer.lessonsListLabel")}
              onClose={() => setLessonsOpen(false)}
              styles={{ body: { padding: "12px 16px 24px" } }}
            >
              <LessonsDrawer>
                <ModuleTitle>{moduleName}</ModuleTitle>
                <ProgressLabel>{lessonProgressLabel}</ProgressLabel>
                {lessonList}
              </LessonsDrawer>
            </Drawer>
          </Col>
        ) : (
          <Col lg={7}>
            <StepsPanel>
              <BackRow>{backButton}</BackRow>

              <ModuleTitle>{moduleName}</ModuleTitle>
              <Progress
                percent={progressPercent}
                size="small"
                strokeColor={colors.accentSecondary}
              />
              <ProgressLabel>{lessonProgressLabel}</ProgressLabel>

              <StepsDivider />

              <LessonsLabel>
                {t("trainingPlayer.lessonsListLabel")}
              </LessonsLabel>
              {lessonList}
            </StepsPanel>
          </Col>
        )}

        <Col xs={24} lg={17}>
          <PlayerHeader>
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
          </PlayerHeader>

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

            <FooterProgress>{lessonProgressLabel}</FooterProgress>

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

      <CompletionModal
        open={showCompletionModal}
        footer={null}
        centered
        destroyOnHidden
        width={520}
        styles={{
          container: { padding: 0, overflow: "hidden", borderRadius: 16 },
          body: { padding: 0 },
        }}
        onCancel={() => navigate("/treinamento")}
      >
        <CompletionHero>
          <div className="completion-confetti" aria-hidden="true">
            {CONFETTI_PIECES.map((piece) => (
              <i
                key={piece.key}
                style={
                  {
                    left: `${piece.left}%`,
                    width: piece.width,
                    height: piece.height,
                    background: piece.color,
                    borderRadius: piece.radius,
                    "--drift": `${piece.drift}px`,
                    "--delay": `${piece.delay}s`,
                    "--duration": `${piece.duration}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
          <span className="completion-badge">
            <TrophyFilled />
          </span>
          <span className="completion-eyebrow">
            {t("trainingPlayer.moduleCompletedEyebrow")}
          </span>
          <h2>{t("trainingPlayer.moduleCompletedTitle")}</h2>
        </CompletionHero>

        <CompletionBody>
          <p className="completion-message">
            {t("trainingPlayer.moduleCompletedMessage", { module: moduleName })}
          </p>

          <CompletionStats>
            <div className="completion-stat">
              <strong>{sortedItems.length}</strong>
              <span>
                {t("trainingPlayer.moduleCompletedLessonsStat", {
                  count: sortedItems.length,
                })}
              </span>
            </div>
            <div className="completion-stat">
              <strong>100%</strong>
              <span>{t("trainingPlayer.moduleCompletedProgressStat")}</span>
            </div>
          </CompletionStats>

          <CompletionActions>
            <TrainingCertificate
              idTraining={Number(params.id)}
              label={t("trainingCertificate.download")}
            />
            <Button type="primary" onClick={() => navigate("/treinamento")}>
              {t("trainingPlayer.backToCentral")}
            </Button>
          </CompletionActions>
        </CompletionBody>
      </CompletionModal>

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
