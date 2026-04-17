// react-jsx transform active — no React default import needed
import moment from "moment";
import { SearchOutlined } from "@ant-design/icons";

import { TextColumn } from "components/Table";
import Tooltip from "components/Tooltip";
import { Link } from "components/Button";
import PatientNameCache from "components/PatientName/PatientNameCache";
import * as patientCache from "utils/patientCache";

interface SortedInfo {
  order: string | false | undefined;
  columnKey: string;
}

interface FilteredInfo {
  searchKey: string[] | null;
}

/* eslint-disable-next-line react-refresh/only-export-components */
const Action = ({ record }: { record: any }) => {
  const LinkAny = Link as any;
  return (
    <LinkAny
      type="secondary"
      className="gtm-bt-detail-patient"
      href={`/prescricao/${record.idPrescription}`}
      target="_blank"
      icon={<SearchOutlined />}
    />
  );
};

export const columns = (
  sortedInfo: SortedInfo,
  filteredInfo: FilteredInfo,
  t: (key: string) => string
) => {
  const sortDirections = ["descend", "ascend"];

  return [
    {
      key: "namePatient",
      title: t("tableHeader.patient"),
      sortDirections,
      sorter: (a: any, b: any) => {
        const nameA =
          patientCache.getPatient(a.idPatient)?.name ?? `Paciente ${a.idPatient}`;
        const nameB =
          patientCache.getPatient(b.idPatient)?.name ?? `Paciente ${b.idPatient}`;
        return nameA.localeCompare(nameB);
      },
      sortOrder: (sortedInfo.columnKey === "namePatient" ? sortedInfo.order : undefined) as any,
      render: (record: any) => <PatientNameCache idPatient={record.idPatient} />,
      filteredValue: filteredInfo.searchKey || null,
      onFilter: (value: any, record: any) =>
        (patientCache.getPatient(record.idPatient)?.name ?? "")
          .toLowerCase()
          .includes(value) ||
        `${record.admissionNumber}` === value ||
        `${record.idPatient}` === value,
    },
    {
      key: "observation",
      title: t("tableHeader.observation"),
      sortDirections,
      sorter: (a: any, b: any) =>
        `${a.observation}`.localeCompare(b.observation),
      sortOrder: (sortedInfo.columnKey === "observation" ? sortedInfo.order : undefined) as any,
      render: (record: any) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = record.observation
          ? record.observation.split(/(<\/p>|<br>)/)[0]
          : "";
        const text = tmp.textContent || tmp.innerText || "";

        tmp.innerHTML = record.observation;
        const textComplete = tmp.textContent || tmp.innerText || "";

        return (
          <Tooltip title={textComplete} mouseEnterDelay={0.5}>
            <TextColumn>{text ? text.split("\n")[0] : ""}</TextColumn>
          </Tooltip>
        );
      },
    },
    {
      key: "refDate",
      title: t("tableHeader.scheduledDate"),
      sortDirections,
      sorter: (a: any, b: any) =>
        moment(a.refDate || new Date()).unix() -
        moment(b.refDate || new Date()).unix(),
      sortOrder: (sortedInfo.columnKey === "refDate" ? sortedInfo.order : undefined) as any,
      render: (record: any) =>
        record.refDate ? moment(record.refDate).format("DD/MM/YYYY") : "",
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (_: any, record: any) => <Action record={record} />,
    },
  ];
};
