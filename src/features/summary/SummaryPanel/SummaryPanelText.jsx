import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { Textarea } from "components/Inputs";
import { textToHtml } from "utils/transformers/utils";

import { setBlock } from "../SummarySlice";
import SummaryReactions from "../SummaryReactions/SummaryReactions";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelText({ text, position, admissionNumber }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [edit, setEdit] = useState(false);
  const [editText, setEditText] = useState("");
  const result = useSelector((state) => state.summary.blocks[position]?.text);

  useEffect(() => {
    dispatch(
      setBlock({
        id: position,
        data: result,
      })
    );
  }, [result, position, dispatch]);

  useEffect(() => {
    dispatch(
      setBlock({
        id: position,
        data: text,
        original: text,
      })
    );
  }, [text, position, dispatch]);

  useEffect(() => {
    if (edit) {
      setEditText(result);
    }
  }, [edit, result]);

  return (
    <SummaryPanel className={edit ? "edit" : ""} data-value={editText}>
      {edit ? (
        <>
          <Textarea
            autoFocus
            value={editText}
            onChange={({ target }) => {
              setEditText(target.value);
              dispatch(
                setBlock({
                  id: position,
                  data: target.value,
                })
              );
            }}
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
      </div>
    </SummaryPanel>
  );
}

export default SummaryPanelText;
