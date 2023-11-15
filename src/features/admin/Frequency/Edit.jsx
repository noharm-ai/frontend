import "styled-components/macro";
import React, { useState, useRef } from "react";
import { CheckOutlined, EditOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import { InputNumber } from "components/Inputs";
import notification from "components/notification";
import { useOutsideAlerter } from "lib/hooks";
import { updateDailyFrequency } from "./FrequencySlice";
import { getErrorMessage } from "utils/errorHandler";

export default function DailyFrequency({ id, dailyFrequency }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(
    dailyFrequency === null ? "-" : dailyFrequency
  );
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setEdit(false);
  });

  const handleClick = (event) => {
    event.preventDefault();
    setEdit(true);
  };

  const handleSave = () => {
    if (value === null || isNaN(value)) {
      notification.error({ message: "Valor inválido" });
      return;
    }
    setSaving(true);

    dispatch(updateDailyFrequency({ id, value })).then((response) => {
      setSaving(false);
      setEdit(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Frequência atualizada",
        });
      }
    });
  };

  return edit ? (
    <span ref={wrapperRef}>
      <InputNumber
        style={{
          marginRight: 8,
          width: 60,
        }}
        defaultValue={value === "-" ? 0 : value}
        onChange={setValue}
        autoFocus={true}
        onPressEnter={handleSave}
      />
      <Button
        type="primary gtm-bt-change-daily-frequency"
        onClick={handleSave}
        icon={<CheckOutlined />}
        loading={saving}
      ></Button>
    </span>
  ) : (
    <>
      <span css="margin-right: 10px;">{value}</span>
      {/*eslint-disable-next-line*/}
      <a href="#" css="color: inherit;" onClick={handleClick}>
        <EditOutlined />
      </a>
    </>
  );
}
