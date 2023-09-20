import React from "react";
import moment from "moment";
import { RightOutlined, PlusOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tag from "components/Tag";
import interventionStatus from "models/InterventionStatus";

import { InterventionListContainer } from "../PrescriptionDrug.style";

function ChooseInterventionModal({
  interventions,
  completeData,
  selectIntervention,
  modalRef,
  translate,
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

  const getConfig = (i) => {
    const config = interventionStatus.translate(i.status, translate);

    if (config) {
      return <Tag color={config.color}>{config.label}</Tag>;
    }
  };

  return (
    <InterventionListContainer>
      <div className="action">
        <Button
          onClick={() => select({ nonce: Math.random() })}
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
                {moment(i.date).format("DD/MM/YYYY HH:mm")}
              </div>
              <div className="description">{i.reasonDescription}</div>
              <div className="tag">{getConfig(i)}</div>
            </div>
            <RightOutlined />
          </div>
        ))}
    </InterventionListContainer>
  );
}

export default ChooseInterventionModal;
