import React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components/macro";
import isEmpty from "lodash.isempty";
import { format } from "date-fns";
import {
  WarningOutlined,
  RollbackOutlined,
  CaretDownOutlined,
  FormOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import { Button as AntButton } from "antd";

import { InfoIcon } from "components/Icon";
import Button, { Link } from "components/Button";
import Tooltip from "components/Tooltip";
import Popover from "components/PopoverStyled";
import Descriptions from "components/Descriptions";
import Tag from "components/Tag";
import Badge from "components/Badge";
import { createSlug } from "utils/transformers/utils";
import Dropdown from "components/Dropdown";
import RichTextView from "components/RichTextView";
import InterventionStatus from "models/InterventionStatus";
import { SelectMultiline } from "components/Inputs";
import { filterInterventionByPrescriptionDrug } from "utils/transformers/intervention";
import { setSelectedIntervention as setSelectedInterventionOutcome } from "features/intervention/InterventionOutcome/InterventionOutcomeSlice";

import { PeriodTags } from "./index.style";
import SolutionCalculator from "./PrescriptionDrug/components/SolutionCalculator";
import PresmedTags from "./PrescriptionDrug/components/PresmedTags";
import DrugAlerts from "./PrescriptionDrug/components/DrugAlerts";

import { InterventionView } from "./Intervention/columns";
import DrugForm from "./Form";

import { TableTags, TableLink } from "./index.style";

const interventionOptions = (idIntervention, dispatch) => {
  const items = [
    {
      key: "a",
      label: "Aceita",
      id: "gtm-btn-interv-accept",
    },
    {
      key: "n",
      label: "Não aceita",
      id: "gtm-btn-interv-not-accept",
    },
    {
      key: "j",
      label: "Não aceita com Justificativa",
      id: "gtm-btn-interv-not-accept-j",
    },
    {
      key: "x",
      label: "Não se aplica",
      id: "gtm-btn-interv-not-apply",
    },
  ];

  return {
    items,
    onClick: ({ key }) => {
      dispatch(
        setSelectedInterventionOutcome({
          idIntervention: idIntervention,
          outcome: key,
          open: true,
        })
      );
    },
  };
};

const prescriptionDrugMenu = ({
  idPrescriptionDrug,
  admissionNumber,
  selectPrescriptionDrug,
  hasNotes,
  t,
  concilia,
  ...data
}) => {
  const items = [
    {
      key: "notes",
      label: hasNotes
        ? t("prescriptionDrugList.updateNotes")
        : t("prescriptionDrugList.addNotes"),
      id: "gtm-btn-notes",
    },
  ];

  if (!concilia) {
    items.push({
      key: "edit",
      label: t("actions.edit"),
      id: "gtm-btn-edit-drug",
    });
  }

  return {
    items,
    onClick: ({ key }) => {
      switch (key) {
        case "notes":
          selectPrescriptionDrug({
            ...data,
            idPrescriptionDrug,
            admissionNumber,
            updateNotes: true,
          });
          break;

        case "edit":
          selectPrescriptionDrug({
            ...data,
            idPrescriptionDrug,
            admissionNumber,
            updateDrug: true,
          });
          break;

        default:
          console.error("undefined key: ", key);
      }
    },
  };
};

const InterventionAction = ({ intv, isSavingIntervention }) => {
  const dispatch = useDispatch();
  const { idIntervention } = intv;
  const isChecked = intv.status !== "s";

  return (
    <>
      {isChecked && (
        <Tooltip title="Desfazer situação" placement="left">
          <Button
            className="gtm-bt-undo-interv-status"
            danger
            ghost
            onClick={() =>
              dispatch(
                setSelectedInterventionOutcome({
                  idIntervention: idIntervention,
                  outcome: "s",
                  open: true,
                })
              )
            }
            loading={isSavingIntervention}
            icon={<RollbackOutlined style={{ fontSize: 16 }} />}
          ></Button>
        </Tooltip>
      )}
      {!isChecked && (
        <Dropdown
          menu={interventionOptions(idIntervention, dispatch)}
          loading={isSavingIntervention}
        >
          <Button
            type="primary"
            loading={isSavingIntervention}
            className="gtm-bt-interv-status"
            icon={<CaretDownOutlined style={{ fontSize: 16 }} />}
          ></Button>
        </Dropdown>
      )}
    </>
  );
};

const formatCPOEPeriod = (record) => {
  if (record.period) {
    return `${
      parseInt(`${record.period}`.replace("D", ""), 10) +
      (record.periodFixed || 0)
    }D`;
  }

  if (record.periodFixed) {
    return `${record.periodFixed}D`;
  }

  return "-";
};

const Action = ({
  check,
  idPrescriptionDrug,
  prescriptionType,
  onShowModal,
  uniqueDrugList,
  admissionNumber,
  emptyRow,
  t,
  security,
  ...data
}) => {
  if (emptyRow) return null;

  const isDisabled =
    check.idPrescriptionDrug !== idPrescriptionDrug && check.isChecking;
  const isChecking =
    check.idPrescriptionDrug === idPrescriptionDrug && check.isChecking;
  let isChecked = false;
  const isIntervened = data.intervened;
  const hasNotes =
    (data.notes !== "" && data.notes != null) ||
    (data.prevNotes && data.prevNotes !== "None");

  let btnTitle = isChecked
    ? t("prescriptionDrugList.updateIntervention")
    : t("prescriptionDrugList.addIntervention");

  if (data.interventions) {
    const intvList = data.interventions.filter(
      filterInterventionByPrescriptionDrug(idPrescriptionDrug)
    );

    if (intvList.length) {
      isChecked = true;
    }
  }

  if (isIntervened && !isChecked) {
    btnTitle = t("prescriptionDrugList.addInterventionAgain");
  }

  return (
    <TableTags>
      <Tooltip title={btnTitle} placement="left">
        <AntButton
          type={isIntervened ? "danger gtm-bt-interv" : "primary gtm-bt-interv"}
          onClick={() => {
            onShowModal({
              ...data,
              idPrescriptionDrug,
              uniqueDrugList,
              admissionNumber,
            });
          }}
          ghost={!isChecked}
          danger={isChecked}
          loading={isChecking}
          disabled={isDisabled}
          icon={<WarningOutlined style={{ fontSize: 16 }} />}
        ></AntButton>
      </Tooltip>

      {security.hasPrescriptionEdit() && (
        <Dropdown
          menu={prescriptionDrugMenu({
            idPrescriptionDrug,
            admissionNumber,
            t,
            hasNotes,
            ...data,
          })}
          trigger={["click"]}
          loading={isChecking}
          disabled={isDisabled}
        >
          <AntButton
            type="primary"
            loading={isChecking}
            disabled={isDisabled}
            className="gtm-bt-extra-actions"
            ghost
            icon={<CaretDownOutlined style={{ fontSize: 16 }} />}
          ></AntButton>
        </Dropdown>
      )}

      {!security.hasPrescriptionEdit() && (
        <Tooltip
          title={
            hasNotes
              ? t("prescriptionDrugList.updateNotes")
              : t("prescriptionDrugList.addNotes")
          }
          placement="left"
        >
          <AntButton
            type="primary gtm-bt-notes"
            ghost={!hasNotes}
            onClick={() => {
              data.selectPrescriptionDrug({
                ...data,
                idPrescriptionDrug,
                admissionNumber,
                updateNotes: true,
              });
            }}
            icon={<FormOutlined style={{ fontSize: 16 }} />}
          ></AntButton>
        </Tooltip>
      )}
    </TableTags>
  );
};

const NestedTableContainer = styled.div`
  position: relative;

  &:before {
    content: "";
    position: absolute;
    width: 3px;
    height: 100%;
    left: 0;
    top: 0;
  }

  &.group {
    &:before {
      background: rgba(16, 142, 233, 0.5);
    }
  }

  &.solution {
    background: rgb(169 145 214 / 12%);

    &:before {
      background: rgb(169 145 214);
    }
  }

  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a;
    width: 20%;
  }
`;

const SimpleList = styled.ul`
  padding-left: 1rem;

  li {
    list-style: none;
  }
`;

const periodDates = (dates) => {
  if (dates == null || dates.length === 0) {
    return "";
  }

  return (
    <PeriodTags>
      {dates.map((item, index) => (
        <span key={index}>{item}, </span>
      ))}
    </PeriodTags>
  );
};

const periodDatesList = (dates) => {
  if (dates == null || dates.length === 0) {
    return "";
  }

  return (
    <div>
      <SimpleList>
        <li key="0">{dates[0]}</li>
        <li key="1">...</li>
        <li key="2">{dates[dates.length - 1]}</li>
      </SimpleList>
    </div>
  );
};

const DrugTags = ({ drug, t }) => (
  <span style={{ marginLeft: "10px" }}>
    {drug.np && (
      <Tooltip title={t("drugTags.npHint")}>
        <Tag>{t("drugTags.np")}</Tag>
      </Tooltip>
    )}
    {drug.am && (
      <Tooltip title={t("drugTags.amHint")}>
        <Tag color="green">{t("drugTags.am")}</Tag>
      </Tooltip>
    )}
    {drug.av && (
      <Tooltip title={t("drugTags.avHint")}>
        <Tag color="red">{t("drugTags.av")}</Tag>
      </Tooltip>
    )}
    {drug.c && (
      <Tooltip title={t("drugTags.cHint")}>
        <Tag color="orange">{t("drugTags.c")}</Tag>
      </Tooltip>
    )}
    {drug.q && (
      <Tooltip title={t("drugTags.qHint")}>
        <Tag color="cyan">{t("drugTags.q")}</Tag>
      </Tooltip>
    )}
    {drug.dialyzable && (
      <Tooltip title={t("drugTags.dialyzableHint")}>
        <Tag color="blue">{t("drugTags.dialyzable")}</Tag>
      </Tooltip>
    )}
  </span>
);

export const expandedRowRender = (bag) => (record) => {
  if (record.total && record.infusion) {
    return (
      <NestedTableContainer className={record.source}>
        <SolutionCalculator {...record.infusion} weight={bag.weight} />
      </NestedTableContainer>
    );
  }

  let config = {};
  let prevIntervention = null;
  if (record.prevIntervention) {
    prevIntervention = bag.interventions.find(
      (i) => i.idIntervention === record.prevIntervention.idIntervention
    );

    if (prevIntervention) {
      config = InterventionStatus.translate(prevIntervention.status, bag.t);
    }
  }

  let diluents = [];

  if (!isEmpty(record.whitelistedChildren)) {
    diluents = record.whitelistedChildren.filter((d) => {
      const parent = `${d.grp_solution}000`;

      if (parent === `${record.idPrescriptionDrug}`) {
        return true;
      }

      return false;
    });
  }

  const headerId = record.cpoe || record.idPrescription;

  return (
    <NestedTableContainer
      className={`${record.source} ${record.groupRow ? "group" : ""}`}
    >
      <Descriptions bordered size="small">
        {!isEmpty(record.alertsComplete) && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrAlert")}
            span={3}
          >
            <DrugAlerts
              alerts={record.alertsComplete}
              disableGroups={bag.featureService.hasDisableAlertGroups()}
            />
          </Descriptions.Item>
        )}
        {bag.security.hasPresmedForm() && bag.formTemplate && (
          <Descriptions.Item label={bag.formTemplate.name} span={3}>
            <div>
              <DrugForm
                savePrescriptionDrugForm={bag.savePrescriptionDrugForm}
                idPrescriptionDrug={record.idPrescriptionDrug}
                template={bag.formTemplate}
                values={record.formValues}
              />
            </div>
          </Descriptions.Item>
        )}
        {record.drugInfoLink && bag.featureService.hasMicromedex() && (
          <Descriptions.Item
            label={bag.t("tableHeader.clinicalInfo") + ":"}
            span={3}
          >
            <Link
              to={record.drugInfoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="gtm-lnk-micromedex"
              type="primary"
              ghost
            >
              {bag.t("actions.consult") + " "} Bulário Cognys
            </Link>
          </Descriptions.Item>
        )}
        {(record.cpoe || bag.condensed) &&
          bag.headers &&
          bag.headers[headerId] && (
            <>
              <Descriptions.Item
                label={bag.t("prescriptionDrugList.panelPrescription")}
                span={3}
              >
                <Button
                  type="link"
                  href={`/prescricao/${headerId}`}
                  target="_blank"
                >
                  {headerId}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item
                label={bag.t("prescriptionDrugList.panelPrescriber")}
                span={3}
              >
                {bag.headers[headerId].prescriber}
              </Descriptions.Item>
              <Descriptions.Item
                label={bag.t("prescriptionDrugList.panelIssueDate")}
                span={3}
              >
                {format(
                  new Date(bag.headers[headerId].date),
                  "dd/MM/yyyy HH:mm"
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={bag.t("prescriptionDrugList.panelValidUntil")}
                span={3}
              >
                {bag.headers[headerId].expire
                  ? format(
                      new Date(bag.headers[headerId].expire),
                      "dd/MM/yyyy HH:mm"
                    )
                  : "Manter até 2º ordem"}
              </Descriptions.Item>
              {record.suspensionDate && (
                <Descriptions.Item
                  label={bag.t("prescriptionDrugList.panelSuspensionDate")}
                  span={3}
                >
                  {format(new Date(record.suspensionDate), "dd/MM/yyyy HH:mm")}
                </Descriptions.Item>
              )}
            </>
          )}
        {(!isEmpty(record.period) || (record.cpoe && !record.whiteList)) && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrPeriod")}
            span={3}
          >
            {isEmpty(record.periodDates) && (
              <Link
                onClick={() =>
                  bag.fetchPeriod(record.idPrescriptionDrug, record.source)
                }
                loading={bag.periodObject.isFetching}
                type="default"
                className="nda gtm-bt-period"
              >
                {bag.t("prescriptionDrugList.exrPeriodBtn")}
              </Link>
            )}
            {!isEmpty(record.periodDates) && periodDates(record.periodDates)}
          </Descriptions.Item>
        )}
        {record.prescriptionType === "solutions" && (
          <>
            <Descriptions.Item
              label={bag.t("prescriptionDrugList.exrTime")}
              span={3}
            >
              {record.time}
            </Descriptions.Item>
            {!isEmpty(record.frequency) && (
              <Descriptions.Item
                label={bag.t("tableHeader.frequency")}
                span={3}
              >
                {record.frequency.label}
              </Descriptions.Item>
            )}
            <Descriptions.Item label={bag.t("tableHeader.stage")} span={3}>
              {record.stage}
            </Descriptions.Item>
            <Descriptions.Item label={bag.t("tableHeader.infusion")} span={3}>
              {record.infusion}
            </Descriptions.Item>
          </>
        )}
        {record.doseWeight && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrDoseKg")}
            span={3}
          >
            {record.doseWeight}
          </Descriptions.Item>
        )}
        {record.doseBodySurface && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrDoseBodySurface")}
            span={3}
          >
            {record.doseBodySurface}
          </Descriptions.Item>
        )}
        {record.recommendation && (
          <Descriptions.Item label={bag.t("tableHeader.observation")} span={3}>
            <RichTextView text={record.recommendation} />
          </Descriptions.Item>
        )}
        {record.prevNotes && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrNotesPrevious")}
            span={3}
          >
            <RichTextView text={record.prevNotesUser} />
          </Descriptions.Item>
        )}
        {record.notes && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrNotes")}
            span={3}
          >
            <RichTextView text={record.notes} />
          </Descriptions.Item>
        )}

        {!isEmpty(prevIntervention) && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrPrevIntervention")}
            span={3}
          >
            <InterventionView
              intervention={prevIntervention}
              showReasons
              showDate
              status={
                <Descriptions.Item
                  label={`${bag.t("labels.status")}:`}
                  span={3}
                >
                  <Tag color={config.color}>{config.label}</Tag>{" "}
                  <InterventionAction
                    {...record}
                    {...bag}
                    intv={prevIntervention}
                  />
                </Descriptions.Item>
              }
            />
          </Descriptions.Item>
        )}
        {!isEmpty(diluents) && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrDiluent")}
            span={3}
          >
            <SimpleList>
              {diluents.map((d, i) => (
                <li key={i}>
                  {d.drug} ({d.dose ? d.dose.toLocaleString("pt-BR") : ""}{" "}
                  {d.measureUnit ? d.measureUnit.value : ""})
                </li>
              ))}
            </SimpleList>
          </Descriptions.Item>
        )}
      </Descriptions>
    </NestedTableContainer>
  );
};

