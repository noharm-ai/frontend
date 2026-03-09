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

export const DrugTags = ({ drug, t }) => (
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

  const substanceWarning = (
    <div style={{ fontSize: `12px`, color: "#ff4d4f", lineHeight: 1.2 }}>
      *A substância deste medicamento não foi definida. <br />
      Clique para configurar.
    </div>
  );

  const historyButton = (
    <div style={{ marginTop: "8px" }}>
      <AntButton
        icon={<HistoryOutlined />}
        size="small"
        onClick={() => {
          trackPrescriptionAction(
            TrackedPrescriptionAction.CLICK_CHECK_HISTORY,
          );
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
        <strong>idsegmento:</strong>{" "}
        {record.idSegment ? record.idSegment : "Indefinido"}
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
        {historyButton}
      </>
    );
  } else {
    content = (
      <>
        {record.drug} <DrugTags drug={record} t={bag.t} />
        {!record.idSubstance && substanceWarning}
        {historyButton}
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
}

export default DrugCell;
