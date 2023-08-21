import React from "react";
import moment from "moment";
import { RightOutlined, PlusOutlined } from "@ant-design/icons";

import Button from "components/Button";

import { InterventionListContainer } from "../PrescriptionDrug.style";

function ChooseInterventionModal({
  interventions,
  completeData,
  selectIntervention,
  modalRef,
}) {
  const select = (intvData) => {
    selectIntervention(intvData, completeData);
    if (modalRef) {
      modalRef.update({ transitionName: "" });
      setTimeout(() => {
        modalRef.destroy();
      }, 500);
    }
  };

  return (
    <InterventionListContainer>
      <div className="action">
        <Button
          onClick={() => select({})}
          icon={<PlusOutlined />}
          type="primary"
        >
          Nova intervenção
        </Button>
      </div>
      {interventions
        .filter((i) => i.status !== "0")
        .map((i) => (
          <div
            className="intervention"
            key={i.idIntervention}
            onClick={() => select(i)}
          >
            <div>
              <div className="date">
                {moment(i.date).format("DD/MM/YYYY hh:mm")}
              </div>
              <div className="description">{i.reasonDescription}</div>
            </div>
            <RightOutlined />
          </div>
        ))}
    </InterventionListContainer>
  );
}

export default ChooseInterventionModal;
