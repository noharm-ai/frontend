import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  SettingOutlined,
  FileSearchOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import DOMPurify from "dompurify";

import Dropdown from "components/Dropdown";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { Textarea } from "components/Inputs";
import { textToHtml } from "utils/transformers/utils";

import { setBlock, promptSummaryBlock } from "../SummarySlice";
import SummaryPanelAIConfig from "./SummaryPanelAIConfig";
import SummaryPanelAIAudit from "./SummaryPanelAIAudit";
import SummaryReactions from "../SummaryReactions/SummaryReactions";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelAI({ payload, position, admissionNumber }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector(
    (state) => state.summary.blocks[position]?.aiStatus
  );
  const result = useSelector((state) => state.summary.blocks[position]?.text);
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [modalAudit, setModalAudit] = useState(false);
  const [aiPrompt, setAIPrompt] = useState(payload?.prompt);
  const reload = useCallback(
    (forcePayload) => {
      if (!forcePayload && !payload?.audit?.length) {
        const msg = "Nada consta";
        dispatch(
          setBlock({
            id: position,
            data: msg,
          })
        );
        return;
      }

      setLoading(true);
      setError(false);

      if (forcePayload) {
        setAIPrompt(forcePayload);
      }

      dispatch(promptSummaryBlock(forcePayload || aiPrompt)).then(
        (response) => {
          setLoading(false);

          if (response.error) {
            setError(true);
            console.error(response.error);
          } else {
            dispatch(
              setBlock({
                id: position,
                data: response.payload.data?.answer,
                original: response.payload.data?.answer,
              })
            );
          }
        }
      );
    },
    [dispatch, aiPrompt, payload?.audit, position]
  );

  useEffect(() => {
    if (status === "started") {
      reload();
    }
  }, [status, reload]);

  useEffect(() => {
    setError(false);
    setLoading(false);
  }, [result]);

  useEffect(() => {
    if (edit) {
      setEditText(result);
    }
  }, [edit, result]);

  const onChange = (value) => {
    setEditText(value);
    dispatch(
      setBlock({
        id: position,
        data: value,
      })
    );
  };

  const items = [
    {
      key: "prompt",
      label: t("actions.configPrompt"),
      icon: <RobotOutlined />,
    },
    {
      key: "audit",
      label: t("labels.audit"),
      icon: <FileSearchOutlined />,
    },
  ];

  const onMenuClick = ({ key }) => {
    switch (key) {
      case "prompt":
        setModalConfig(true);
        break;

      case "audit":
        setModalAudit(true);
        break;
      default:
        console.error("not implemented", key);
    }
  };

  if (error) {
    return (
      <SummaryPanel className="error">
        <div className="error-container">
          <Button
            shape="circle"
            danger
            icon={<ReloadOutlined />}
            onClick={() => reload()}
            size="large"
          />
        </div>
      </SummaryPanel>
    );
  }

  return (
    <SummaryPanel
      className={loading ? "loading" : edit ? "edit" : ""}
      data-value={editText}
    >
      {loading ? (
        <div className="loader">
          <Spin />
        </div>
      ) : (
        <>
          {edit ? (
            <>
              <Textarea
                autoFocus
                value={editText}
                onChange={({ target }) => onChange(target.value)}
              />
            </>
          ) : (
            <div
              className="answer"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(textToHtml(result)),
              }}
            ></div>
          )}
        </>
      )}

      {!loading && (
        <div className="actions">
          <Tooltip title={t("actions.refresh")}>
            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={() => reload()}
              size="large"
              disabled={edit || loading || !payload?.audit?.length}
            />
          </Tooltip>

          {edit ? (
            <Tooltip title={t("actions.save")}>
              <Button
                shape="circle"
                icon={<SaveOutlined />}
                onClick={() => setEdit(false)}
                size="large"
                type="primary"
              />
            </Tooltip>
          ) : (
            <Tooltip title={t("actions.edit")}>
              <Button
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => setEdit(true)}
                size="large"
              />
            </Tooltip>
          )}

          <SummaryReactions
            position={position}
            admissionNumber={admissionNumber}
          />

          <Dropdown
            menu={{ items, onClick: onMenuClick }}
            loading={edit || loading}
            disabled={edit || loading}
          >
            <Button shape="circle" icon={<SettingOutlined />} size="large" />
          </Dropdown>
          <SummaryPanelAIConfig
            open={modalConfig}
            setOpen={setModalConfig}
            payload={aiPrompt}
            reload={reload}
          ></SummaryPanelAIConfig>

          <SummaryPanelAIAudit
            open={modalAudit}
            setOpen={setModalAudit}
            audit={payload?.audit}
          ></SummaryPanelAIAudit>
        </div>
      )}
    </SummaryPanel>
  );
}

export default SummaryPanelAI;
