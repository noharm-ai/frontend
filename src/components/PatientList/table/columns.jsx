import React from "react";
import moment from "moment";
import { SearchOutlined } from "@ant-design/icons";

import { TextColumn } from "components/Table";
import Tooltip from "components/Tooltip";
import { Link } from "components/Button";

const Action = (record) => {
  return (
    <Link
      type="secondary gtm-bt-detail-patient"
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
      sorter: (a, b) => a.namePatient.localeCompare(b.namePatient),
      sortOrder: sortedInfo.columnKey === "namePatient" && sortedInfo.order,
      render: (record) => record.namePatient,
      filteredValue: filteredInfo.searchKey || null,
      onFilter: (value, record) =>
        record.namePatient.toLowerCase().includes(value) ||
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
      key: "lastAppointment",
      title: t("tableHeader.lastAppointment"),
      sortDirections,
      sorter: (a, b) =>
        moment(a.lastAppointment || new Date()).unix() -
        moment(b.lastAppointment || new Date()).unix(),
      sortOrder: sortedInfo.columnKey === "lastAppointment" && sortedInfo.order,
      render: (record) =>
        record.lastAppointment
          ? moment(record.lastAppointment).format("DD/MM/YYYY")
          : "",
    },
    {
      key: "nextAppointment",
      title: t("tableHeader.nextAppointment"),
      sortDirections,
      sorter: (a, b) =>
        moment(a.nextAppointment || new Date()).unix() -
        moment(b.nextAppointment || new Date()).unix(),
      sortOrder: sortedInfo.columnKey === "nextAppointment" && sortedInfo.order,
      render: (record) =>
        record.nextAppointment
          ? moment(record.nextAppointment).format("DD/MM/YYYY")
          : "",
    },
    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => <Action {...record} />,
    },
  ];
};

export default columns;
