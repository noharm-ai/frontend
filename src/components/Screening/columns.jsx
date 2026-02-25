import React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { isEmpty } from "lodash";
import { format } from "date-fns";
import {
  WarningOutlined,
  RollbackOutlined,
  CaretDownOutlined,
  FormOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CheckSquareOutlined,
  BorderOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Button as AntButton, Space } from "antd";

import { InfoIcon } from "components/Icon";
import Button, { Link } from "components/Button";
import Tooltip from "components/Tooltip";
import Popover from "components/PopoverStyled";
import Descriptions from "components/Descriptions";
import Tag from "components/Tag";
import { createSlug } from "utils/transformers/utils";
import Dropdown from "components/Dropdown";
import RichTextView from "components/RichTextView";
import InterventionStatus from "models/InterventionStatus";
import { SelectMultiline } from "components/Inputs";
import { filterInterventionByPrescriptionDrug } from "utils/transformers/intervention";
import { setSelectedIntervention as setSelectedInterventionOutcome } from "features/intervention/InterventionOutcome/InterventionOutcomeSlice";
import { setCheckedIndexReport } from "features/prescription/PrescriptionSlice";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import { PrescriptionSchedule } from "./Table/PrescriptionSchedule";
import {
  TrackedPrescriptionAction,
  trackPrescriptionAction,
} from "src/utils/tracker";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import { formatNumber } from "src/utils/number";

import { PeriodTags } from "./index.style";
import SolutionCalculator from "./PrescriptionDrug/components/SolutionCalculator";
import PresmedTags from "./PrescriptionDrug/components/PresmedTags";
import DrugAlerts from "./PrescriptionDrug/components/DrugAlerts";
import AlertTags from "./PrescriptionDrug/components/AlertTags";

import { InterventionView } from "./Intervention/columns";
import DrugForm from "./Form";

import { TableTags, DrugLink } from "./index.style";

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
        }),
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
  featureService,
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

  if (
    (concilia && featureService.hasConciliationEdit()) ||
    (!concilia && featureService.hasPrimaryCare())
  ) {
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
            idHospital: data.idHospital,
            updateDrug: true,
          });
          break;

        default:
          console.error("undefined key: ", key);
      }
    },
  };
};

/* eslint-disable-next-line react-refresh/only-export-components */
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
                }),
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
  if (record.totalPeriod) {
    const period = record.totalPeriod;

    if (record.periodMax) {
      return `D${period}/${record.periodMax}`;
    }

    return `D${period}`;
  }

  return "-";
};

