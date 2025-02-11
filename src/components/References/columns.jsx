import React from "react";
import { FormOutlined } from "@ant-design/icons";
import moment from "moment";

import Button from "components/Button";
import Tooltip from "components/Tooltip";

import Escore from "./Escore";

const flags = ["green", "yellow", "orange", "red"];

const convDose = (outlier) => {
  if (outlier.division) {
    return (
      Number((outlier.dose - outlier.division).toFixed(2)) +
      "-" +
      outlier.dose +
      " " +
      outlier.unit +
      (outlier.useWeight ? "/Kg" : "")
    );
  } else {
    return outlier.dose + " " + outlier.unit + (outlier.useWeight ? "/Kg" : "");
  }
};

export default [
  {
    dataIndex: "class",
    key: "class",
    width: 20,
    render: (entry, { score, manualScore }) => (
      <span className={`flag ${flags[parseInt(manualScore || score)]}`} />
    ),
  },
  {
    title: "Medicamento",
    dataIndex: "name",
    width: 320,
  },
  {
    title: "Dose",
    dataIndex: "dose",
    width: 90,
    render: (entry, outlier) => convDose(outlier),
  },
  {
    title: "Frequência diária",
    dataIndex: "frequency",
    width: 65,
  },
  {
    title: "Escore",
    dataIndex: "score",
    width: 60,
  },
  {
    title: "Escore Manual",
    dataIndex: "manualScore",
    width: 60,
    render: (entry, outlier) => <Escore {...outlier} />,
  },
  {
    title: "Contagem",
    dataIndex: "countNum",
    width: 60,
  },
  {
    title: "Atualizado em",
    dataIndex: "countNum",
    width: 60,
    render: (entry, outlier) =>
      outlier.updatedAt
        ? moment(outlier.updatedAt).format("DD/MM/YYYY HH:mm")
        : "",
  },
  {
    title: "Ações",
    key: "operations",
    width: 70,
    align: "center",
    render: (text, outlier) => {
      const hasObs = outlier.obs !== "";

      return (
        <Tooltip
          title={hasObs ? "Ver/Editar comentário" : "Adicionar comentário"}
        >
          <Button
            type="primary"
            className="gtm-bt-view-obs"
            ghost={!hasObs}
            onClick={() => outlier.onShowObsModal(outlier)}
            icon={<FormOutlined />}
          ></Button>
        </Tooltip>
      );
    },
  },
].map((item) => ({ ...item, key: item.dataIndex }));
