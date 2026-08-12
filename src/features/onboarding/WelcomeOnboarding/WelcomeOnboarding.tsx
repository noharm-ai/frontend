import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "src/store";
import {
  savePreferences,
  setWelcomeOnboardingSeen,
} from "features/preferences/PreferencesSlice";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";

import { WelcomeOnboardingModal } from "../WelcomeOnboardingModal/WelcomeOnboardingModal";

export function WelcomeOnboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userName = useAppSelector((state: any) => state.user.account.userName);
  const welcomeSeenAt = useAppSelector(
    (state: any) => state.preferences.onboarding?.welcomeSeenAt,
  );

  const open = !welcomeSeenAt;

  const markAsSeen = () => {
    dispatch(setWelcomeOnboardingSeen(new Date().toISOString()));
    dispatch(savePreferences());
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
