import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Input, Select } from "antd/lib";
import { CardTable } from "components/Table";

export default function ListConnections() {
  const status = useSelector(
    (state) => state.admin.integrationRemote.template.status
  );

  const [nameFilter, setNameFilter] = useState("");
  const [selectedGroup, setSelectedGroup] = useState([]);

  const datasource = Object.values(status ?? {}).map((v) => {
    return v;
  });

  const filteredDatasource = datasource
    .filter((v) => v.sourceName)
    .filter((v) => {
      return (
        v.sourceName.toLocaleLowerCase().includes(nameFilter) ||
        v.destinationName.toLocaleLowerCase().includes(nameFilter)
      );
    })
    .filter((v) =>
      selectedGroup.length > 0 ? selectedGroup.includes(v.groupName) : true
    )
    .sort((a, b) => b.bytesQueued - a.bytesQueued);

  const groupNames = [...new Set(datasource.map((v) => v.groupName))].sort();

  const items = groupNames.map((g) => {
    return {
      value: g,
      label: g,
    };
  });

  const columns = [
    {
      title: "Origem",
      align: "left",
      width: 200,
      render: (_, record) => record.sourceName,
    },
    {
      title: "Destino",
      align: "left",
      width: 200,
      render: (_, record) => record.destinationName,
    },
    {
      title: "Grupo",
      align: "left",
      width: 150,
      render: (_, record) => record.groupName,
    },
    {
      title: "Contagem",
      align: "right",
      width: 100,
      sorter: (a, b) => a.queuedCount - b.queuedCount,
      render: (_, record) => record.queuedCount,
    },
    {
      title: "Size (KB)",
      align: "right",
      width: 100,
      sorter: (a, b) => a.bytesQueued - b.bytesQueued,
      render: (_, record) => (record.bytesQueued / 1024).toFixed(2),
    },
  ];

  const rowClassName = (record) => {
    if (record.bytesQueued > 512000 || record.queuedCount > 30) {
      return "danger";
    }

    return "";
  };

  return (
    <>
      <Row align="middle" gutter={16} style={{ marginBottom: "12px" }}>
        <Col span={8}>
          <span>Filtrar por origem ou destino:</span>
          <Input
            placeholder="..."
            onChange={(e) => setNameFilter(e.target.value.toLocaleLowerCase())}
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={8}>
          <span>Grupo:</span>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            value={selectedGroup} // Bind the value to the selectedGroup state
            onChange={(values) => {
              setSelectedGroup(values); // Update the state with selected values
            }}
            options={items}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Selecione um ou mais grupos"
            allowClear
            className="select-group"
          />
        </Col>
      </Row>
      <CardTable
        bordered
        columns={columns}
        rowKey="id"
        dataSource={filteredDatasource ?? []}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {filteredDatasource?.length} registro(s)
          </div>
        )}
        size="small"
        pagination={{ showSizeChanger: true }}
        rowClassName={(record) => rowClassName(record)}
      />
    </>
  );
}
