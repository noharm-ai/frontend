import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import styled from "styled-components";

import { formatDateTime } from "utils/date";

// when and by whom (NoHarm for the NoHarm team) a version was saved
export interface ISavedBy {
  updatedAt: string | null;
  updatedBy: string | null;
}

const Box = styled.div`
  .setting-updated {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    margin-top: 16px;
    font-size: 13px;

    .ant-btn {
      padding: 0;
      height: auto;
    }
  }

  .setting-previous {
    margin-top: 12px;
    padding: 12px 16px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;

    h3.previous-title {
      font-size: 14px;
      margin-bottom: 4px;
    }
  }
`;

/**
 * When and by whom a setting was last changed, and the version it replaced,
 * read only, shown on request (`renderPrevious` draws its content). Nothing
 * while the setting was never saved
 */
export function SettingVersions({
  current,
  previous,
  renderPrevious,
}: {
  current: ISavedBy | null | undefined;
  previous: ISavedBy | null | undefined;
  renderPrevious: () => ReactNode;
}) {
  const { t } = useTranslation();
  const [showPrevious, setShowPrevious] = useState(false);

  if (!current?.updatedAt) return null;

  const savedText = (version: ISavedBy) =>
    version.updatedBy
      ? t("infectionControl.settings.updated", {
          date: formatDateTime(version.updatedAt),
          user: version.updatedBy,
        })
      : t("infectionControl.settings.updatedAt", {
          date: formatDateTime(version.updatedAt),
        });

  return (
    <Box>
      <div className="setting-updated muted" data-testid="setting-updated">
        <span>{savedText(current)}</span>
        {previous && (
          <Button
            type="link"
            size="small"
            onClick={() => setShowPrevious(!showPrevious)}
          >
            {t(
              showPrevious
                ? "infectionControl.settings.hidePrevious"
                : "infectionControl.settings.showPrevious",
            )}
          </Button>
        )}
      </div>

      {previous && showPrevious && (
        <div className="setting-previous" data-testid="setting-previous">
          <h3 className="previous-title">
            {t("infectionControl.settings.previousTitle")}
          </h3>
          {previous.updatedAt && (
            <div className="muted">{savedText(previous)}</div>
          )}
          {renderPrevious()}
        </div>
      )}
    </Box>
  );
}
