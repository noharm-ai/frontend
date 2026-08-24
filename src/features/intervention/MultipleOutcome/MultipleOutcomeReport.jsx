import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Result, Alert, Collapse } from "antd";

import Tag from "components/Tag";

export function MultipleOutcomeReport() {
  const { t } = useTranslation();
  const results = useSelector(
    (state) => state.multipleInterventionOutcome.results,
  );

  const applied = results.filter((r) => r.status === "applied");
  const skipped = results.filter((r) => r.status === "skipped");
  const errors = results.filter((r) => r.status === "error");

  const skipReasonLabel = {
    closed: t("multipleIntervention.reasonClosed"),
    archived: t("multipleIntervention.reasonArchived"),
    user: t("multipleIntervention.reasonUser"),
    canceled: t("multipleIntervention.reasonCanceled"),
  };

  const itemLabel = (result) =>
    result.drugName
      ? result.drugName
      : `${t("multipleIntervention.intervention")} #${result.idIntervention}`;

  const collapseItems = [];

  if (applied.length > 0) {
    collapseItems.push({
      key: "applied",
      label: `${t("multipleIntervention.applied")} (${applied.length})`,
      children: (
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          {applied.map((r) => (
            <li key={r.idIntervention}>{itemLabel(r)}</li>
          ))}
        </ul>
      ),
    });
  }

  if (skipped.length > 0) {
    collapseItems.push({
      key: "skipped",
      label: `${t("multipleIntervention.skipped")} (${skipped.length})`,
      children: (
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          {skipped.map((r) => (
            <li key={r.idIntervention}>
              {itemLabel(r)}{" "}
              <Tag>{skipReasonLabel[r.reason] || r.reason}</Tag>
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <>
      <Result
        status={errors.length > 0 ? "warning" : "success"}
        title={
          errors.length > 0
            ? t("multipleIntervention.finishedWithErrors")
            : t("multipleIntervention.finished")
        }
        subTitle={t("multipleIntervention.finishedSummary", {
          applied: applied.length,
          skipped: skipped.length,
          errors: errors.length,
        })}
        style={{ padding: "16px 0" }}
      />

      {collapseItems.length > 0 && <Collapse items={collapseItems} />}

      {errors.map((r) => (
        <Alert
          key={r.idIntervention}
          message={`${itemLabel(r)}: ${r.reason}`}
          type="error"
          style={{ marginTop: "10px" }}
        />
      ))}
    </>
  );
}
