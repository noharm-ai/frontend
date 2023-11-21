const columns = (t) => {
  return [
    {
      title: "Exame",
      dataIndex: "type",
      align: "left",
      render: (entry, record) => {
        return record.type;
      },
    },
    {
      title: "Quantidade",
      dataIndex: "count",
      render: (entry, record) => {
        return record.count;
      },
    },
    {
      title: "Resultado mínimo",
      dataIndex: "min",
      render: (entry, record) => {
        return record.min;
      },
    },
    {
      title: "Resultado máximo",
      dataIndex: "max",
      render: (entry, record) => {
        return record.max;
      },
    },
  ];
};

export default columns;
