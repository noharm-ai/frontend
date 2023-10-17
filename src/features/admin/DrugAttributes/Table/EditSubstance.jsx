import "styled-components/macro";
import React, { useState, useEffect } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import { Select } from "components/Inputs";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import { updateSubstance } from "../DrugAttributesSlice";

export default function EditPriceConversion({ idDrug, sctid }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesLoading =
    useSelector((state) => state.lists.getSubstances.status) === "loading";
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(sctid);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    setValue(sctid);
  }, [sctid]);

  const handleSave = () => {
    if (value === null) {
      notification.error({ message: "Valor inválido" });
      return;
    }
    setSaving(true);

    const params = {
      idDrug,
      sctid: value,
    };

    dispatch(updateSubstance(params)).then((response) => {
      setSaving(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setUpdated(true);
        notification.success({
          message: "Substância atualizada!",
        });
      }
    });
  };

  return (
    <span style={{ width: "500px" }}>
      <Select
        style={{ width: "400px", marginRight: "5px" }}
        value={value ? `${value}` : null}
        onChange={(val) => setValue(val)}
        showSearch
        optionFilterProp="children"
        disabled={substancesLoading}
        loading={substancesLoading}
        allowClear
      >
        {substances.map(({ sctid, name }) => (
          <Select.Option key={sctid} value={sctid}>
            {name}
          </Select.Option>
        ))}
      </Select>
      <Button
        type="primary"
        ghost={!updated}
        onClick={handleSave}
        icon={<CheckOutlined />}
        loading={saving}
        disabled={substancesLoading}
      ></Button>
    </span>
  );
}
