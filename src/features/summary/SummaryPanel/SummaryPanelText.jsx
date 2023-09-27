import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  EditOutlined,
  SaveOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import DOMPurify from "dompurify";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { Textarea } from "components/Inputs";
import { textToHtml } from "utils/transformers/utils";

import { setBlock, setLike } from "../SummarySlice";
import { SummaryPanel } from "../Summary.style";

function SummaryPanelText({ text, position, admissionNumber }) {
  const dispatch = useDispatch();
  const [edit, setEdit] = useState(false);
  const [editText, setEditText] = useState("");
  const result = useSelector((state) => state.summary.blocks[position]?.text);
  const likeStatus = useSelector(
    (state) => state.summary.blocks[position]?.like
  );

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
      })
    );
  }, [text, position, dispatch]);

  useEffect(() => {
    if (edit) {
      setEditText(result);
    }
  }, [edit, result]);

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
      </div>
    </SummaryPanel>
  );
}

export default SummaryPanelText;
