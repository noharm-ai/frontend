import { motion } from "motion/react";

import { useAppSelector } from "src/store";
import { Question } from "./components/Question";
import { Response } from "./components/Response";
import { SupportForm } from "./components/SupportForm";

export function SupportFormAI() {
  const step = useAppSelector((state) => state.support.aiform.currentStep);

  return (
    <>
      <Question />

      {step.indexOf("response") !== -1 && (
        <motion.div
          initial={{ opacity: 0, transform: "translate3d(0, 10px, 0)" }}
          animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Response />
        </motion.div>
      )}
      {step.indexOf("form") !== -1 && (
        <motion.div
          initial={{ opacity: 0, transform: "translate3d(0, 10px, 0)" }}
          animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <SupportForm />
        </motion.div>
      )}
    </>
  );
}