const flags = ["green", "yellow", "orange", "red", "red"];

const dose = (bag) => ({
  title: "Dose",
  dataIndex: "dosage",
  width: 130,
  ellipsis: bag.condensed,
  align: bag.condensed ? "left" : "center",
  render: (text, prescription) => {
    if (prescription.total && prescription.infusion) {
      return (
        <Tooltip
          title={bag.t("prescriptionDrugList.openSolutionCalculator")}
          placement="top"
        >
          <span
            onClick={() => bag.handleRowExpand(prescription)}
            style={{ cursor: "pointer" }}
          >
            {prescription.infusion.totalVol} mL
          </span>
        </Tooltip>
      );
    }

    if (!prescription.measureUnit) {
      return prescription.dose;
    }

    return (
      <Tooltip title={prescription.dosage} placement="top">
        {prescription.dosage}
      </Tooltip>
    );
  },
});

const drug = (bag, addkey, title) => ({
  key: addkey ? "idPrescriptionDrug" : null,
  title: title ? title : bag.t("tableHeader.drug"),
  ellipsis: bag.condensed,
  align: "left",
  render: (record) => {
    if (bag.concilia) {
      return (
        <>
          {record.drug} <DrugTags drug={record} t={bag.t} />
        </>
      );
    }
    if (record.total) {
      return (
        <Tooltip
          title={bag.t("prescriptionDrugList.openSolutionCalculator")}
          placement="top"
        >
          <span
            className="gtm-tag-calc"
            onClick={() => bag.handleRowExpand(record)}
            style={{ cursor: "pointer" }}
          >
            <CalculatorOutlined style={{ fontSize: 16, marginRight: "10px" }} />
            {bag.t("prescriptionDrugList.solutionCalculator")}
          </span>
        </Tooltip>
      );
    }

    const href = `/medicamentos/${bag.idSegment}/${record.idDrug}/${createSlug(
      record.drug
    )}/${record.doseconv}/${record.dayFrequency}`;
    const content = (
      <>
        {record.drug} <DrugTags drug={record} t={bag.t} />
      </>
    );

    return (
      <>
        <Popover
          content={content}
          title="Ver medicamento"
          mouseEnterDelay={0.3}
        >
          <TableLink
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="table-link"
          >
            {record.drug}
          </TableLink>
        </Popover>
        <DrugTags drug={record} t={bag.t} />
      </>
    );
  },
});

