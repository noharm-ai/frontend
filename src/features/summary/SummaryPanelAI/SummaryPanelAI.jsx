import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Spin } from "antd";
import { ReloadOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { Textarea } from "components/Inputs";
import { textToHtml } from "utils/transformers/utils";

import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelAI({ url, apikey, payload, introduction, position }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState(null);

  const reload = () => {
    setLoading(true);
    setError(false);

    axios
      .post(url, payload, {
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
                onChange={({ target }) => setResult(target.value)}
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
          <Tooltip title="Solicitar nova resposta">
            <Button
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={reload}
              size="large"
              disabled={edit || loading}
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
        </div>
      )}
    </SummaryPanel>
  );
}

export default SummaryPanelAI;
