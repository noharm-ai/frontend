import { Avatar } from "antd";
import { motion } from "motion/react";

import { useAppSelector } from "src/store";
import { Question } from "./components/Question";
import { Response } from "./components/Response";
import { SupportForm } from "./components/SupportForm";

import { ChatHeader } from "./SupportFormAI.style";

export function SupportFormAI() {
  const step = useAppSelector((state) => state.support.aiform.currentStep);

  return (
    <>
      {step === "question" ? (
        <Question />
      ) : (
        <>
          <ChatHeader>
            <Avatar
              size={60}
              src="/imgs/n0-pharma.png"
              style={{
                flexShrink: 0,
                border: "2px solid #FF8845",
              }}
            />
            <h2>Suporte NoHarm</h2>
          </ChatHeader>
          <motion.div
            initial={{ opacity: 0, transform: "translate3d(0, 10px, 0)" }}
            animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            key={step}
          >
            {step === "response" && <Response />}
            {step === "form" && <SupportForm />}
          </motion.div>
        </>
      )}
    </>
  );
}
