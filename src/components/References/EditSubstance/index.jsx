import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckOutlined, SettingOutlined } from "@ant-design/icons";

import { Select } from "components/Inputs";
import notification from "components/notification";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { updateSubstance } from "features/admin/DrugAttributes/DrugAttributesSlice";
import { getErrorMessage } from "utils/errorHandler";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

export default function EditSubstance({
  drugData,
  fetchSubstances,
  substance,
  idDrug,
  updateDrugData,
  afterSaveSubstance,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [currentSubstance, setCurrentSubstance] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubstances();
  }, [fetchSubstances]);

  useEffect(() => {
    setCurrentSubstance({
      sctidA: drugData.sctidA,
      sctNameA: drugData.sctNameA,
    });
  }, [drugData.sctNameA, drugData.sctidA]);

  const changeSubstance = (value) => {
    setCurrentSubstance({ sctidA: value.value, sctNameA: value.label });
  };

  const saveSubstance = () => {
    setSaving(true);
    const { sctidA, sctNameA } = currentSubstance;

    const params = {
      idDrug,
      sctid: sctidA,
    };

    dispatch(updateSubstance(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setSaving(false);
        updateDrugData({
          sctidA,
          sctNameA,
        });

        notification.success({
          message: "Substância atualizada!",
        });

        if (afterSaveSubstance) {
          afterSaveSubstance();
        }
      }
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Select
        id="sctidA"
        labelInValue
        style={{ width: "100%" }}
        showSearch
        optionFilterProp="children"
        placeholder="Selecione a substância..."
        value={{ value: currentSubstance.sctidA || "" }}
        loading={substance.isFetching}
        disabled={saving}
        onChange={changeSubstance}
      >
        <Select.Option key="0" value="0">
          &nbsp;
        </Select.Option>
        {substance.list.map(({ sctid, name, active }) => (
          <Select.Option key={sctid} value={sctid} title={name}>
            {`${active ? "" : "(INATIVO) "}`}
            {name}
          </Select.Option>
        ))}
      </Select>
      {drugData.sctidA !== currentSubstance.sctidA && (
        <Tooltip title="Confirmar e Salvar a alteração">
          <Button
            type="primary"
            className="gtm-bt-change-substancia"
            style={{ marginLeft: "5px" }}
            onClick={saveSubstance}
            disabled={saving}
            loading={saving}
            icon={<CheckOutlined />}
          ></Button>
        </Tooltip>
      )}
      {PermissionService().has(Permission.ADMIN_SUBSTANCES) &&
        drugData.sctidA === currentSubstance.sctidA && (
          <>
            <Tooltip title="Curadoria de substâncias">
              <Button
                type="primary"
                className="gtm-bt-edit-substancia"
                style={{ marginLeft: "5px" }}
                onClick={() => window.open("/admin/substancias")}
                icon={<SettingOutlined />}
              ></Button>
            </Tooltip>
          </>
        )}
    </div>
  );
}
