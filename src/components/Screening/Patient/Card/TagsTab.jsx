import React from "react";
import { EditOutlined } from "@ant-design/icons";
import { Tag } from "antd";

import Button from "components/Button";

export default function TagsTab({ prescription, setModalVisibility }) {
  const { patient } = prescription;

  return (
    <div className="patient-data">
      <div className="patient-data-item full edit">
        <div className="patient-data-item-label">Tags do paciente</div>
        <div className="patient-data-item-tags ">
          {patient?.tags
            ? patient?.tags.map((tag) => (
                <Tag style={{ marginRight: 0, fontSize: "13px" }}>{tag}</Tag>
              ))
            : "--"}
        </div>
        <div className="patient-data-item-edit text">
          <Button
            type="link"
            onClick={() => setModalVisibility("patientEdit", true)}
            icon={<EditOutlined style={{ fontSize: 18, color: "#fff" }} />}
          ></Button>
        </div>
      </div>
    </div>
  );
}
