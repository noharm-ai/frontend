import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { InfoCircleFilled } from "@ant-design/icons";

import { EvaluationWarningContainer } from "./EvaluationWarning.style";
import { startEvaluation } from "../PrescriptionSlice";

const POLLING_INTERVAL = 60000;

export default function EvaluationWarning() {
  const dispatch = useDispatch();
  const prescription = useSelector((state) => state.prescriptions.single.data);
  const currentUserId = useSelector((state) => state.user.account.userId);
  const evaluationData = useSelector(
    (state) => state.prescriptionv2.evaluation.data
  );

  useEffect(() => {
    const idPrescription = prescription.idPrescription;
    if (!idPrescription) {
      return;
    }

    let intervalId = null;

    const poll = () => {
      dispatch(startEvaluation({ idPrescription }));
    };

    const startPolling = () => {
      poll();
      intervalId = setInterval(poll, POLLING_INTERVAL);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, [prescription.idPrescription]); //eslint-disable-line

  const viewers = Array.isArray(evaluationData) ? evaluationData : [];
  const otherViewers = viewers.filter(
    (viewer) => `${viewer.userId}` !== `${currentUserId}`
  );

  if (otherViewers.length === 0) {
    return null;
  }

  const [firstViewer, ...restViewers] = otherViewers;

  return (
    <EvaluationWarningContainer>
      <InfoCircleFilled />
      <div>
        Esta prescrição está sendo visualizada por{" "}
        <strong>{firstViewer.userName}</strong>
        {restViewers.length > 0 && ` e mais ${restViewers.length} pessoa(s)`}.
      </div>
    </EvaluationWarningContainer>
  );
}
