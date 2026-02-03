import { useSelector } from "react-redux";

import { formatDateTime } from "utils/date";
import { CardTable } from "components/Table";
import RichTextView from "src/components/RichTextView";
import { RichTextContainerCompact } from "src/components/RichTextContainer";

export default function ObservationsList() {
  const datasource = useSelector(
    (state: any) => state.reportsArea.patientObservation.filtered.result.list,
  );

  const columns = [
    {
      title: "Anotação",
      render: (_: any, record: any) =>
        record.text ? (
          <RichTextContainerCompact>
            <RichTextView text={record.text} maxWidth={500} />
          </RichTextContainerCompact>
        ) : (
          "-"
        ),
    },
    {
      title: "Criado por",
      width: 200,
      sorter: (a: any, b: any) =>
        a.createdBy < b.createdBy ? -1 : a.createdBy > b.createdBy ? 1 : 0,
      render: (_: any, record: any) =>
        record.createdBy ? record.createdBy : "-",
    },
    {
      title: "Data de Criação",
      width: 160,
      sorter: (a: any, b: any) =>
        a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
      render: (_: any, record: any) => formatDateTime(record.createdAt),
    },
  ];

  return (
    <>
      <CardTable
        bordered
        columns={columns}
        rowKey={(row: any) => `${row.id}-${row.createdAt}`}
        dataSource={datasource.length === 0 ? [] : datasource}
        footer={() => (
          <div style={{ textAlign: "center" }}>
            {datasource.length} registro(s)
          </div>
        )}
        size="small"
        pagination={{ showSizeChanger: true }}
      />
    </>
  );
}
