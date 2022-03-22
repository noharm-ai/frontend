export default (sortedInfo, filteredInfo, t) => {
  const sortDirections = ['descend', 'ascend'];

  return [
    {
      key: 'id',
      title: t('screeningList.actions'),
      filteredValue: filteredInfo.searchKey || null,
      onFilter: (value, record) => record.id == value,
      sortDirections,
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
      render: record => record.id
    }
  ];
};
