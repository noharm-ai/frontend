import React from "react";
import { useSelector } from "react-redux";

import { DrugFormStatusContainer } from "./DrugFormStatus.style";

function DrugFormStatus({ title }) {
  const list = useSelector((state) => state.drugFormStatus.list);

  const count = {
    updated: 0,
    total: Object.keys(list).length,
  };

  Object.keys(list).forEach((k) => {
    if (list[k] && list[k].updated) {
      count.updated += 1;
    }
  });

  return (
    <DrugFormStatusContainer completed={count.updated === count.total}>
      <div className="drug-form-status-header">{title}</div>
      <div className="drug-form-status-content">
        {count.updated} / {count.total}
      </div>
    </DrugFormStatusContainer>
  );
}

export default DrugFormStatus;