const drugInfo = (bag) => [
  {
    key: "idPrescriptionDrug",
    dataIndex: "score",
    width: 55,
    align: "center",
    render: (entry, prescription) => {
      if (prescription.total || prescription.emptyRow) {
        return "";
      }

      const getAlertStyle = () => {
        const alerts = prescription.alertsComplete;
        const defaultColor = {
          background: "#7ebe9a",
          borderColor: "#7ebe9a",
          color: "#fff",
        };

        if (!alerts.length) {
          return defaultColor;
        }

        const levels = alerts.map((a) => a.level);

        if (levels.indexOf("high") !== -1) {
          return {
            background: "#f44336",
            borderColor: "#f44336",
            color: "#fff",
          };
        }

        if (levels.indexOf("medium") !== -1) {
          return {
            background: "#f57f17",
            borderColor: "#f57f17",
            color: "#fff",
          };
        }

        if (levels.indexOf("low") !== -1) {
          return {
            background: "#ffc107",
            borderColor: "#ffc107",
            color: "#fff",
          };
        }
      };

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Tooltip
            title={
              prescription.alergy
                ? bag.t("prescriptionDrugTags.alertsAllergy")
                : bag.t("prescriptionDrugTags.alerts")
            }
          >
            <Badge dot count={prescription.alergy ? 1 : 0}>
              <Tag
                style={{
                  ...getAlertStyle(),
                  cursor: "pointer",
                  marginRight: 0,
                }}
                onClick={() => bag.handleRowExpand(prescription)}
              >
                {prescription.alertsComplete.length}
              </Tag>
            </Badge>
          </Tooltip>
          <Tooltip
            title={
              prescription.near
                ? `${bag.t("tableHeader.approximateScore")}: ${
                    prescription.score
                  }`
                : `${bag.t("tableHeader.score")}: ${prescription.score}`
            }
          >
            <span
              className={`flag has-score ${
                flags[parseInt(prescription.score, 10)]
              }`}
            >
              {prescription.score}
            </span>
          </Tooltip>
        </div>
      );
    },
  },
  drug(bag, false),
  {
    title: bag.t("tableHeader.period"),
    width: 70,
    render: (record) => {
      if (record.total) {
        return (
          <Tooltip
            title={bag.t("prescriptionDrugList.openSolutionCalculator")}
            placement="top"
          >
            <span
              onClick={() => bag.handleRowExpand(record)}
              style={{ cursor: "pointer" }}
            >
              Total:
            </span>
          </Tooltip>
        );
      }

      if (record.whiteList) {
        return "";
      }

      if (record.cpoe && record.periodFixed && !record.whiteList) {
        return (
          <Tooltip title='Confira o período completo no botão "Visualizar período de uso" presente na linha extendida'>
            {formatCPOEPeriod(record)}
          </Tooltip>
        );
      }

      if (record.periodDates == null || record.periodDates.length === 0) {
        return record.period;
      }

      return (
        <Popover
          content={periodDatesList(record.periodDates)}
          title="Período de uso"
        >
          {record.period}
        </Popover>
      );
    },
  },
  dose(bag),
];

