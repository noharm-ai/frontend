import { motion } from "motion/react";
import { useEffect, useRef } from "react";

import { useAppSelector } from "src/store";
import { Question } from "./components/Question";
import { Response } from "./components/Response";
import { SupportForm } from "./components/SupportForm";

import { ScrollableContainer, ScrollAnchor } from "./SupportFormAI.style";

export function SupportFormAI() {
  const step = useAppSelector((state) => state.support.aiform.currentStep);
  const responseStatus = useAppSelector(
    (state) => state.support.aiform.askn0.status
  );
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Auto-scroll when new content appears
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM is updated

    return () => clearTimeout(timer);
  }, [step, responseStatus]);

  return (
    <ScrollableContainer>
      <Question />

      {step.indexOf("response") !== -1 && (
        <motion.div
          initial={{ opacity: 0, transform: "translate3d(0, 10px, 0)" }}
          animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onAnimationComplete={scrollToBottom}
        >
          <Response />
        </motion.div>
      )}
      {step.indexOf("form") !== -1 && (
        <motion.div
          initial={{ opacity: 0, transform: "translate3d(0, 10px, 0)" }}
          animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onAnimationComplete={scrollToBottom}
        >
          <SupportForm />
        </motion.div>
      )}

      <ScrollAnchor ref={scrollAnchorRef} />
    </ScrollableContainer>
  );
}
