import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "src/store";
import { Creators as UserCreators } from "store/ducks/user";
import api from "services/api";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";

import { WelcomeOnboardingModal } from "../WelcomeOnboardingModal/WelcomeOnboardingModal";

export function WelcomeOnboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userName = useAppSelector((state: any) => state.user.account.userName);
  const onboardingStatus = useAppSelector(
    (state: any) => state.user.account.onboardingStatus,
  );

  const open = onboardingStatus === "pending";

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