const frequency = (bag) => ({
  title: bag.t("tableHeader.frequency"),
  dataIndex: "frequency",
  ellipsis: bag.condensed,
  align: bag.condensed ? "left" : "center",
  width: 150,
  render: (text, prescription) => {
    if (prescription.dividerRow) {
      return null;
    }

    if (prescription.emptyRow) return null;

    if (
      prescription.source === "solution" &&
      !bag.featureService.hasSolutionFrequency()
    ) {
      const content = (
        <>
          <strong>Etapas:</strong> {prescription.stage || "-"}
          <br />
          <strong>Infusão:</strong> {prescription.infusion || "-"}
          <br />
          <strong>Frequência:</strong>{" "}
          {prescription.frequency ? prescription.frequency.label : "-"}
        </>
      );
      return (
        <Popover content={content} title="Etapas/Infusão" mouseEnterDelay={0.3}>
          {prescription.stage}{" "}
          {`${prescription.infusion}`.trim()
            ? `| ${prescription.infusion}`
            : ""}
        </Popover>
      );
    }

    if (isEmpty(prescription.frequency)) {
      return (
        <Tooltip title="Frequência obtida por conversão" placement="top">
          {" "}
          <InfoIcon />
        </Tooltip>
      );
    }

    return (
      <Tooltip title={prescription.frequency.label} placement="top">
        {prescription.frequency.label}
      </Tooltip>
    );
  },
});

