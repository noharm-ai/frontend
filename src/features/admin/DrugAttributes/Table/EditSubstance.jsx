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

export default function EditSubstance({ idDrug, sctid, accuracy }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const substances = useSelector((state) => state.lists.getSubstances.list);
  const substancesLoading =
    useSelector((state) => state.lists.getSubstances.status) === "loading";
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(sctid);
  const [updated, setUpdated] = useState(false);
  const [edit, setEdit] = useState(false);

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
        setEdit(false);
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

  if (!accuracy && !edit && sctid) {
    return (
      <Tooltip title="Clique para editar">
        <a
          onClick={() => setEdit(true)}
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {substances.find((sub) => `${sub.sctid}` === `${value}`)?.name ||
            value}
        </a>
      </Tooltip>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <span style={{ width: "100%", display: "flex" }}>
        <Select
          style={{ flex: 1, minWidth: 0 }}
          value={value ? `${value}` : null}
          onChange={(val) => setValue(val)}
          showSearch={{ optionFilterProp: ["label"] }}
          disabled={substancesLoading}
          loading={substancesLoading}
          allowClear
          optionRender={(option) => (
            <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
              {option.label}
            </div>
          )}
          options={substances.map(({ sctid, name, active }) => ({
            value: sctid,
            label: `${active ? "" : "(INATIVO) "} ${name}`,
          }))}
          size="small"
        />
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginTop: "2px",
        }}
      >
        <Tooltip title="Referência">
          <Button
            onClick={() => dispatch(setDrawerSctid(value))}
            icon={<FileTextOutlined />}
            disabled={!value}
            size="small"
          ></Button>
        </Tooltip>
        <Tooltip title="Salvar">
          <Button
            type="primary"
            ghost={!updated}
            onClick={handleSave}
            icon={<CheckOutlined />}
            loading={saving}
            disabled={substancesLoading}
            size="small"
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
                display: "flex",
                alignItems: "center",
                fontSize: "11px",
              }}
            >
              {accuracy.toLocaleString()}%
            </Tag>
          </Tooltip>
        )}
      </span>
    </div>
  );
}
