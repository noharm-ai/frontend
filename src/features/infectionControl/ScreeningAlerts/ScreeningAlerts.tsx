import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

import RichTextView from "components/RichTextView";

import { ALERT_LEVELS, IDrugAlert } from "../InfectionControlSlice";
import { AlertsCard } from "./ScreeningAlerts.style";
import { useAlertHandling } from "./useAlertHandling";

interface ScreeningAlertsProps {
  alerts: IDrugAlert[];
  // the substance of the drug, for the handling of the alerts
  idSubstance?: string | null;
  "data-kb"?: string;
  "data-testid"?: string;
}

/**
 * The screening alerts of a course: collapsed to a count per level, opened to
 * the alerts grouped by level, each with its handling when the substance has
 * one
 */
export function ScreeningAlerts({
  alerts,
  idSubstance,
  ...rest
}: ScreeningAlertsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { loadingType, showHandling } = useAlertHandling(idSubstance);

  if (!alerts.length) {
    return null;
  }

  const groups = ALERT_LEVELS.map((level) => ({
    level,
    alerts: alerts.filter((alert) => alert.level === level),
  })).filter((group) => group.alerts.length);

  return (
    <AlertsCard {...rest}>
      <button
        type="button"
        className="alerts-header"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="alerts-title">
          {t("infectionControl.alerts.title")}
        </span>
        <span className="alerts-summary" data-testid="alerts-summary">
          {groups.map((group) => (
            <span
              key={group.level}
              className={`alerts-pill ${group.level}`}
              data-testid={`alerts-pill-${group.level}`}
            >
              <span className="alerts-dot" />
              <strong>{group.alerts.length}</strong>
              {t(`infectionControl.alerts.level.${group.level}`)}
            </span>
          ))}
        </span>
        <span className="alerts-toggle">
          {open
            ? t("infectionControl.alerts.hide")
            : t("infectionControl.alerts.show")}
          {open ? <UpOutlined /> : <DownOutlined />}
        </span>
      </button>

      {open &&
        groups.map((group) => (
          <div
            key={group.level}
            className={`alerts-group ${group.level}`}
            data-testid={`alerts-group-${group.level}`}
          >
            <div className="alerts-group-title">
              <span className="alerts-dot" />
              {t(`infectionControl.alerts.level.${group.level}`)} ·{" "}
              {group.alerts.length}
            </div>
            {group.alerts.map((alert, index) => (
              <div key={`${alert.type}-${index}`} className="alerts-item">
                <div className="alerts-text">
                  <RichTextView text={alert.text} maxWidth="100%" />
                </div>
                {alert.handling && (
                  <button
                    type="button"
                    className="alerts-handling"
                    disabled={loadingType !== null}
                    onClick={() => showHandling(alert.type)}
                  >
                    {t("infectionControl.alerts.handling")}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
    </AlertsCard>
  );
}