const frequencyAndTime = (bag) => [
  frequency(bag),
  {
    title: bag.t("tableHeader.time"),
    dataIndex: "time",
    ellipsis: bag.condensed,
    align: bag.condensed ? "left" : "center",
    width: 100,
    render: (text, prescription) => {
      return <Tooltip title={prescription.time}>{prescription.time}</Tooltip>;
    },
  },
];

const stageAndInfusion = (bag) => {
  if (bag.featureService.hasSolutionFrequency()) {
    return [frequency(bag)];
  }

  return [
    {
      title: bag.t("tableHeader.stage"),
      dataIndex: "stage",
      ellipsis: bag.condensed,
      width: 100,
      render: (text, prescription) => {
        return (
          <Tooltip title={prescription.stage}>{prescription.stage}</Tooltip>
        );
      },
    },
    {
      title: bag.t("tableHeader.infusion"),
      dataIndex: "infusion",
      align: bag.condensed ? "left" : "center",
      width: 100,
    },
  ];
};

const route = (bag) => ({
  title: bag.t("tableHeader.route"),
  dataIndex: "route",
  ellipsis: bag.condensed,
  align: bag.condensed ? "left" : "center",
  width: 85,
  render: (text, prescription) => {
    return <Tooltip title={prescription.route}>{prescription.route}</Tooltip>;
  },
});

