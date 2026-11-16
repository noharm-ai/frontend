import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "src/store";
import { Creators as UserCreators } from "store/ducks/user";
import api from "services/api";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";
import IntegrationStatus from "models/IntegrationStatus";

import { WelcomeOnboardingModal } from "../WelcomeOnboardingModal/WelcomeOnboardingModal";

export function WelcomeOnboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userName = useAppSelector((state: any) => state.user.account.userName);
  const onboardingStatus = useAppSelector(
    (state: any) => state.user.account.onboardingStatus,
  );

  const integrationStatus = useAppSelector(
    (state: any) => state.app.config.integrationStatus,
  );

  // during integration the team is still setting the client up, so the welcome
  // (which points users at mandatory training) waits for production; the status
  // stays pending meanwhile and the modal shows on the first login after go-live
  const open =
    onboardingStatus === "pending" &&
    integrationStatus === IntegrationStatus.PRODUCTION;

  const markAsSeen = () => {
    dispatch(
      UserCreators.userSetAccountField({ onboardingStatus: "onboarded" }),
    );
    api.completeOnboarding().catch(() => {
      // if it fails, the modal shows again on the next login
    });
  };

  const handleStart = () => {
    markAsSeen();
    navigate("/treinamento");
  };

  return (
    <WelcomeOnboardingModal
      open={open}
      userName={FeatureService.has(Feature.HIDE_NAMES) ? "" : userName}
      imageSrc="/imgs/welcome.png"
      onStart={handleStart}
      onExplore={markAsSeen}
      onClose={markAsSeen}
    />
  );
}
