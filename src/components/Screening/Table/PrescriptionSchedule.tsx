import { Tag, Tooltip } from "antd";
import type { TableProps } from "antd";

import { formatDate, formatDateTime } from "src/utils/date";
import { ScrollableTable } from "./PrescriptionSchedule.style";

interface IPrescriptionSchedule {
  schedule: string[];
}

interface IDataType {
  key: string;
  [key: string]: string;
}

export function PrescriptionSchedule({ schedule }: IPrescriptionSchedule) {
  const datasource: IDataType = { key: "1" };
  const columns: TableProps<IDataType>["columns"] = [
    {
      title: "Aprazamento",
      align: "left",
      width: 120,
      fixed: "left",
      render: () => <strong>Administração</strong>,
    },
  ];

  schedule.forEach((s, index) => {
    const key = `index_${index}`;
    datasource[key] = s[1];
    const format = "DD/MM HH:mm";

    columns.push({
      title: formatDate(s[0], format),
      align: "center",
      width: 80,
      render: (_, record) => {
        if (record[key]) {
          if (record[key] === "0001-01-01T00:00:00") {
            return (
              <Tag color="red" style={{ margin: 0 }}>
                Não administrado
              </Tag>
            );
          }

          return (
            <Tooltip title={`Administrado em: ${formatDateTime(record[key])}`}>
              <Tag color="success" style={{ margin: 0 }}>
                {formatDate(record[key], "HH:mm")}
              </Tag>
            </Tooltip>
          );
        }

        return (
          <Tag color="warning" style={{ margin: 0 }}>
            Pendente
          </Tag>
        );
      },
    });
  });

  return (
    <ScrollableTable
      bordered
      columns={columns}
      dataSource={[datasource]}
      size="small"
      pagination={false}
      scroll={{ x: "max-content" }}
      style={{ width: "60vw" }}
    />
  );
}
