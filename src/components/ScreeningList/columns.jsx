import React from "react";
import styled from "styled-components/macro";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";

import { Link } from "components/Button";
import { InfoIcon } from "components/Icon";
import Tooltip from "components/Tooltip";
import Table from "components/Table";
import Tag from "components/Tag";

const setDataIndex = (list) =>
  list.map(({ key, ...column }) => ({
    ...column,
    key,
    dataIndex: key,
  }));

const Flag = styled.span`
  border-radius: 3px;
  display: inline-block;
  height: 15px;
  width: 5px;

  &.red {
    background-color: #e46666;
  }

  &.orange {
    background-color: #e67e22;
  }

  &.yellow {
    background-color: #e4da66;
  }

  &.green {
    background-color: #7ebe9a;
  }

  &.blue {
    background-color: #66c7e4;
  }
`;

const ActionsBox = styled.div`
  display: flex;
  justify-content: center;

  @media (min-width: 768px) {
    text-align: right;

    .ant-btn:last-child {
      margin-left: 5px;
    }
  }
`;

const NestedTableContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 35px;
`;

const ScreeningActions = ({
  idPrescription,
  status,
  slug,
  checkScreening,
  check,
  prioritizationType,
  t,
}) => {
  return (
    <ActionsBox>
      <Tooltip title={t("screeningList.btnOpen")} placement="left">
        <span>
          <Link
            type="secondary gtm-bt-detail"
            href={
              prioritizationType === "conciliation"
                ? `/conciliacao/${slug}`
                : `/prescricao/${slug}`
            }
            target="_blank"
          >
            <SearchOutlined />
          </Link>
        </span>
      </Tooltip>
    </ActionsBox>
  );
};

export const defaultAction = {
  title: "Ações",
  key: "operations",
  width: 70,
  align: "center",
  render: (text, prescription) => <ScreeningActions {...prescription} />,
};

export const desktopAction = {
  ...defaultAction,
};

export const expandedRowRender = (t) => {
  return (record) => {
    const columns = setDataIndex([
      {
        title: t("screeningList.clExName"),
        width: 150,
        key: "namePatient",
      },
      {
        title: t("screeningList.clExDate"),
        width: 100,
        key: "dateFormated",
        align: "center",
      },
      {
        title: t("screeningList.clExDepartment"),
        width: 150,
        key: "department",
      },
      {
        title: t("screeningList.clExAdmissionNumber"),
        width: 100,
        render: (i) => {
          if (!i.prescriptionAggId || !i.processed || i.agg) {
            return i.admissionNumber;
          }

          return (
            <Tooltip title="Clique para visualizar a Prescrição-Dia do paciente">
              <a
                href={`/prescricao/${i.prescriptionAggId}`}
                rel="noreferrer"
                target="_blank"
              >
                {i.admissionNumber}
              </a>
            </Tooltip>
          );
        },
      },
      {
        title: t("screeningList.clExPrescription"),
        width: 100,
        key: "idPrescription",
      },
      {
        title: t("labels.insurance"),
        width: 100,
        key: "insurance",
      },
    ]);

    return (
      <NestedTableContainer>
        <Table columns={columns} dataSource={[record]} pagination={false} />
      </NestedTableContainer>
    );
  };
};

const oddClass = (index) => (index % 2 ? "bg-light-gray" : "");

const sortDirections = ["descend", "ascend"];

const columns = (sortedInfo, filteredInfo, t) => {
  let index = 0;

  const patientRiskColumns = [
    {
      title: (
        <Tooltip title={t("screeningList.clAgeHint")}>
          {t("screeningList.clAge")}
        </Tooltip>
      ),
      className: `gtm-th-idade ${oddClass(index++)}`,
      key: "age",
      width: 40,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.birthdays - b.birthdays,
      sortOrder: sortedInfo.columnKey === "age" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clLengthHint")}>
          {t("screeningList.clLength")}
        </Tooltip>
      ),
      className: `gtm-th-tempo-int ${oddClass(index++)}`,
      key: "lengthStay",
      render: (entry, { lengthStay, dischargeFormated, dischargeReason }) => {
        if (dischargeFormated) {
          return (
            <Tooltip
              title={`Paciente com ${
                dischargeReason || "alta"
              } em ${dischargeFormated}`}
              placement="top"
            >
              {lengthStay} <InfoIcon />
            </Tooltip>
          );
        }
        return lengthStay;
      },
      width: 30,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.lengthStay - b.lengthStay,
      sortOrder: sortedInfo.columnKey === "lengthStay" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clExamHint")}>
          {t("screeningList.clExam")}
        </Tooltip>
      ),
      className: `gtm-th-exames ${oddClass(index++)}`,
      key: "alertExams",
      width: 30,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.alertExams - b.alertExams,
      sortOrder: sortedInfo.columnKey === "alertExams" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clAlertHint")}>
          {t("screeningList.clAlert")}
        </Tooltip>
      ),
      className: `ant-table-right-border gtm-th-alerts ${oddClass(index++)}`,
      key: "alerts",
      width: 30,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.alerts - b.alerts,
      sortOrder: sortedInfo.columnKey === "alerts" && sortedInfo.order,
    },
  ];

  patientRiskColumns.push({
    title: (
      <Tooltip title={t("screeningList.clAdverseEventsHint")}>
        {t("screeningList.clAdverseEvents")}
      </Tooltip>
    ),
    className: `ant-table-right-border gtm-th-ea ${oddClass(index++)}`,
    key: "complication",
    width: 30,
    align: "center",
    sortDirections,
    sorter: (a, b) => a.complication - b.complication,
    sortOrder: sortedInfo.columnKey === "complication" && sortedInfo.order,
  });

  const prescriptionRiskColumns = [
    {
      title: (
        <Tooltip title={t("screeningList.clAmHint")}>
          {t("screeningList.clAm")}
        </Tooltip>
      ),
      className: `gtm-th-am ${oddClass(index++)}`,
      key: "am",
      width: 30,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.am - b.am,
      sortOrder: sortedInfo.columnKey === "am" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clAvHint")}>
          {t("screeningList.clAv")}
        </Tooltip>
      ),
      className: `gtm-th-av ${oddClass(index++)}`,
      key: "av",
      width: 30,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.av - b.av,
      sortOrder: sortedInfo.columnKey === "av" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clCHint")}>
          {t("screeningList.clC")}
        </Tooltip>
      ),
      className: `gtm-th-c ${oddClass(index++)}`,
      key: "controlled",
      width: 20,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.controlled - b.controlled,
      sortOrder: sortedInfo.columnKey === "controlled" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clNpHint")}>
          {t("screeningList.clNp")}
        </Tooltip>
      ),
      className: `gtm-th-np ${oddClass(index++)}`,
      key: "np",
      width: 30,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.np - b.np,
      sortOrder: sortedInfo.columnKey === "np" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clTubeHint")}>
          {t("screeningList.clTube")}
        </Tooltip>
      ),
      className: `gtm-th-s ${oddClass(index++)}`,
      key: "tube",
      width: 20,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.tube - b.tube,
      sortOrder: sortedInfo.columnKey === "tube" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clDiffHint")}>
          {t("screeningList.clDiff")}
        </Tooltip>
      ),
      className: `gtm-th-d ${oddClass(index++)}`,
      key: "diff",
      width: 20,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.diff - b.diff,
      sortOrder: sortedInfo.columnKey === "diff" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clInterventionsHint")}>
          {t("screeningList.clInterventions")}
        </Tooltip>
      ),
      className: `gtm-th-ip ${oddClass(index++)}`,
      key: "interventions",
      width: 20,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.interventions - b.interventions,
      sortOrder: sortedInfo.columnKey === "interventions" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clPrescriptionScoreHint")}>
          {t("screeningList.clPrescriptionScore")}
        </Tooltip>
      ),
      className: `ant-table-right-border gtm-th-t ${oddClass(index++)}`,
      key: "prescriptionScore",
      width: 20,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.prescriptionScore - b.prescriptionScore,
      sortOrder:
        sortedInfo.columnKey === "prescriptionScore" && sortedInfo.order,
    },
    {
      title: (
        <Tooltip title={t("screeningList.clGlobalScoreHint")} underline>
          {t("screeningList.clGlobalScore")}
        </Tooltip>
      ),
      className: `ant-table-right-border gtm-th-ge ${oddClass(index++)}`,
      key: "globalScore",
      width: 20,
      align: "center",
      sortDirections,
      sorter: (a, b) => a.globalScore - b.globalScore,
      sortOrder: sortedInfo.columnKey === "globalScore" && sortedInfo.order,
    },
  ];

  return [
    {
      key: "class",
      width: 20,
      align: "center",
      className: "hidden-sorter",
      render: (record) => {
        if (record.processed) {
          return <Flag className={record.class || "green"} />;
        }

        return (
          <Tooltip title="Os indicadores estão sendo calculados. Aguarde ou atualize a página para visualizá-los.">
            <LoadingOutlined spin />
          </Tooltip>
        );
      },
      filteredValue: filteredInfo.searchKey || null,
      onFilter: (value, record) =>
        record.namePatient.toLowerCase().includes(value) ||
        `${record.admissionNumber}` === value,
      sortDirections,
      sorter: (a, b) => Date.parse(a.date) - Date.parse(b.date),
      sortOrder: sortedInfo.columnKey === "date" && sortedInfo.order,
    },
    {
      title: t("screeningList.patientRisk"),
      className: "ant-table-right-border",
      children: setDataIndex(patientRiskColumns),
    },
    {
      title: t("screeningList.prescriptionRisk"),
      children: setDataIndex(prescriptionRiskColumns),
    },
    {
      title: t("labels.status"),
      key: "status",
      width: 0,
      align: "center",
      render: (text, prescription) => {
        if (prescription.status === "s") {
          return (
            <Tag color="green" style={{ marginRight: 0 }}>
              Checada
            </Tag>
          );
        }

        if (prescription.status !== "s") {
          return (
            <>
              {prescription.isBeingEvaluated ? (
                <Tooltip title={"Pendente/Em Análise"}>
                  <Tag color="purple" style={{ marginRight: 0 }}>
                    Em análise
                  </Tag>
                </Tooltip>
              ) : (
                <Tag color="orange" style={{ marginRight: 0 }}>
                  Pendente
                </Tag>
              )}
            </>
          );
        }
      },
    },
    {
      title: t("screeningList.actions"),
      key: "operations",
      width: 10,
      align: "center",
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (text, prescription) => (
        <ScreeningActions t={t} {...prescription} />
      ),
    },
  ];
};

export default columns;
