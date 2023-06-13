import React from "react";
import { useSelector } from "react-redux";
import { SaveOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";

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

  const saveAll = () => {
    console.log("values", list);
  };

  return (
    <DrugFormStatusContainer completed={count.updated === count.total}>
      <div className="drug-form-status">
        <div className="drug-form-status-header">{title}</div>
        <div className="drug-form-status-content">
          {count.updated} / {count.total}
        </div>
      </div>
      <div className="drug-form-status-action">
        <Tooltip title="Salvar todos">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<SaveOutlined />}
            disabled={count.updated === count.total}
            onClick={saveAll}
          />
        </Tooltip>
      </div>
    </DrugFormStatusContainer>
  );
}

export default DrugFormStatus;
