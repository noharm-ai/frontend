import { Trans, useTranslation } from "react-i18next";
import {
  ArrowRightOutlined,
  CheckOutlined,
  InfoCircleFilled,
  PlayCircleFilled,
} from "@ant-design/icons";

import Button from "components/Button";

import {
  WelcomeModal as StyledWelcomeModal,
  WelcomeLayout,
  WelcomeVisual,
  WelcomeContent,
  WelcomeIntro,
  TrainingCard,
  TrainingCardHeader,
  TrainingHighlights,
  TrainingNotice,
  WelcomeActions,
} from "./WelcomeOnboardingModal.style";

interface WelcomeOnboardingModalProps {
  open: boolean;
  userName: string;
  imageSrc: string;
  showSupportNotice?: boolean;
  onStart: () => void;
  onExplore: () => void;
  onClose: () => void;
}

const getFirstName = (name: string) => (name || "").trim().split(" ")[0];

export function WelcomeOnboardingModal({
  open,
  userName,
  imageSrc,
  showSupportNotice = true,
  onStart,
  onExplore,
  onClose,
}: WelcomeOnboardingModalProps) {
  const { t } = useTranslation();

  const firstName = getFirstName(userName);
  const title = firstName
    ? t("onboarding.welcome.title", { name: firstName })
    : t("onboarding.welcome.titleNoName");

  return (
    <StyledWelcomeModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      centered
      destroyOnHidden
      maskClosable={false}
      styles={{
        container: { padding: 0, overflow: "hidden", borderRadius: 10 },
        body: { padding: 0 },
      }}
      aria-label={title}
    >
      <WelcomeLayout>
        <WelcomeVisual>
          <img
            src={imageSrc}
            alt={t("onboarding.welcome.imageAlt")}
            loading="eager"
          />
        </WelcomeVisual>

        <WelcomeContent>
          <WelcomeIntro>
            <span className="welcome-eyebrow">
              {t("onboarding.welcome.eyebrow")}
            </span>
            <h2 className="welcome-title">{title}</h2>
            <p className="welcome-lead">
              <Trans
                i18nKey="onboarding.welcome.lead"
                components={{ strong: <strong /> }}
              />
            </p>
          </WelcomeIntro>

          <TrainingCard>
            <TrainingCardHeader>
              <span className="training-icon">
                <PlayCircleFilled style={{ color: "#fff" }} />
              </span>
              <div>
                <strong>{t("onboarding.welcome.trainingTitle")}</strong>
                <span>{t("onboarding.welcome.trainingSubtitle")}</span>
              </div>
            </TrainingCardHeader>

            <TrainingHighlights>
              <li>
                <CheckOutlined />
                <span>
                  <Trans
                    i18nKey="onboarding.welcome.highlightModules"
                    components={{ strong: <strong /> }}
                  />
                </span>
              </li>
              <li>
                <CheckOutlined />
                <span>{t("onboarding.welcome.highlightProgress")}</span>
              </li>
            </TrainingHighlights>

            {showSupportNotice && (
              <TrainingNotice>
                <InfoCircleFilled />
                <span>{t("onboarding.welcome.supportNotice")}</span>
              </TrainingNotice>
            )}
          </TrainingCard>

          <WelcomeActions>
            <div className="welcome-buttons">
              <Button
                type="primary"
                onClick={onStart}
                style={{ background: "#70bdc3" }}
              >
                {t("onboarding.welcome.primaryAction")} <ArrowRightOutlined />
              </Button>
              <Button onClick={onExplore}>
                {t("onboarding.welcome.secondaryAction")}
              </Button>
            </div>
            <span className="welcome-hint">
              {t("onboarding.welcome.menuHint")}
            </span>
          </WelcomeActions>
        </WelcomeContent>
      </WelcomeLayout>
    </StyledWelcomeModal>
  );
}
