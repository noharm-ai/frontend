import "styled-components";
import React, { useState, useEffect } from "react";
import {
  CheckOutlined,
  RobotOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import { Select } from "components/Inputs";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import { updateSubstance } from "../DrugAttributesSlice";
import { setDrawerSctid } from "features/admin/DrugReferenceDrawer/DrugReferenceDrawerSlice";

export default function EditPriceConversion({ idDrug, sctid, accuracy }) {
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

  const getAccuracyColor = (value) => {
    if (value >= 75) {
      return "green";
    }

    if (value >= 50) {
      return "gold";
    }

    return "red";
  };

  return (
    <div>
      <span style={{ width: "500px", display: "flex" }}>
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
          {substances.map(({ sctid, name, active }) => (
            <Select.Option key={sctid} value={sctid}>
              {active ? "" : "(INATIVO) "}
              {name}
            </Select.Option>
          ))}
        </Select>

        <Tooltip title="Salvar">
          <Button
            type="primary"
            ghost={!updated}
            onClick={handleSave}
            icon={<CheckOutlined />}
            loading={saving}
            disabled={substancesLoading}
          ></Button>
        </Tooltip>
        {accuracy && value === sctid && !updated && (
          <Tooltip
            title={`A substância foi definida pela IA com acurácia de ${accuracy.toLocaleString()}%. Clique no botão ao lado para confirmar ou efetue a correção`}
          >
            <Tag
              icon={<RobotOutlined />}
              color={getAccuracyColor(accuracy)}
              style={{
                marginLeft: "5px",
                display: "flex",
                alignItems: "center",
                fontSize: "14px",
              }}
            >
              {accuracy.toLocaleString()}%
            </Tag>
          </Tooltip>
        )}
        <Tooltip title="Referência">
          <Button
            onClick={() => dispatch(setDrawerSctid(value))}
            icon={<FileTextOutlined />}
            disabled={!value}
            shape="circle"
            style={{
              marginLeft: "5px",
            }}
          ></Button>
        </Tooltip>
      </span>
    </div>
  );
}
