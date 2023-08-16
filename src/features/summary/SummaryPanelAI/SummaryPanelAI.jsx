import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
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

import { setBlock } from "../SummarySlice";
import SummaryPanelAIConfig from "./SummaryPanelAIConfig";
import SummaryPanelAIAudit from "./SummaryPanelAIAudit";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelAI({ url, apikey, payload, introduction, position }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState(
    !payload?.audit?.length ? "Nada consta" : null
  );
  const [modalConfig, setModalConfig] = useState(false);
  const [modalAudit, setModalAudit] = useState(false);
  const [aiPrompt, setAIPrompt] = useState(payload?.prompt);

  const reload = (forcePayload) => {
    if (!forcePayload && !payload.audit?.length) {
      setResult("Nada consta");
      return;
    }

    setLoading(true);
    setError(false);

    if (forcePayload) {
      setAIPrompt(forcePayload);
    }

    axios
      .post(url, forcePayload || aiPrompt, {
        headers: {
          authorization: `Key ${apikey}`,
        },
      })
      .then((response) => {
        setResult(response.data?.answer);
        setLoading(false);
        dispatch(
          setBlock({
            id: position,
            data: response.data?.answer,
          })
        );
      })
      .catch(() => {
        console.log("error");
        setError(true);
      });
  };

  const onChange = (value) => {
    setResult(value);
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
      label: "Configurar prompt",
      icon: <RobotOutlined />,
    },
    {
      key: "audit",
      label: "Auditoria",
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
            onClick={reload}
            size="large"
          />
        </div>
      </SummaryPanel>
    );
  }

  return (
    <SummaryPanel
      className={loading ? "loading" : edit ? "edit" : ""}
      data-value={result}
    >
      {loading ? (
        <div className="loader">
          <Spin />
        </div>
      ) : (
        <>
          {introduction && <div className="intro">{introduction}</div>}

          {edit ? (
            <>
              <Textarea
                autoFocus
                value={result}
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
          <Tooltip title="Atualizar">
            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={() => reload()}
              size="large"
              disabled={edit || loading || !payload?.audit?.length}
            />
          </Tooltip>

          {edit ? (
            <Tooltip title="Salvar">
              <Button
                shape="circle"
                icon={<SaveOutlined />}
                onClick={() => setEdit(false)}
                size="large"
                type="primary"
              />
            </Tooltip>
          ) : (
            <Tooltip title="Editar">
              <Button
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => setEdit(true)}
                size="large"
              />
            </Tooltip>
          )}

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
