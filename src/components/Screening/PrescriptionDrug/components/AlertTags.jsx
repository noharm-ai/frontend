import React from "react";
import { useTranslation } from "react-i18next";
import { Popover, Alert } from "antd";

import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import RichTextView from "components/RichTextView";

import { AlertTagsContainer } from "../PrescriptionDrug.style";

function AlertTags({ prescription, itemAlerts, bag }) {
  const { t } = useTranslation();
  let alerts = [];

  const sortByType = (a, b) => `${a?.type}`.localeCompare(`${b?.type}`);

  ["high", "medium", "low"].forEach((level) => {
    if (itemAlerts) {
      alerts = [
        ...alerts,
        ...itemAlerts.filter((a) => a.level === level).sort(sortByType),
      ];
    }
  });

  return (
    <AlertTagsContainer>
      {alerts.map((a, index) => (
        <Popover
          key={index}
          content={
            <div style={{ maxWidth: "500px" }}>
              <Alert
                type="error"
                message={<RichTextView text={a.text} />}
                showIcon
              />
            </div>
          }
          title={t(`drugAlertType.${a.type}`)}
          mouseEnterDelay={0.2}
        >
          <span>
            <DrugAlertLevelTag
              label={t(`drugAlertTypeAcronym.${a.type}`)}
              levels={[a.level]}
              showTooltip={false}
              onClick={() => bag?.handleRowExpand(prescription)}
            />
          </span>
        </Popover>
      ))}
    </AlertTagsContainer>
  );
}

export default AlertTags;
