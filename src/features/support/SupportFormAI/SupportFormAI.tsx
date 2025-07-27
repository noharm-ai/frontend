import { useAppSelector } from "src/store";

import { Question } from "./components/Question";
import { Response } from "./components/Response";
import { SupportForm } from "./components/SupportForm";

export function SupportFormAI() {
  const step = useAppSelector((state) => state.support.aiform.currentStep);

  return (
    <>
      {step === "question" && <Question />}
      {step === "response" && <Response />}
      {step === "form" && <SupportForm />}
    </>
  );
}