const tags = (bag) => ({
  title: "Tags",
  align: "center",
  width: 110,
  render: (text, prescription) => {
    if (prescription.emptyRow) return null;

    return <PresmedTags prescription={prescription} bag={bag} />;
  },
});

const actionColumns = (bag) => [
  {
    title: bag.t("tableHeader.action"),
    dataIndex: "intervention",
    width: 80,
    render: (text, prescription) => {
      return <Action {...prescription} {...bag} />;
    },
  },
];

const filterOption = (input, option) => {
  let found = false;

  if (option.children && option.children.length) {
    option.children.forEach((o) => {
      if (o.props.children) {
        let data = Array.isArray(o.props.children)
          ? o.props.children.join(" ").toLowerCase()
          : o.props.children.toLowerCase();

        if (data.includes(input.toLowerCase())) {
          found = true;
        }
      }
    });
  }

  return found;
};

const relationColumn = (bag) => ({
  title: "Prescrição vigente",
  width: "45%",
  render: (text, prescription) => {
    return (
      <SelectMultiline
        allowClear
        showSearch
        optionFilterProp="children"
        filterOption={filterOption}
        style={{ width: "100%" }}
        placeholder="Relação com a prescrição vigente"
        defaultValue={prescription.conciliaRelationId}
        onChange={(value) =>
          bag.updatePrescriptionDrugData(
            prescription.idPrescriptionDrug,
            prescription.source,
            {
              ...prescription,
              conciliaRelationId: value,
            }
          )
        }
      >
        {bag.currentPrescription.map(
          ({
            idPrescriptionDrug,
            drug,
            dose,
            measureUnit,
            frequency,
            recommendation,
          }) => (
            <SelectMultiline.Option
              key={idPrescriptionDrug}
              value={idPrescriptionDrug}
              style={{ overflow: "auto", whiteSpace: "inherit" }}
            >
              <strong>{drug}</strong>
              <br />
              <span className="extra-info" style={{ fontSize: "12px" }}>
                ({dose} {measureUnit.label} X {frequency.label})
              </span>
              <br />
              <span className="extra-info" style={{ fontSize: "12px" }}>
                Obs.: {recommendation || "-"}
              </span>
            </SelectMultiline.Option>
          )
        )}
      </SelectMultiline>
    );
  },
});

export const isPendingValidation = (record) =>
  (!record.whiteList && !record.checked) ||
  !isEmpty(record.prevIntervention) ||
  !isEmpty(record.prevNotes);

export const solutionColumns = (bag) => [
  ...drugInfo(bag),
  ...stageAndInfusion(bag),
  route(bag),
  tags(bag),
  ...actionColumns(bag),
];

export const dietColumns = (bag) => [
  drug(bag, true, bag.t("tableHeader.diet")),
  dose(bag),
  ...frequencyAndTime(bag),
  route(bag),
  tags(bag),
  ...actionColumns(bag),
];

export const conciliationColumns = (bag) => [
  drug(bag, true),
  dose(bag),
  frequency,
  relationColumn(bag),
  ...actionColumns(bag),
];

const columns = (filteredInfo, bag) => {
  const columns = [
    ...drugInfo(bag),
    ...frequencyAndTime(bag),
    route(bag),
    tags(bag),
    ...actionColumns(bag),
  ];

  columns[0] = {
    ...columns[0],
    ...{
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => {
        switch (value) {
          case "pending-validation":
            return isPendingValidation(record);
          default:
            return true;
        }
      },
    },
  };

  return columns;
};

export default columns;
