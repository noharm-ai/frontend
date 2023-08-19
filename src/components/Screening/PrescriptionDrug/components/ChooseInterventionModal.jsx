import React from "react";
import moment from "moment";
import { RightOutlined, PlusOutlined } from "@ant-design/icons";

import Button from "components/Button";

import { InterventionListContainer } from "../PrescriptionDrug.style";

function ChooseInterventionModal({
  interventions,
  completeData,
  selectIntervention,
}) {
  return (
    <InterventionListContainer>
      <div className="action">
        <Button
          onClick={() => selectIntervention({}, completeData)}
          icon={<PlusOutlined />}
          type="primary"
        >
          Nova intervenção
        </Button>
      </div>
      {interventions.map((i) => (
        <div
          className="intervention"
          onClick={() => selectIntervention(i, completeData)}
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
