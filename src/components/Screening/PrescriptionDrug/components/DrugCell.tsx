import React from "react";
import { HistoryOutlined } from "@ant-design/icons";
import { Button as AntButton, Space } from "antd";

import Tooltip from "components/Tooltip";
import Popover from "components/PopoverStyled";
import Tag from "components/Tag";
import { createSlug } from "utils/transformers/utils";
import { setCheckedIndexReport } from "features/prescription/PrescriptionSlice";
import {
  TrackedPrescriptionAction,
  trackPrescriptionAction,
} from "src/utils/tracker";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";

import { DrugLink } from "../../index.style";
import { DrugCellPopover } from "./DrugCell.style";

interface DrugAttributes {
  fallRisk?: string;
  liver?: number;
}

export interface DrugRecord {
  drug: string;
  total?: boolean;
  emptyRow?: boolean;
  idPrescriptionDrug: string;
  idDrug: string;
  idSegment?: string | number;
  idSubstance?: string | number;
  substanceName?: string;
  grp_solution?: string;
  originalSource?: string;
  doseconv?: number | string;
  dayFrequency?: number | string;
  intravenous?: boolean;
  tube?: boolean;
  periodType?: number;
  periodFixed?: number;
  periodDayInterval?: number;
  orderNumber?: number | null;
  np?: boolean;
  am?: boolean;
  av?: boolean;
  c?: boolean;
  q?: boolean;
  dialyzable?: boolean;
  idMeasureUnitDefault?: string;
  drugAttributes?: DrugAttributes;
}

interface DrugCellBag {
  t: (key: string) => string;
  concilia?: boolean;
  handleRowExpand: (record: DrugRecord) => void;
  idSegment: string | number;
  prescriptionDrugOrder?: string;
  dispatch: (action: unknown) => void;
}

interface DrugTagsProps {
  drug: DrugRecord;
  t: (key: string) => string;
  noMargin?: boolean;
}

interface DrugCellProps {
  record: DrugRecord;
  bag: DrugCellBag;
}

export const DrugTags = ({ drug, t, noMargin }: DrugTagsProps) => (
  <span style={{ marginLeft: noMargin ? 0 : "8px" }}>
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
            {drug.drugAttributes.fallRisk}
          </Tag>
        </Tooltip>
      )}
      {drug.drugAttributes?.liver != null &&
        drug.drugAttributes.liver > 150 &&
        drug.drugAttributes.liver <= 156 && (
          <Tooltip title={t(`drugTags.liverHint${drug.drugAttributes.liver}`)}>
            <Tag variant="outlined" color="gold">
              {t(`drugTags.liver${drug.drugAttributes.liver}`)}
            </Tag>
          </Tooltip>
        )}
    </Space>
  </span>
);

const periodTypeLabel = (periodType?: number): string => {
  switch (periodType) {
    case 1:
      return "Calculado";
    case 2:
      return "Integrado";
    default:
      return "Indefinido";
  }
};

function DrugCell({ record, bag }: DrugCellProps): React.ReactElement | null {
  if (record.total || record.emptyRow) {
    return null;
  }

  if (bag.concilia) {
    return (
      <>
        {record.drug} <DrugTags drug={record} t={bag.t} />
      </>
    );
  }

  const href = `/medicamentos/${bag.idSegment}/${record.idDrug}/${createSlug(
    record.drug,
  )}/${record.doseconv}/${record.dayFrequency}`;

  const historyButton = (
    <AntButton
      icon={<HistoryOutlined />}
      size="small"
      onClick={() => {
        trackPrescriptionAction(TrackedPrescriptionAction.CLICK_CHECK_HISTORY);
        bag.dispatch(
          setCheckedIndexReport({
            idPrescriptionDrug: record.idPrescriptionDrug,
            data: record,
          }),
        );
      }}
    >
      Histórico de checagem
    </AntButton>
  );

  const substanceCell = record.idSubstance ? (
    <span className="info-value">{record.substanceName}</span>
  ) : (
    <div className="substance-warning">
      A substância deste medicamento não foi definida. Clique no medicamento
      para configurar.
    </div>
  );

  let content: React.ReactElement;
  if (PermissionService().has(Permission.MAINTAINER)) {
    const periodType = periodTypeLabel(record.periodType);
    const periodDays =
      (record.periodFixed ?? 0) > 0
        ? record.periodDayInterval
        : (record.periodDayInterval ?? 0) + 1;

    content = (
      <DrugCellPopover>
        <div className="popover-title">{record.drug}</div>
        <div className="info-grid">
          <span className="info-label">fkpresmed:</span>
          <span className="info-value">{record.idPrescriptionDrug}</span>

          <span className="info-label">fkmedicamento:</span>
          <span className="info-value">{record.idDrug}</span>

          <span className="info-label">Substância:</span>
          {substanceCell}

          <span className="info-label">idsegmento:</span>
          <span className="info-value">{record.idSegment ?? "Indefinido"}</span>

          <span className="info-label">grp_solution:</span>
          <span className="info-value">{record.grp_solution}</span>

          <span className="info-label">origem:</span>
          <span className="info-value">{record.originalSource}</span>

          <span className="info-label">doseconv:</span>
          <span className="info-value">
            {record.doseconv}{" "}
            {record.idMeasureUnitDefault || "Unidade indefinida"}
          </span>

          <span className="info-label">frequenciadia:</span>
          <span className="info-value">{record.dayFrequency}</span>

          <span className="info-label">intravenosa:</span>
          <span className="info-value">
            {record.intravenous ? "sim" : "não"}
          </span>

          <span className="info-label">sonda:</span>
          <span className="info-value">{record.tube ? "sim" : "não"}</span>

          <span className="info-label">tipo periodo:</span>
          <span className="info-value">
            {periodType} (fixo: {record.periodFixed} / dias prescrito:{" "}
            {periodDays})
          </span>

          <span className="info-label">Tags:</span>
          <span className="info-value">
            <DrugTags drug={record} t={bag.t} noMargin />
          </span>
        </div>

        <div className="divider" />
        {historyButton}
      </DrugCellPopover>
    );
  } else {
    content = (
      <DrugCellPopover>
        <div className="popover-title">{record.drug}</div>
        <div className="info-grid">
          <span className="info-label">Substância:</span>
          {substanceCell}

          <span className="info-label">Tags:</span>
          <span className="info-value">
            <DrugTags drug={record} t={bag.t} noMargin />
          </span>
        </div>

        <div className="divider" />
        {historyButton}
      </DrugCellPopover>
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
}

export default DrugCell;
