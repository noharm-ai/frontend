import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { InfoCircleFilled } from "@ant-design/icons";

import { EvaluationWarningContainer } from "./EvaluationWarning.style";
import { startEvaluation } from "../PrescriptionSlice";

export default function EvaluationWarning() {
  const dispatch = useDispatch();
  const prescription = useSelector((state) => state.prescriptions.single.data);
  const currentUserId = useSelector((state) => state.user.account.userId);

  useEffect(() => {
    if (prescription.idPrescription && !prescription.isBeingEvaluated) {
      dispatch(
        startEvaluation({ idPrescription: prescription.idPrescription })
      );
    }
  }, [prescription]); //eslint-disable-line

  if (
    !prescription.isBeingEvaluated ||
    (prescription.isBeingEvaluated &&
      `${currentUserId}` === `${prescription.features["evaluation"].userId}`)
  ) {
    return null;
  }

  return (
    <EvaluationWarningContainer>
      <InfoCircleFilled />
      <div>
        Esta prescrição está sendo analisada por{" "}
        <strong>{prescription.features["evaluation"].userName}</strong>. A
        análise foi iniciada em{" "}
        {dayjs(prescription.features["evaluation"].startDate).format(
          "DD/MM/YYYY HH:mm"
        )}
      </div>
    </EvaluationWarningContainer>
  );
}
