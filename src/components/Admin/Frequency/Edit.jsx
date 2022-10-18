import "styled-components/macro";
import React, { useState, useRef } from "react";
import { CheckOutlined, EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import { InputNumber } from "components/Inputs";
import notification from "components/notification";
import { useOutsideAlerter } from "lib/hooks";
import { store } from "store/index";
import api from "services/admin/api";

export default function DailyFrequency({ id, dailyFrequency }) {
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
    setSaving(true);

    const state = store.getState();
    const access_token = state.auth.identify.access_token;
    api
      .updateDailyFrequency(access_token, id, value)
      .then(() => {
        setSaving(false);
        setEdit(false);

        notification.success({
          message: "Frequência atualizada",
        });
      })
      .catch((e) => {
        notification.error({
          message: e.response.data.message,
        });
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
