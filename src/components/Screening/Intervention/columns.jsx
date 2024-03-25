import React from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components/macro";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  WarningOutlined,
  RollbackOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

import Button, { Link } from "components/Button";
import Descriptions from "components/Descriptions";
import Tag from "components/Tag";
import Dropdown from "components/Dropdown";
import Tooltip from "components/Tooltip";
import RichTextView from "components/RichTextView";
import isEmpty from "lodash.isempty";
import InterventionStatus from "models/InterventionStatus";
import { setSelectedIntervention as setSelectedInterventionOutcome } from "features/intervention/InterventionOutcome/InterventionOutcomeSlice";

const NestedTableContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 35px;

  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a;
  }
`;

const TableLink = styled.a`
  color: rgba(0, 0, 0, 0.65);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const interventionMenu = (idIntervention, saveIntervention, onShowModal) => {
  const items = [
    {
      key: "a",
      label: "Aceita",
      id: onShowModal
        ? "gtm-btn-menu-interv-accept"
        : "gtm-btn-tab-interv-accept",
    },
    {
      key: "n",
      label: "Não aceita",
      id: onShowModal
        ? "gtm-btn-menu-interv-not-accept"
        : "gtm-btn-tab-interv-not-accept",
    },
    {
      key: "j",
      label: "Não aceita com Justificativa",
      id: onShowModal
        ? "gtm-btn-menu-interv-not-accept-j"
        : "gtm-btn-tab-interv-not-accept-j",
    },
    {
      key: "x",
      label: "Não se aplica",
      id: onShowModal
        ? "gtm-btn-menu-interv-not-apply"
        : "gtm-btn-tab-interv-not-apply",
    },
  ];

  return {
    items,
    onClick: ({ key }) => {
      saveIntervention({
        idIntervention,
        status: key,
      });
    },
  };
};

export const PrescriptionInline = ({
  dose,
  measureUnit,
  frequency,
  route,
  time,
}) => (
  <>
    {frequency.label} x {dose} {measureUnit.label} via {route} ({time})
  </>
);

export const InterventionView = ({
  intervention,
  showReasons,
  showDate,
  status,
}) => {
  const { t } = useTranslation();

  return (
    <Descriptions bordered>
      {status}
      <Descriptions.Item label={`${t("tableHeader.prescription")}:`} span={3}>
        <PrescriptionInline {...intervention} />
      </Descriptions.Item>
      {intervention.fetchFuturePrescription && (
        <Descriptions.Item label={`${t("labels.nextPrescription")}:`} span={3}>
          {isEmpty(intervention.future) && (
            <Link
              onClick={() =>
                intervention.fetchFuturePrescription(intervention.id)
              }
              loading={intervention.futurePrescription.isFetching}
              className="nda gtm-bt-iterv-future"
            >
              {t("labels.showNextPrescription")}
            </Link>
          )}
          {!isEmpty(intervention.future) && intervention.future}
        </Descriptions.Item>
      )}

      {showDate && (
        <Descriptions.Item label={t("tableHeader.date")} span={3}>
          {format(new Date(intervention.date), "dd/MM/yyyy HH:mm")}
        </Descriptions.Item>
      )}
      <Descriptions.Item
        label={`${t("labels.potentialPrescriptionError")}:`}
        span={3}
      >
        {intervention.error ? t("labels.yes") : t("labels.no")}
      </Descriptions.Item>
      <Descriptions.Item label={`${t("labels.reducesCost")}:`} span={3}>
        {intervention.cost ? t("labels.yes") : t("labels.no")}
      </Descriptions.Item>
      {showReasons && (
        <Descriptions.Item label={`${t("labels.reasons")}:`} span={3}>
          {intervention.reasonDescription}
        </Descriptions.Item>
      )}

      <Descriptions.Item
        label={
          <Tooltip title={t("tooltips.relationsList")}>
            {t("labels.relations")}:
          </Tooltip>
        }
        span={3}
      >
        {!isEmpty(intervention.interactionsList) &&
          intervention.interactionsList.map((item) => item.name).join(", ")}
      </Descriptions.Item>
      <Descriptions.Item label={`${t("labels.responsible")}:`} span={3}>
        {intervention.user}
      </Descriptions.Item>
      <Descriptions.Item
        label={`${t("interventionForm.labelEconomyDays")}:`}
        span={3}
      >
        {intervention.economyDays ? intervention.economyDays : "--"}
      </Descriptions.Item>
      <Descriptions.Item
        label={`${t("interventionForm.labelExpendedDose")}:`}
        span={3}
      >
        {intervention.expendedDose ? intervention.expendedDose : "--"}
      </Descriptions.Item>
      <Descriptions.Item label={`${t("labels.observation")}:`} span={3}>
        <RichTextView text={intervention.observation} />
      </Descriptions.Item>
      {intervention.transcription && (
        <Descriptions.Item label={`${t("labels.transcription")}:`} span={3}>
          <TranscriptionView transcription={intervention.transcription} />
        </Descriptions.Item>
      )}
    </Descriptions>
  );
};

