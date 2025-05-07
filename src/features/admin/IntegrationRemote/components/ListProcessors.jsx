import { React, useState } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Input, Select, Button } from "antd/lib";
import { CardTable } from "components/Table";
import NodeStatusTag from "./NodeStatusTag";

export default function ListProcessors() {
  const status = useSelector(
    (state) => state.admin.integrationRemote.template.status
  );

  const [nameFilter, setNameFilter] = useState("");
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const datasource = Object.values(status ?? {})
    .map((v) => {
      return v;
    })
    .filter((v) => v.type);

  const statusCounts = datasource.reduce((acc, item) => {
    acc[item.runStatus] = (acc[item.runStatus] || 0) + 1;
    return acc;
  }, {});

  const groupOptions = [...new Set(datasource.map((v) => v.groupName))]
    .sort()
    .map((g) => {
      return {
        value: g,
        label: g,
      };
    });

  const typeOptions = [...new Set(datasource.map((v) => v.type))]
    .sort()
    .map((t) => {
      return {
        value: t,
        label: t,
      };
    });

  const filteredDatasource = datasource
    .filter((v) =>
      nameFilter
        ? v.name.toLocaleLowerCase().includes(nameFilter) ||
          v.id
            .replace(/[-]/g, "")
            .toLocaleLowerCase()
            .includes(nameFilter.replace(/[-]/g, ""))
        : true
    )
    .filter((v) =>
      selectedGroup.length > 0 ? selectedGroup.includes(v.groupName) : true
    )
    .filter((v) =>
      selectedStatuses.length > 0
        ? selectedStatuses.includes(v.runStatus)
        : true
    )
    .filter((v) =>
      selectedTypes.length > 0 ? selectedTypes.includes(v.type) : true
    );

  const columns = [
    {
      title: "Nome",
      align: "left",
      width: 250,
      render: (_, record) => record.name,
    },
    {
      title: "InstanceId",
      align: "left",
      width: 250,
      render: (_, record) => record.id,
    },
    {
      title: "Tipo",
      align: "left",
      width: 150,
      render: (_, record) => record.type,
    },
    {
      title: "Grupo",
      align: "left",
      width: 150,
      render: (_, record) => record.groupName,
    },
    {
      title: "Status",
      align: "center",
      width: 80,
      render: (_, record) => (
        <NodeStatusTag status={record.runStatus} showIcon={false} />
      ),
    },
  ];

  const rowClassName = (record) => {
    if (record.runStatus === "Stopped") {
      return "danger";
    }

    return "";
  };

  const handleClickStatus = (status) => () => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(status);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Running: "green",
      Stopped: "red",
      Validating: "orange",
    };
    return statusColors[status] || "gray";
  };

  const renderStatusButtons = (statusCounts, handleClick, getStatusColor) => {
    return (
      <Row
        justify="center"
        gutter={[16, 16]}
        style={{ marginBottom: "24px", marginLeft: "24px" }}
      >
        {Object.entries(statusCounts).map(([status, count]) => {
          const isSelected = selectedStatuses.includes(status);
          const statusColor = getStatusColor(status); // Function to get the color for the status

          return (
            <Col key={status} span={6}>
              <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                <Button
                  type={isSelected ? "primary" : "default"}
                  onClick={handleClickStatus(status)}
                  size="large"
                  className={`gtm-lnk-filter-presc-checada ant-btn-link-hover`}
                  style={{
                    backgroundColor: isSelected ? statusColor : "white",
                    borderColor: statusColor,
                    color: isSelected ? "white" : statusColor,
                  }}
                >
                  <NodeStatusTag status={status} showIcon={false} />
                  {count}
                </Button>
              </div>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <>
      {renderStatusButtons(statusCounts, handleClickStatus, getStatusColor)}
      <Row align="middle" gutter={16} style={{ marginBottom: "12px" }}>
        <Col span={8}>
          <span>Filtrar por nome ou instanceId:</span>
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
            value={selectedGroup}
            onChange={(values) => {
              setSelectedGroup(values);
            }}
            options={groupOptions}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Selecione um ou mais grupos"
            allowClear
          />
        </Col>
        <Col span={8}>
          <span>Tipo:</span>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            value={selectedTypes}
            onChange={(values) => {
              setSelectedTypes(values);
            }}
            options={typeOptions}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Selecione um ou mais tipos"
            allowClear
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
