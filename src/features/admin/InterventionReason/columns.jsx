const columns = (t) => {
  return [
    {
      title: "Motivo",
      dataIndex: "name",
      render: (entry, record) => {
        return record.parentName
          ? `${record.parentName} - ${record.name}`
          : record.name;
      },
    },
    {
      title: "Ativo",
      render: (entry, record) => {
        return record.active ? "Sim" : "Não";
      },
    },
  ];
};

export default columns;
