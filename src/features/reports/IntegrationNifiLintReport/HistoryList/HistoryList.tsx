import { useState } from "react";
import { Descriptions, Tag } from "antd";

import { useAppSelector } from "src/store";
import { CardTable } from "components/Table";
import { Textarea } from "src/components/Inputs";
import Tooltip from "src/components/Tooltip";
import { formatDateTime } from "src/utils/date";

export function HistoryList() {
  const [expandedRows, setExpandedRows] = useState<any>([]);
  const datasource = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filtered.result.list
  );
  const errorKeys = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.errorKeys
  );

  const updateExpandedRows = (list: any, key: any) => {
    if (list.includes(key)) {
      return list.filter((i: any) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record: any) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.id));
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(
        datasource
          .filter((i: any) => /^[0-9]*$/g.test(i.id))
          .map((i: any) => i.id)
      );
    }
  };

  const ExpandColumn = ({ expand }: any) => {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className={`expand-all ant-table-row-expand-icon ${
            expand ? "ant-table-row-expand-icon-collapsed" : ""
          }`}
          onClick={toggleExpansion}
        ></button>
      </div>
    );
  };

  const columns = [
    {
      title: "Schema",
      width: 200,
      render: (_: any, record: any) => record.schema,
      sorter: (a: any, b: any) => {
        return `${a.schema}`.localeCompare(`${b.schema}`);
      },
    },

    {
      title: "Check",
      align: "center",
      render: (_: any, record: any) => {
        return (
          <Tooltip title={errorKeys[record.key]?.title} underline>
            {record.key}
          </Tooltip>
        );
      },
      sorter: (a: any, b: any) => {
        return `${a.key}`.localeCompare(`${b.key}`);
      },
    },
    {
      title: "Level",
      width: 100,
      align: "center",
      render: (_: any, record: any) => {
        const tagStyle = { margin: 0 };
        switch (record.level) {
          case "LOW":
            return (
              <Tag color="blue" style={tagStyle}>
                {record.level}
              </Tag>
            );
          case "MEDIUM":
            return (
              <Tag color="orange" style={tagStyle}>
                {record.level}
              </Tag>
            );
          case "HIGH":
            return (
              <Tag color="red" style={tagStyle}>
                {record.level}
              </Tag>
            );
          case "CRITICAL":
            return (
              <Tag color="magenta" style={tagStyle}>
                {record.level}
              </Tag>
            );
          default:
            return <Tag style={tagStyle}>{record.level}</Tag>;
        }
      },
    },
    {
      title: "Nome",
      render: (_: any, record: any) => record.name,
      sorter: (a: any, b: any) => {
        return `${a.name}`.localeCompare(`${b.name}`);
      },
    },
    {
      title: "Grupo",
      render: (_: any, record: any) => record.group,
    },
  ];

  return (
    <>
      <CardTable<any>
        bordered
        columns={columns}
        rowKey="id"
        dataSource={datasource.length === 0 ? [] : datasource}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {datasource.length} registro(s)
          </div>
        )}
        expandable={{
          expandedRowRender: (record: any) => (
            <ExpandedRow record={record} errorKeys={errorKeys} />
          ),
          onExpand: (_: any, record: any) => handleRowExpand(record),
          expandedRowKeys: expandedRows,
        }}
        onRow={(record: any) => {
          return {
            onClick: () => {
              handleRowExpand(record);
            },
          };
        }}
        columnTitle={<ExpandColumn expand={!expandedRows.length} />}
        size="small"
        pagination={{ showSizeChanger: false, pageSize: 50 }}
      />
    </>
  );
}

const ExpandedRow = ({ record, errorKeys }: any) => {
  const items: any[] = [];
  const propItems: any[] = [];

  Object.keys(record.properties).forEach((key: string) => {
    propItems.push({
      label: key,
      span: 3,
      children: <Textarea value={record.properties[key]} readOnly></Textarea>,
    });
  });

  items.push({
    label: (
      <Tooltip
        title={
          "Data do arquivo de template onde a ocorrência foi encontrada. Este arquivo é atualizado de 1h em 1h."
        }
        underline
      >
        Data do Template
      </Tooltip>
    ),
    span: 3,
    children: formatDateTime(record.backupDate),
  });

  items.push({
    label: "Tipo",
    span: 3,
    children: record.type,
  });
  items.push({
    label: "Instance Identifier",
    span: 3,
    children: record.instance_identifier,
  });
  items.push({
    label: "Propriedades",
    span: 3,
    children: <Descriptions bordered items={propItems} size="small" />,
  });
  items.push({
    label: "Descrição do check",
    span: 3,
    children: (
      <div style={{ maxWidth: "700px" }}>
        {errorKeys[record.key]?.description}
      </div>
    ),
  });
  items.push({
    label: "Ação recomendada",
    span: 3,
    children: (
      <div style={{ maxWidth: "700px" }}>{errorKeys[record.key]?.action}</div>
    ),
  });

  return <Descriptions bordered items={items} size="small" />;
};
