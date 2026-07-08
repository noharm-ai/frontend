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
} from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import Button from "components/Button";
import Steps from "components/Steps";
import LoadBox from "components/LoadBox";
import { getErrorMessage } from "utils/errorHandler";
import { PageHeader } from "styles/PageHeader.style";

import { fetchTrainingItems } from "./TrainingPlayerSlice";
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
  const [passedByItem, setPassedByItem] = useState<Record<number, boolean>>(
    {},
  );

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
  const moduleName =
    moduleList.find((module) => module.id === currentItem?.trainingId)
      ?.title ?? currentItem?.trainingId;
  const isLastStep = currentStep === sortedItems.length - 1;
  const hasQuiz = Boolean(currentItem?.questions?.length);
  const passed = Boolean(passedByItem[currentItem?.id]);

  if (status === "loading" || !currentItem) {
    return <LoadBox />;
  }

  const goToPrevious = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const goToNext = () => {
    if (isLastStep) {
      notification.success({ message: t("trainingPlayer.completed") });
      navigate("/treinamento");
    } else {
      setCurrentStep((step) => step + 1);
    }
  };

  return (
    <>
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
            <span>
              <FileTextOutlined />
              {hasQuiz
                ? t("trainingPlayer.readingAndQuizLabel")
                : t("trainingPlayer.readingLabel")}
            </span>
          </MetaRow>
        </div>
      </PageHeader>

      <Row gutter={24}>
        <Col xs={17}>
          <ItemContent>
            {currentItem.video && (
              <YoutubeEmbed
                url={currentItem.video}
                title={currentItem.title}
                moduleName={moduleName}
              />
            )}

            <div
              className="item-text"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(currentItem.text),
              }}
            />

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

        <Col xs={7}>
          <StepsPanel>
            <Steps
              current={currentStep}
              size="small"
              orientation="vertical"
              items={sortedItems.map((item) => ({ title: item.title }))}
            />
          </StepsPanel>
        </Col>
      </Row>
    </>
  );
}
