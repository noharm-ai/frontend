import React from "react";
import moment from "moment";
import { SearchOutlined } from "@ant-design/icons";

import { TextColumn } from "components/Table";
import Tooltip from "components/Tooltip";
import { Link } from "components/Button";
import PatientNameCache from "components/PatientName/PatientNameCache";
import * as patientCache from "utils/patientCache";

/* eslint-disable-next-line react-refresh/only-export-components */
const Action = ({ record }) => {
  return (
    <Link
      type="secondary"
      className="gtm-bt-detail-patient"
      href={`/prescricao/${record.idPrescription}`}
      target="_blank"
      icon={<SearchOutlined />}
    ></Link>
  );
};

const columns = (sortedInfo, filteredInfo, t) => {
  const sortDirections = ["descend", "ascend"];

  return [
    /*{
      key: 'idPatient',
      title: 'ID',
      sortDirections,
      sorter: (a, b) => a.idPatient - b.idPatient,
      sortOrder: sortedInfo.columnKey === 'idPatient' && sortedInfo.order,
      render: record => record.idPatient
    },*/
    {
      key: "namePatient",
      title: t("tableHeader.patient"),
      sortDirections,
      sorter: (a, b) => {
        const nameA =
          patientCache.getPatient(a.idPatient)?.name ?? `Paciente ${a.idPatient}`;
        const nameB =
          patientCache.getPatient(b.idPatient)?.name ?? `Paciente ${b.idPatient}`;
        return nameA.localeCompare(nameB);
      },
      sortOrder: sortedInfo.columnKey === "namePatient" && sortedInfo.order,
      render: (record) => <PatientNameCache idPatient={record.idPatient} />,
      filteredValue: filteredInfo.searchKey || null,
      onFilter: (value, record) =>
        (patientCache.getPatient(record.idPatient)?.name ?? "")
          .toLowerCase()
          .includes(value) ||
        `${record.admissionNumber}` === value ||
        `${record.idPatient}` === value,
    },
    /*{
      key: 'birthdate',
      title: t('tableHeader.birthdate'),
      sortDirections,
      sorter: (a, b) => moment(a.birthdate).unix() - moment(b.birthdate).unix(),
      sortOrder: sortedInfo.columnKey === 'birthdate' && sortedInfo.order,
      render: record => (record.birthdate ? moment(record.birthdate).format('DD/MM/YYYY') : '')
    },*/
    {
      key: "observation",
      title: t("tableHeader.observation"),
      sortDirections,
      sorter: (a, b) => `${a.observation}`.localeCompare(b.observation),
      sortOrder: sortedInfo.columnKey === "observation" && sortedInfo.order,
      render: (record) => {
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
      sorter: (a, b) =>
        moment(a.refDate || new Date()).unix() -
        moment(b.refDate || new Date()).unix(),
      sortOrder: sortedInfo.columnKey === "refDate" && sortedInfo.order,
      render: (record) =>
        record.refDate ? moment(record.refDate).format("DD/MM/YYYY") : "",
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => <Action record={record} />,
    },
  ];
};

export default columns;
