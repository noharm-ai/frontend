export default [
  {
    title: 'Medicamento',
    dataIndex: 'drugName',
    width: 350
  },
  {
    title: 'Unidade',
    dataIndex: 'description',
    width: 50
  },
  {
    title: 'Fator',
    dataIndex: 'fator',
    width: 40,
    //render: (entry, record) => <Coefficient {...record} />
  },
  {
    title: 'Contagem',
    dataIndex: 'contagem',
    width: 40
  }
].map(item => ({ ...item, key: item.dataIndex }));
