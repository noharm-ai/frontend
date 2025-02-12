import { Tooltip } from "antd";

const columns = () => {
  return [
    {
      title: "ID Setor",
      dataIndex: "idDepartment",
      align: "center",
      render: (entry, record) => {
        return record.idDepartment;
      },
    },
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
