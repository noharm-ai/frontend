import React, { useState } from "react";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { Textarea } from "components/Inputs";
import { textToHtml } from "utils/transformers/utils";

import { SummaryPanel } from "../Summary.style";

function SummaryPanelText({ text }) {
  const [edit, setEdit] = useState(false);
  const [result, setResult] = useState(text);

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
