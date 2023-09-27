import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Spin } from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  SettingOutlined,
  FileSearchOutlined,
  RobotOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import DOMPurify from "dompurify";

import Dropdown from "components/Dropdown";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { Textarea } from "components/Inputs";
import { textToHtml } from "utils/transformers/utils";

import { setBlock, setLike } from "../SummarySlice";
import SummaryPanelAIConfig from "./SummaryPanelAIConfig";
import SummaryPanelAIAudit from "./SummaryPanelAIAudit";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelAI({ url, apikey, payload, position, admissionNumber }) {
  const dispatch = useDispatch();
  const status = useSelector(
    (state) => state.summary.blocks[position]?.aiStatus
  );
  const likeStatus = useSelector(
    (state) => state.summary.blocks[position]?.like
  );
  const result = useSelector(
    (state) => state.summary.blocks[position]?.text || "Nada consta"
  );
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

      axios
        .post(url, forcePayload || aiPrompt, {
          headers: {
            authorization: `Key ${apikey}`,
          },
        })
        .then((response) => {
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
    },
    [dispatch, apikey, aiPrompt, payload?.audit, position, url]
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

  const likeAction = (type) => {
    dispatch(
      setLike({
        type: `summary-${type}`,
        block: position,
        status: type,
        value: {
          admissionNumber,
          block: position,
          text: result,
        },
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

          <Tooltip title="Útil">
            <Button
              shape="circle"
              icon={<LikeOutlined />}
              onClick={() => likeAction("like")}
              size="large"
              type={likeStatus === "like" ? "primary" : "default"}
              loading={likeStatus === "loading"}
            />
          </Tooltip>

          <Tooltip title="Inútil">
            <Button
              shape="circle"
              icon={<DislikeOutlined />}
              onClick={() => likeAction("dislike")}
              size="large"
              type={likeStatus === "dislike" ? "danger" : "default"}
              loading={likeStatus === "loading"}
            />
          </Tooltip>

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