const TranscriptionView = ({ transcription }) => {
  const { t } = useTranslation();
  const config = {
    idDrug: {
      render: (record) => record.idDrugLabel,
    },
    dose: {
      render: (record) => record.dose,
    },
    measureUnit: {
      render: (record) => record.measureUnitLabel,
    },
    frequency: {
      render: (record) => record.frequencyLabel,
    },
    interval: {
      render: (record) => record.intervalLabel,
    },
    route: {
      render: (record) => record.route,
    },
  };

  const items = Object.keys(config).map((key) => {
    if (transcription[key]) {
      return (
        <Descriptions.Item
          key={key}
          label={t(`transcriptionLabels.${key}`)}
          span={3}
        >
          {config[key].render(transcription)}
        </Descriptions.Item>
      );
    }

    return null;
  });

  return <Descriptions bordered>{items}</Descriptions>;
};

export const expandedInterventionRowRender = (record) => {
  return (
    <NestedTableContainer>
      <InterventionView intervention={record} />
    </NestedTableContainer>
  );
};

const Action = ({
  isSaving,
  id,
  idPrescription,
  saveIntervention,
  onShowModal,
  admissionNumber,
  ...data
}) => {
  const dispatch = useDispatch();
  const isChecked = data.status !== "s";
  const closedStatuses = InterventionStatus.getClosedStatuses();
  const isClosed = closedStatuses.indexOf(data.status) !== -1;

  return (
    <>
      <Button
        onClick={() =>
          dispatch(
            setSelectedInterventionOutcome({
              idIntervention: data.idIntervention,
              outcome: "s",
              open: true,
            })
          )
        }
      >
        O
      </Button>
      {isChecked && (
        <Tooltip title="Desfazer situação" placement="left">
          <Button
            className={
              onShowModal
                ? " gtm-bt-menu-undo-interv-status"
                : " gtm-bt-tab-undo-interv-status"
            }
            danger
            ghost
            onClick={() =>
              saveIntervention({
                idIntervention: data.idIntervention,
                status: "s",
              })
            }
            loading={isSaving}
            icon={<RollbackOutlined style={{ fontSize: 16 }} />}
          ></Button>
        </Tooltip>
      )}
      {!isChecked && (
        <Dropdown
          menu={interventionMenu(
            data.idIntervention,
            saveIntervention,
            onShowModal
          )}
          loading={isSaving}
        >
          <Button
            type="primary"
            loading={isSaving}
            className={
              onShowModal
                ? "gtm-bt-menu-interv-status"
                : "gtm-bt-tab-interv-status"
            }
            icon={<CaretDownOutlined style={{ fontSize: 16 }} />}
          ></Button>
        </Dropdown>
      )}
      {onShowModal && (
        <Tooltip
          title={
            isClosed
              ? "Esta intervenção não pode mais ser alterada, pois já foi resolvida."
              : "Alterar intervenção"
          }
          placement="left"
        >
          <Button
            type="primary gtm-bt-menu-interv"
            style={{ marginLeft: "5px" }}
            disabled={isClosed}
            onClick={() => {
              onShowModal({
                ...data,
                idPrescriptionDrug: id,
                idPrescription,
                uniqueDrugList: [],
                admissionNumber,
              });
            }}
            icon={<WarningOutlined style={{ fontSize: 16 }} />}
          ></Button>
        </Tooltip>
      )}
    </>
  );
};

const columns = (filteredInfo, name = false, t) => {
  const columnsArray = [
    {
      title: t("tableHeader.date"),
      dataIndex: "date",
      align: "center",
      width: 80,
      render: (text, record) => {
        return format(new Date(record.date), "dd/MM/yyyy HH:mm");
      },
    },
  ];

  if (name) {
    columnsArray.push({
      title: t("labels.responsible"),
      dataIndex: "user",
      width: 80,
      filteredValue: filteredInfo.responsible || [],
      onFilter: (value, record) => {
        if (value.length === 0) {
          return true;
        }

        return value.indexOf(record.user) !== -1;
      },
    });
  }

  return [
    ...columnsArray,
    {
      title: t("tableHeader.prescription"),
      dataIndex: "idPrescription",
      align: "center",
      width: 80,
      render: (text, record) => {
        return (
          <TableLink
            href={`/prescricao/${record.idPrescription}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            # {record.idPrescription}
          </TableLink>
        );
      },
    },
    {
      title: t("tableHeader.drug"),
      dataIndex: "drugName",
      align: "left",
      width: 200,
    },
    {
      title: t("labels.reasons"),
      dataIndex: "reasonDescription",
      align: "left",
      width: 100,
    },
    {
      title: t("labels.status"),
      dataIndex: "status",
      align: "center",
      width: 80,
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (text, record) => {
        const config = InterventionStatus.translate(record.status, t);

        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: t("tableHeader.action"),
      align: "center",
      width: 100,
      render: (text, record) => {
        return <Action {...record} />;
      },
    },
  ];
};

export default columns;
