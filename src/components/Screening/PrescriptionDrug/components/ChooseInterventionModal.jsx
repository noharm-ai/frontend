import React from "react";

function ChooseInterventionModal({
  interventions,
  completeData,
  selectIntervention,
}) {
  return (
    <>
      {interventions.map((i) => (
        <div onClick={() => selectIntervention(i, completeData)}>
          {i.date} - {i.reasonDescription}
        </div>
      ))}
    </>
  );
}

export default ChooseInterventionModal;