/* eslint-disable-next-line react-refresh/only-export-components */
const Action = ({ prescription, bag }) => {
  //TODO: refactor
  const {
    check,
    idPrescriptionDrug,
    onShowModal,
    uniqueDrugList,
    admissionNumber,
    emptyRow,
    t,
    security,
    featureService,
    selectedRows,
    selectedRowsActive,
    toggleSelectedRows,
    dispatch,
    ...data
  } = { ...prescription, ...bag };
  if (emptyRow) return null;

  if (selectedRowsActive) {
    const selected = selectedRows.indexOf(idPrescriptionDrug) !== -1;
    return (
      <Tooltip title={selected ? null : "Selecionar"}>
        <AntButton
          type={selected ? "primary" : "default"}
          onClick={() => {
            dispatch(toggleSelectedRows(idPrescriptionDrug));
          }}
          icon={
            selected ? (
              <CheckSquareOutlined style={{ fontSize: 16 }} />
            ) : (
              <BorderOutlined style={{ fontSize: 16 }} />
            )
          }
        ></AntButton>
      </Tooltip>
    );
  }

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
      filterInterventionByPrescriptionDrug(idPrescriptionDrug),
    );

    if (intvList.length) {
      isChecked = true;
    }
  }

  if (isIntervened && !isChecked) {
    btnTitle = t("prescriptionDrugList.addInterventionAgain");
  }

  const openIntervention = () => {
    onShowModal({
      ...data,
      idPrescriptionDrug,
      uniqueDrugList,
      admissionNumber,
    });
    trackPrescriptionAction(TrackedPrescriptionAction.CLICK_INTERVENTION);
  };

  const openNotes = () => {
    data.selectPrescriptionDrug({
      ...data,
      idPrescriptionDrug,
      admissionNumber,
      updateNotes: true,
    });
    trackPrescriptionAction(TrackedPrescriptionAction.CLICK_DRUG_NOTES);
  };

  return (
    <TableTags>
      <Tooltip title={btnTitle} placement="left">
        <AntButton
          type={isIntervened ? "danger " : "primary"}
          className="gtm-bt-interv"
          onClick={() => {
            openIntervention();
          }}
          ghost={!isChecked}
          danger={isChecked}
          loading={isChecking}
          disabled={isDisabled}
          icon={<WarningOutlined style={{ fontSize: 16 }} />}
        ></AntButton>
      </Tooltip>

      {(featureService.hasPrimaryCare() && !data.concilia) ||
      (featureService.hasConciliationEdit() && data.concilia) ? (
        <Dropdown
          menu={prescriptionDrugMenu({
            idPrescriptionDrug,
            admissionNumber,
            t,
            hasNotes,
            security,
            featureService,
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
            ghost={!hasNotes}
            icon={<CaretDownOutlined style={{ fontSize: 16 }} />}
          ></AntButton>
        </Dropdown>
      ) : (
        <Tooltip
          title={
            hasNotes
              ? t("prescriptionDrugList.updateNotes")
              : t("prescriptionDrugList.addNotes")
          }
          placement="left"
        >
          <AntButton
            type="primary"
            className="gtm-bt-notes"
            ghost={!hasNotes}
            style={{ background: hasNotes ? "#7ebe9a" : "inherit" }}
            onClick={() => {
              openNotes();
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
  width: 100%;

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

  .ant-descriptions {
    width: 100%;
  }

  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a;
    width: 15%;
    text-align: right;
  }
`;

const SimpleList = styled.ul`
  padding-left: 1rem;

  li {
    list-style: none;
    margin-bottom: 0.5rem;

    span {
      font-size: 12px;
    }
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

/* eslint-disable-next-line react-refresh/only-export-components */
const DrugTags = ({ drug, t }) => (
  <span style={{ marginLeft: "8px" }}>
    <Space size="small">
      {drug.np && (
        <Tooltip title={t("drugTags.npHint")}>
          <Tag variant="outlined">{t("drugTags.np")}</Tag>
        </Tooltip>
      )}
      {drug.am && (
        <Tooltip title={t("drugTags.amHint")}>
          <Tag variant="outlined" color="green">
            {t("drugTags.am")}
          </Tag>
        </Tooltip>
      )}
      {drug.av && (
        <Tooltip title={t("drugTags.avHint")}>
          <Tag variant="outlined" color="red">
            {t("drugTags.av")}
          </Tag>
        </Tooltip>
      )}
      {drug.c && (
        <Tooltip title={t("drugTags.cHint")}>
          <Tag variant="outlined" color="orange">
            {t("drugTags.c")}
          </Tag>
        </Tooltip>
      )}
      {drug.q && (
        <Tooltip title={t("drugTags.qHint")}>
          <Tag variant="outlined" color="cyan">
            {t("drugTags.q")}
          </Tag>
        </Tooltip>
      )}
      {drug.dialyzable && (
        <Tooltip title={t("drugTags.dialyzableHint")}>
          <Tag variant="outlined" color="blue">
            {t("drugTags.dialyzable")}
          </Tag>
        </Tooltip>
      )}
      {drug.drugAttributes?.fallRisk && (
        <Tooltip title={t("drugTags.fallRiskHint")}>
          <Tag variant="outlined" color="volcano">
            {t("drugTags.fallRisk")}
            {drug.drugAttributes?.fallRisk}
          </Tag>
        </Tooltip>
      )}
      {drug.drugAttributes?.liver > 150 &&
        drug.drugAttributes?.liver <= 156 && (
          <Tooltip title={t(`drugTags.liverHint${drug.drugAttributes?.liver}`)}>
            <Tag variant="outlined" color="gold">
              {t(`drugTags.liver${drug.drugAttributes?.liver}`)}
            </Tag>
          </Tooltip>
        )}
    </Space>
  </span>
);

export const expandedRowRender = (bag) => (record) => {
  if (record.total && record.infusion) {
    trackPrescriptionAction(
      TrackedPrescriptionAction.EXPAND_SOLUTION_CALCULATOR,
    );
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
      (i) => i.idIntervention === record.prevIntervention.idIntervention,
    );

    if (prevIntervention) {
      config = InterventionStatus.translate(prevIntervention.status, bag.t);
    }
  }

  let diluents = [];

  if (!isEmpty(record.whitelistedChildren)) {
    diluents = record.whitelistedChildren.filter((d) => {
      const parent = `${d.grp_solution}`;

      if (
        parent === `${record.grp_solution}` &&
        record.idPrescriptionDrug !== d.idPrescriptionDrug
      ) {
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
              idSubstance={record.idSubstance}
            />
          </Descriptions.Item>
        )}
        {bag.featureService.hasPresmedForm() &&
          bag.permissionService.has(Permission.READ_DISPENSATION) &&
          bag.formTemplate && (
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
            <Button
              onClick={() => {
                window.open(record.drugInfoLink);
                trackPrescriptionAction(TrackedPrescriptionAction.SHOW_LEAFLET);
              }}
              type="primary"
              ghost
            >
              {bag.t("actions.consult") + " "} Bulário Cognys
            </Button>
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
                  "dd/MM/yyyy HH:mm",
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={bag.t("prescriptionDrugList.panelValidUntil")}
                span={3}
              >
                {bag.headers[headerId].expire
                  ? format(
                      new Date(bag.headers[headerId].expire),
                      "dd/MM/yyyy HH:mm",
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
        {bag.isCpoe && !bag.aggregated && (
          <>
            <Descriptions.Item
              label={bag.t("prescriptionDrugList.panelIssueDate")}
              span={3}
            >
              {format(new Date(record.prescriptionDate), "dd/MM/yyyy HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item
              label={bag.t("prescriptionDrugList.panelValidUntil")}
              span={3}
            >
              {record.prescriptionExpire
                ? format(
                    new Date(record.prescriptionExpire),
                    "dd/MM/yyyy HH:mm",
                  )
                : "Manter até 2º ordem"}
            </Descriptions.Item>
          </>
        )}
        {(!isEmpty(record.period) || (record.cpoe && !record.whiteList)) && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrPeriod")}
            span={3}
          >
            {isEmpty(record.periodDates) && (
              <Link
                onClick={() => {
                  bag.fetchPeriod(record.idPrescriptionDrug, record.source);
                  trackPrescriptionAction(
                    TrackedPrescriptionAction.SHOW_PERIOD,
                  );
                }}
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
        {record.schedule && record.schedule.length > 0 && (
          <Descriptions.Item label={"Aprazamento"} span={3}>
            <PrescriptionSchedule schedule={record.schedule} />
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
        {record.doseWeightDay && (
          <Descriptions.Item label="Dose / Kg / Dia" span={3}>
            {record.doseWeightDay}
          </Descriptions.Item>
        )}
        {bag.permissionService.has(Permission.MAINTAINER) && record.auc && (
          <>
            {record.auc.auc_cg && (
              <Descriptions.Item label="AUC calculada (CG)" span={3}>
                {formatNumber(record.auc.auc_cg, 2)} mg/mL * min
              </Descriptions.Item>
            )}
            {record.auc.missing_cg && (
              <Descriptions.Item label="AUC calculada (CG)" span={3}>
                Faltam dados para calcular a AUC:{" "}
                {bag.t(`aucMissingData.${record.auc.missing_cg}`)}
              </Descriptions.Item>
            )}
            {record.auc.auc_ckd && (
              <Descriptions.Item label="AUC calculada (CKD21)" span={3}>
                {formatNumber(record.auc.auc_ckd, 2)} mg/mL * min
              </Descriptions.Item>
            )}
            {record.auc.missing_ckd && (
              <Descriptions.Item label="AUC calculada (CKD21)" span={3}>
                Faltam dados para calcular a AUC:{" "}
                {bag.t(`aucMissingData.${record.auc.missing_ckd}`)}
              </Descriptions.Item>
            )}
          </>
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
                    isSavingIntervention={bag.isSavingIntervention}
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
                  {d.measureUnit ? d.measureUnit.value : ""}) <br />
                  <span>
                    OBS.: {d.recommendation ? d.recommendation : "--"}
                  </span>
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
            {prescription.infusion.disableTotal ? (
              <>--</>
            ) : (
              <>{prescription.infusion.totalVol} mL</>
            )}
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
  width: bag.condensed ? "35%" : window.innerWidth < 768 ? "300px" : "35%",
  render: (record) => {
    if (record.total || record.emptyRow) {
      return "";
    }

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
      record.drug,
    )}/${record.doseconv}/${record.dayFrequency}`;

    const substanceWarning = (
      <div style={{ fontSize: `12px`, color: "#ff4d4f", lineHeight: 1.2 }}>
        *A substância deste medicamento não foi definida. <br />
        Clique para configurar.
      </div>
    );

    let content;
    if (PermissionService().has(Permission.MAINTAINER)) {
      let periodType = "";

      switch (record.periodType) {
        case 1:
          periodType = "Calculado";
          break;
        case 2:
          periodType = "Integrado";
          break;
        default:
          periodType = "Indefinido";
      }

      content = (
        <>
          <strong>Info para mantenedores:</strong>
          <br />
          <br />
          <strong>fkpresmed:</strong> {record.idPrescriptionDrug}
          <br />
          <strong>fkmedicamento:</strong> {record.idDrug}
          <br />
          <strong>grp_solution:</strong> {record.grp_solution}
          <br />
          <strong>origem:</strong> {record.originalSource}
          <br />
          <strong>doseconv:</strong> {record.doseconv}
          <br />
          <strong>frequenciadia:</strong> {record.dayFrequency}
          <br />
          <strong>intravenosa:</strong> {record.intravenous ? "sim" : "não"}
          <br />
          <strong>sonda:</strong> {record.tube ? "sim" : "não"}
          <br />
          <strong>tipo periodo:</strong> {periodType} (fixo:{" "}
          {record.periodFixed} / dias prescrito:{" "}
          {record.periodFixed > 0
            ? record.periodDayInterval
            : record.periodDayInterval + 1}
          )
          <br />
          <br />
          {record.drug} <DrugTags drug={record} t={bag.t} />
          {!record.idSubstance && substanceWarning}
          <div style={{ marginTop: "8px" }}>
            <AntButton
              icon={<HistoryOutlined />}
              size="small"
              onClick={() =>
                bag.dispatch(
                  setCheckedIndexReport({
                    idPrescriptionDrug: record.idPrescriptionDrug,
                    data: record,
                  }),
                )
              }
            >
              Histórico de checagem
            </AntButton>
          </div>
        </>
      );
    } else {
      content = (
        <>
          {record.drug} <DrugTags drug={record} t={bag.t} />
          {!record.idSubstance && substanceWarning}
          {/* <div style={{ marginTop: "8px" }}>
            <AntButton
              icon={<HistoryOutlined />}
              size="small"
              onClick={() =>
                bag.dispatch(
                  setCheckedIndexReport({
                    idPrescriptionDrug: record.idPrescriptionDrug,
                    data: record,
                  }),
                )
              }
            >
              Histórico de checagem
            </AntButton>
          </div> */}
        </>
      );
    }

    return (
      <>
        <Popover content={content} mouseEnterDelay={0.3}>
          <DrugLink
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`table-link ${
              record.idSubstance ? "" : "missing-substance"
            }`}
          >
            {bag.prescriptionDrugOrder === "CUSTOM" ? (
              <>
                {record.orderNumber !== null ? `${record.orderNumber} - ` : ""}
                {record.drug}
              </>
            ) : (
              <>{record.drug}</>
            )}
          </DrugLink>
        </Popover>
        <DrugTags drug={record} t={bag.t} />
      </>
    );
  },
});

const drugInfo = (bag) => [
  score(bag),
  drug(bag, false),
  period(bag),
  dose(bag),
];

const score = (bag) => ({
  key: "idPrescriptionDrug",
  dataIndex: "score",
  width: 85,
  align: "center",
  render: (entry, prescription) => {
    if (prescription.total || prescription.emptyRow) {
      return "";
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="score-container"
      >
        <DrugAlertLevelTag
          levels={
            prescription.alertsComplete
              ? prescription.alertsComplete.map((a) => a.level)
              : []
          }
          count={prescription.alertsComplete?.length}
          allergy={prescription.allergy}
          onClick={() => bag.handleRowExpand(prescription)}
        />
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
            style={{ cursor: "pointer" }}
            onClick={() => bag.handleRowExpand(prescription)}
          >
            {prescription.score}
          </span>
        </Tooltip>
        {prescription.suspensionDate ? (
          <Tooltip
            title={`Suspenso em: ${format(
              new Date(prescription.suspensionDate),
              "dd/MM/yyyy HH:mm",
            )}`}
          >
            <StopOutlined
              style={{
                fontSize: 18,
                color: "#f5222d",
              }}
            />
          </Tooltip>
        ) : (
          <>
            {prescription.checked && (
              <Tooltip title={bag.t("prescriptionDrugTags.checked")}>
                <CheckCircleOutlined
                  style={{
                    fontSize: 18,
                    color: "#52c41a",
                  }}
                />
              </Tooltip>
            )}
            {!prescription.checked && (
              <Tooltip title={bag.t("prescriptionDrugTags.checked")}>
                <div
                  style={{
                    width: "18px",
                  }}
                />
              </Tooltip>
            )}
          </>
        )}
      </div>
    );
  },
});

const period = (bag) => ({
  title: <Tooltip title={bag.t("tableHeader.period")}>Per.</Tooltip>,
  width: 60,
  align: "left",
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

    if (record.cpoe && !record.whiteList) {
      return (
        <Tooltip title='Confira o período completo no botão "Visualizar período de uso" presente na linha extendida'>
          {formatCPOEPeriod(record)}
        </Tooltip>
      );
    }

    let period = record.period;
    if (record.periodMax) {
      period = `${record.period}/${record.periodMax}`;
    }

    if (record.periodDates == null || record.periodDates.length === 0) {
      return period;
    }

    return (
      <Popover
        content={periodDatesList(record.periodDates)}
        title="Período de uso"
      >
        {period}
      </Popover>
    );
  },
});

const frequency = (bag) => ({
  title: bag.t("tableHeader.frequency"),
  dataIndex: "frequency",
  ellipsis: bag.condensed,
  align: bag.condensed ? "left" : "center",
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
            : ""}{" "}
          ({prescription.frequency ? prescription.frequency.label : "-"})
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
  width: 90,
  render: (text, prescription) => {
    if (prescription.emptyRow) return null;

    return <PresmedTags prescription={prescription} bag={bag} />;
  },
});

const actionColumns = (bag) => [
  {
    title: () => {
      if (bag.selectedRowsActive) {
        return (
          <AntButton
            type={"default"}
            onClick={() => {
              bag.selectAllRows();
            }}
            icon={
              bag.isAllSelected ? (
                <CheckSquareOutlined style={{ fontSize: 16 }} />
              ) : (
                <BorderOutlined style={{ fontSize: 16 }} />
              )
            }
          ></AntButton>
        );
      }

      return bag.t("tableHeader.action");
    },
    dataIndex: "intervention",
    width: 80,
    render: (text, prescription) => {
      return <Action prescription={prescription} bag={bag} />;
    },
  },
];

const filterOption = (input, option) => {
  let found = false;

  if (option.children && option.children.length) {
    option.children.forEach((o) => {
      if (o.props.children) {
        const data = Array.isArray(o.props.children)
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

const alertsColumn = (bag) => ({
  title: "Alertas",
  align: "left",
  ellipsis: true,
  render: (text, prescription) => {
    return (
      <AlertTags
        prescription={prescription}
        itemAlerts={prescription.alertsComplete}
        bag={bag}
      />
    );
  },
});

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
            },
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
          ),
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
  frequency(bag),
  relationColumn(bag),
  ...actionColumns(bag),
];

export const alertsPerspectiveColumns = (bag) => [
  score(bag),
  drug(bag),
  alertsColumn(bag),
  dose(bag),
  frequency(bag),
  route(bag),
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
