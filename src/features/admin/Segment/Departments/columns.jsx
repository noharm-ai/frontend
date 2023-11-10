import { Tooltip } from "antd";

const columns = (t) => {
  return [
    {
      title: "Setor",
      dataIndex: "name",
      align: "left",
      render: (entry, record) => {
        if (record.uses > 0) {
          return (
            <Tooltip title="Setor utilizado em outro segmento" underline>
              {record.name}
            </Tooltip>
          );
        }

        return record.name;
      },
    },
    {
      title: "Hospital",
      dataIndex: "hospitalName",
      align: "left",
      render: (entry, record) => {
        return record.hospitalName;
      },
    },
  ];
};

export default columns;
