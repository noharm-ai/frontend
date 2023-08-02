import React from "react";
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

import { InfoIcon } from "components/Icon";
import Button, { Link } from "components/Button";
import Tooltip from "components/Tooltip";
import Popover from "components/PopoverStyled";
import Descriptions from "components/Descriptions";
import Tag from "components/Tag";
import { createSlug } from "utils/transformers/utils";
import Dropdown from "components/Dropdown";
import Alert from "components/Alert";
import RichTextView from "components/RichTextView";
import InterventionStatus from "models/InterventionStatus";
import { Select } from "components/Inputs";

import { PeriodTags } from "./index.style";
import SolutionCalculator from "./PrescriptionDrug/components/SolutionCalculator";
import PresmedTags from "./PrescriptionDrug/components/PresmedTags";

import { InterventionView } from "./Intervention/columns";
import DrugForm from "./Form";

import { TableTags, TableLink } from "./index.style";

const interventionOptions = (
  id,
  idPrescription,
  saveInterventionStatus,
  source
) => {
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
      saveInterventionStatus(id, idPrescription, key, source);
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

const InterventionAction = ({
  source,
  checkIntervention: check,
  prevIntervention,
  saveInterventionStatus,
}) => {
  const { id } = prevIntervention;
  const isDisabled = check.currentId !== id && check.isChecking;
  const isChecking = check.currentId === id && check.isChecking;
  const isChecked = prevIntervention.status !== "s";

  return (
    <>
      {isChecked && (
        <Tooltip title="Desfazer situação" placement="left">
          <Button
            type="danger gtm-bt-undo-interv-status"
            ghost
            onClick={() =>
              saveInterventionStatus(
                id,
                prevIntervention.idPrescription,
                "s",
                source
              )
            }
            loading={isChecking}
            disabled={isDisabled}
            icon={<RollbackOutlined style={{ fontSize: 16 }} />}
          ></Button>
        </Tooltip>
      )}
      {!isChecked && (
        <Dropdown
          menu={interventionOptions(
            id,
            prevIntervention.idPrescription,
            saveInterventionStatus,
            source
          )}
          loading={isChecking}
          disabled={isDisabled}
        >
          <Button
            type="primary"
            loading={isChecking}
            disabled={isDisabled}
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
      parseInt(record.period.replace("D", ""), 10) + (record.periodFixed || 0)
    }D`;
  }

  if (record.periodFixed) {
    return `${record.periodFixed}D`;
  }

  return "-";
};

const Action = ({
  check,
  savePrescriptionDrugStatus,
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

  const closedStatuses = InterventionStatus.getClosedStatuses();
  const isClosed = closedStatuses.indexOf(data.status) !== -1;
  const isDisabled =
    (check.idPrescriptionDrug !== idPrescriptionDrug && check.isChecking) ||
    isClosed;
  const isChecking =
    check.idPrescriptionDrug === idPrescriptionDrug && check.isChecking;
  const isChecked = data.intervention && data.intervention.status === "s";
  const isIntervened = data.intervened;
  const hasNotes =
    (data.notes !== "" && data.notes != null) ||
    (data.prevNotes && data.prevNotes !== "None");

  let btnTitle = isChecked
    ? t("prescriptionDrugList.updateIntervention")
    : t("prescriptionDrugList.addIntervention");

  if (isIntervened && !isChecked) {
    btnTitle = t("prescriptionDrugList.addInterventionAgain");
  }

  if (isClosed) {
    btnTitle = t("prescriptionDrugList.addInterventionDisabled");
  }

  return (
    <TableTags>
      <Tooltip title={btnTitle} placement="left">
        <Button
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
          loading={isChecking}
          disabled={isDisabled}
          icon={<WarningOutlined style={{ fontSize: 16 }} />}
        ></Button>
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
          <Button
            type="primary"
            loading={isChecking}
            disabled={isDisabled}
            className="gtm-bt-extra-actions"
            ghost
            icon={<CaretDownOutlined style={{ fontSize: 16 }} />}
          ></Button>
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
          <Button
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
          ></Button>
        </Tooltip>
      )}
    </TableTags>
  );
};

const NestedTableContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 35px;

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

const showAlerts = (alerts) => {
  if (alerts == null || alerts.length === 0) {
    return "--";
  }

  return (
    <>
      {alerts.map((item, index) => (
        <Alert
          key={index}
          type="error"
          message={<RichTextView text={item} />}
          style={{ marginTop: "5px" }}
          showIcon
        />
      ))}
    </>
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
  </span>
);

export const expandedRowRender = (bag) => (record) => {
  if (record.total && record.infusion) {
    return (
      <NestedTableContainer>
        <SolutionCalculator {...record.infusion} weight={bag.weight} />
      </NestedTableContainer>
    );
  }

  let config = {};
  if (record.prevIntervention) {
    config = InterventionStatus.translate(
      record.prevIntervention.status,
      bag.t
    );
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

  return (
    <NestedTableContainer>
      <Descriptions bordered size="small">
        {!isEmpty(record.alerts) && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrAlert")}
            span={3}
          >
            {showAlerts(record.alerts)}
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
        {record.cpoe && (
          <>
            <Descriptions.Item
              label={bag.t("prescriptionDrugList.panelPrescription")}
              span={3}
            >
              {record.cpoe}
            </Descriptions.Item>
            <Descriptions.Item
              label={bag.t("prescriptionDrugList.panelPrescriber")}
              span={3}
            >
              {bag.headers[record.cpoe].prescriber}
            </Descriptions.Item>
            <Descriptions.Item
              label={bag.t("prescriptionDrugList.panelIssueDate")}
              span={3}
            >
              {format(
                new Date(bag.headers[record.cpoe].date),
                "dd/MM/yyyy HH:mm"
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={bag.t("prescriptionDrugList.panelValidUntil")}
              span={3}
            >
              {bag.headers[record.cpoe].expire
                ? format(
                    new Date(bag.headers[record.cpoe].expire),
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
        {(!isEmpty(record.period) ||
          (bag.featureService.hasTempCpoePeriod() && !record.whiteList)) && (
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
                type="nda gtm-bt-period"
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
            <RichTextView text={record.prevNotes} />
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

        {!isEmpty(record.prevIntervention) && (
          <Descriptions.Item
            label={bag.t("prescriptionDrugList.exrPrevIntervention")}
            span={3}
          >
            <InterventionView
              intervention={record.prevIntervention}
              showReasons
              showDate
              status={
                <Descriptions.Item
                  label={`${bag.t("labels.status")}:`}
                  span={3}
                >
                  <Tag color={config.color}>{config.label}</Tag>{" "}
                  <InterventionAction {...record} {...bag} />
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
  render: (text, prescription) => {
    if (prescription.total && prescription.infusion) {
      return (
        <Tooltip
          title={bag.t("prescriptionDrugList.openSolutionCalculator")}
          placement="top"
        >
          <span
            onClick={() => bag.handleRowExpand(prescription)}
            style={{ cursor: "pointer", fontWeight: 600 }}
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
      <Tooltip title={prescription.measureUnit.label} placement="top">
        {prescription.dosage}
      </Tooltip>
    );
  },
});

const drug = (bag, addkey, title) => ({
  key: addkey ? "idPrescriptionDrug" : null,
  title: title ? title : bag.t("tableHeader.drug"),
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
    return (
      <>
        <Tooltip title={bag.t("prescriptionDrugList.viewDrug")} placement="top">
          <TableLink href={href} target="_blank" rel="noopener noreferrer">
            {record.drug}
          </TableLink>
        </Tooltip>
        <DrugTags drug={record} t={bag.t} />
      </>
    );
  },
});

const drugInfo = (bag) => [
  {
    key: "idPrescriptionDrug",
    dataIndex: "score",
    width: 20,
    align: "center",
    render: (entry, { score, near, total, emptyRow }) => {
      if (total || emptyRow) {
        return "";
      }

      return (
        <Tooltip
          title={
            near
              ? `${bag.t("tableHeader.approximateScore")}: ${score}`
              : `${bag.t("tableHeader.score")}: ${score}`
          }
        >
          <span className={`flag has-score ${flags[parseInt(score, 10)]}`}>
            {score}
          </span>
        </Tooltip>
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
              style={{ cursor: "pointer", fontWeight: 600 }}
            >
              Total:
            </span>
          </Tooltip>
        );
      }

      if (
        bag.featureService.hasTempCpoePeriod() &&
        record.periodFixed &&
        !record.whiteList
      ) {
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
  width: 150,
  render: (text, prescription) => {
    if (prescription.dividerRow) {
      return null;
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
    width: 100,
  },
];

const stageAndInfusion = (bag) => [
  {
    title: bag.t("tableHeader.stage"),
    dataIndex: "stage",
    width: 100,
  },
  {
    title: bag.t("tableHeader.infusion"),
    dataIndex: "infusion",
    width: 100,
  },
];

const route = (bag) => ({
  title: bag.t("tableHeader.route"),
  dataIndex: "route",
  width: 85,
});

const tags = (bag) => ({
  title: "Tags",
  width: 50,
  align: "center",
  render: (text, prescription) => {
    return <PresmedTags prescription={prescription} bag={bag} />;
  },
});

const actionColumns = (bag) => [
  {
    title: bag.t("tableHeader.action"),
    dataIndex: "intervention",
    width: 110,
    render: (text, prescription) => {
      return <Action {...prescription} {...bag} />;
    },
  },
];

const relationColumn = (bag) => ({
  title: "Prescrição vigente",
  width: 450,
  render: (text, prescription) => {
    return (
      <Select
        allowClear
        showSearch
        optionFilterProp="children"
        style={{ width: "100%", maxWidth: "450px" }}
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
          ({ idPrescriptionDrug, drug, dose, measureUnit, frequency }) => (
            <Select.Option
              key={idPrescriptionDrug}
              value={idPrescriptionDrug}
              style={{ overflow: "auto", whiteSpace: "inherit" }}
            >
              {drug}
              <br />{" "}
              <span className="extra-info" style={{ fontSize: "12px" }}>
                ({dose} {measureUnit.label} X {frequency.label})
              </span>
            </Select.Option>
          )
        )}
      </Select>
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
