import React from "react";
import { CalculatorOutlined, HistoryOutlined } from "@ant-design/icons";
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

export const DrugTags = ({ drug, t, noMargin }) => (
  <span
    style={{
      marginLeft: noMargin ? 0 : "8px",
    }}
  >
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

const periodTypeLabel = (periodType) => {
  switch (periodType) {
    case 1:
      return "Calculado";
    case 2:
      return "Integrado";
    default:
      return "Indefinido";
  }
};

function DrugCell({ record, bag }) {
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

  let content;
  if (PermissionService().has(Permission.MAINTAINER)) {
    const periodType = periodTypeLabel(record.periodType);
    const periodDays =
      record.periodFixed > 0
        ? record.periodDayInterval
        : record.periodDayInterval + 1;

    content = (
      <DrugCellPopover>
        <div className="popover-title">{record.drug}</div>
        <div className="info-grid">
          <span className="info-label">fkpresmed:</span>
          <span className="info-value">{record.idPrescriptionDrug}</span>

          <span className="info-label">fkmedicamento:</span>
          <span className="info-value">{record.idDrug}</span>

          <span className="info-label">Substância:</span>
          <span className="info-value">
            {record.idSubstance ? (
              record.substanceName
            ) : (
              <div className="substance-warning">
                A substância deste medicamento não foi definida. Clique no
                medicamento para configurar.
              </div>
            )}
          </span>

          <span className="info-label">idsegmento:</span>
          <span className="info-value">{record.idSegment ?? "Indefinido"}</span>

          <span className="info-label">grp_solution:</span>
          <span className="info-value">{record.grp_solution}</span>

          <span className="info-label">origem:</span>
          <span className="info-value">{record.originalSource}</span>

          <span className="info-label">doseconv:</span>
          <span className="info-value">{record.doseconv}</span>

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
            <DrugTags drug={record} t={bag.t} noMargin small />
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
          <span className="info-value">
            {record.idSubstance ? (
              record.substanceName
            ) : (
              <div className="substance-warning">
                A substância deste medicamento não foi definida. Clique no
                medicamento para configurar.
              </div>
            )}
          </span>

          <span className="info-label">Tags:</span>
          <span className="info-value">
            <DrugTags drug={record} t={bag.t} noMargin small />
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
