import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { Textarea } from "components/Inputs";
import { textToHtml } from "utils/transformers/utils";

import { setBlock } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelText({ text, position }) {
  const dispatch = useDispatch();
  const [edit, setEdit] = useState(false);
  const [result, setResult] = useState(text);

  useEffect(() => {
    dispatch(
      setBlock({
        id: position,
        data: result,
      })
    );
  }, [result, position, dispatch]);

  return (
    <SummaryPanel className={edit ? "edit" : ""} data-value={result}>
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

      <div className="actions">
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
    </SummaryPanel>
  );
}

export default SummaryPanelText;
