import React from "react";

import Edit from "./Edit";

const columns = (bool, t) => {
  return [
    {
      title: "Frequência",
      dataIndex: "name",
      width: 300,
    },
    {
      title: "Frequência Dia",
      render: (entry, record) => (
        <Edit id={record.id} dailyFrequency={record.dailyFrequency} />
      ),
    },
  ];
};
export default columns;
