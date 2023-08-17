import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SaveOutlined, DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Dropdown from "components/Dropdown";
import Button from "components/Button";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import Badge from "components/Badge";

import { fetchDraft, saveDraft } from "./MemoryDraftSlice";

function MemoryDraft({ type, currentValue, setValue }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector(
    (state) => state.memoryDraft[type]?.status || "loading"
  );
  const draft = useSelector((state) => state.memoryDraft[type]?.data);

  useEffect(() => {
    dispatch(fetchDraft(type));
  }, [type, dispatch]);

  const items = [
    {
      key: "set",
      label: t("labels.loadDraft"),
      icon: <DownloadOutlined />,
      disabled: !(draft && draft.length),
    },
    {
      key: "save",
      label: t("labels.saveDraft"),
      icon: <SaveOutlined />,
      disabled: !currentValue,
    },
  ];

  const onMenuClick = ({ key }) => {
    switch (key) {
      case "set":
        if (draft) {
          setValue(draft[0]?.value);
          notification.success({
            message: t("messages.draftApplied"),
          });
        }
        break;

      case "save":
        dispatch(
          saveDraft({
            type,
            value: currentValue,
          })
        ).then((response) => {
          if (response.error) {
            notification.error({
              message: getErrorMessage(response, t),
            });
          } else {
            notification.success({
              message: t("success.generic"),
            });
          }
        });
        break;

      default:
        console.error("Not implemented", key);
    }
  };

  return (
    <Dropdown
      menu={{ items, onClick: onMenuClick }}
      loading={status === "loading"}
      disabled={!(draft && draft.length) && !currentValue}
    >
      <Badge count={draft && draft.length ? 1 : 0} size="small">
        <Button
          loading={status === "loading"}
          disabled={!(draft && draft.length) && !currentValue}
        >
          {t("labels.draft")}
        </Button>
      </Badge>
    </Dropdown>
  );
}

export default MemoryDraft;
