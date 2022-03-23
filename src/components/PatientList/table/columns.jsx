export default (sortedInfo, filteredInfo, t) => {
  const sortDirections = ['descend', 'ascend'];

  return [
    {
      key: 'idPatient',
      title: t('screeningList.actions'),
      filteredValue: filteredInfo.searchKey || null,
      onFilter: (value, record) => record.idPatient == value, // eslint-disable-line
      sortDirections,
      sorter: (a, b) => a.idPatient - b.idPatient,
      sortOrder: sortedInfo.columnKey === 'idPatient' && sortedInfo.order,
      render: record => record.idPatient
    }
  ];
};
