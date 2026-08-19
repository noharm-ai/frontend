import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { InteractionOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import Button from "components/Button";
import { ModalFooter } from "styles/Utils.style";
import {
  reset,
  setStage,
  requestCancel,
  runMultipleOutcomeThunk,
} from "./MultipleOutcomeSlice";
import { ConfirmStep } from "./ConfirmStep";
import { ProcessingStep } from "./ProcessingStep";
import { OutcomeReviewStep } from "./OutcomeReviewStep";
import { MultipleOutcomeReport } from "./MultipleOutcomeReport";

export function MultipleOutcome() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const open = useSelector((state) => state.multipleInterventionOutcome.open);
  const stage = useSelector(
    (state) => state.multipleInterventionOutcome.stage,
  );
  const cancelRequested = useSelector(
    (state) => state.multipleInterventionOutcome.cancelRequested,
  );
  const reviewQueue = useSelector(
    (state) => state.multipleInterventionOutcome.reviewQueue,
  );
  const reviewIndex = useSelector(
    (state) => state.multipleInterventionOutcome.reviewIndex,
  );

  useEffect(() => {
    if (open && stage === "processing") {
      dispatch(runMultipleOutcomeThunk(t));
    }
  }, [open, stage, dispatch, t]);

  const currentReviewItem = reviewQueue[reviewIndex];

  const getWidth = () => {
    if (stage === "review") {
      return currentReviewItem?.outcomeData?.header?.economyType === 2
        ? 800
        : 600;
    }

    if (stage === "processing") {
      return 600;
    }

    return 700;
  };

  const onCancel = () => {
    if (stage === "processing") {
      dispatch(requestCancel());
      return;
    }

    if (stage === "review") {
      return;
    }

    dispatch(reset());
  };

  const renderFooter = () => {
    if (stage === "confirm") {
      return (
        <ModalFooter>
          <Button onClick={() => dispatch(reset())}>
            {t("actions.cancel")}
          </Button>
          <Button type="primary" onClick={() => dispatch(setStage("processing"))}>
            {t("multipleIntervention.apply")}
          </Button>
        </ModalFooter>
      );
    }

    if (stage === "processing") {
      return (
        <ModalFooter>
          <Button
            danger
            disabled={cancelRequested}
            loading={cancelRequested}
            onClick={() => dispatch(requestCancel())}
          >
            {t("actions.cancel")}
          </Button>
        </ModalFooter>
      );
    }

    if (stage === "finished") {
      return (
        <ModalFooter>
          <Button type="primary" onClick={() => dispatch(reset())}>
            {t("actions.close")}
          </Button>
        </ModalFooter>
      );
    }

    // review stage renders its own footer inside the form
    return null;
  };

  return (
    <DefaultModal
      open={open}
      width={getWidth()}
      footer={renderFooter()}
      centered
      onCancel={onCancel}
      destroyOnHidden
      maskClosable={false}
      closable={stage !== "processing" && stage !== "review"}
    >
      <Heading $margin="0 0 20px" style={{ fontSize: "1.2rem" }}>
        <InteractionOutlined
          style={{
            marginRight: "5px",
            color: "#7ebe9a",
            fontSize: "1.2rem",
          }}
        />{" "}
        {t("multipleIntervention.title")}
      </Heading>

      {stage === "confirm" && <ConfirmStep />}
      {stage === "processing" && <ProcessingStep />}
      {stage === "review" && currentReviewItem && (
        <OutcomeReviewStep key={currentReviewItem.idIntervention} />
      )}
      {stage === "finished" && <MultipleOutcomeReport />}
    </DefaultModal>
  );
}
