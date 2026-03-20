import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import {
  CheckOutlined,
  EditOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { Select } from "components/Inputs";
import notification from "components/notification";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { getSubstances } from "features/lists/ListsSlice";
import { getErrorMessage } from "utils/errorHandler";
import { updateDrugSubstance } from "./DrugSubstanceSlice";
import { setDrawerSctid } from "features/admin/DrugReferenceDrawer/DrugReferenceDrawerSlice";
import { fetchSubstance } from "features/admin/Substance/SubstanceFormSlice";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";

interface DrugSubstanceProps {
  idDrug: string;
  sctidA?: string | null;
  sctNameA?: string | null;
  onAfterSave?: (data: string | null) => void;
}

export default function DrugSubstance({
  idDrug,
  sctidA,
  sctNameA,
  onAfterSave,
}: DrugSubstanceProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const substanceList = useSelector(
    (state: any) => state.lists.getSubstances.list,
  );
  const substanceStatus = useSelector(
    (state: any) => state.lists.getSubstances.status,
  );
  const saveStatus = useSelector((state: any) => state.drugSubstance.status);

  const [userEditing, setUserEditing] = useState(false);
  const editing = userEditing || !sctidA;
  const [currentSubstance, setCurrentSubstance] = useState<string | null>(null);

  useEffect(() => {
    if (!sctidA) {
      dispatch((getSubstances as any)({ useCache: true }));
    }
  }, [dispatch, sctidA]);

  const isLoadingList = substanceStatus === "loading";
  const isSaving = saveStatus === "loading";

  const handleEnterEdit = () => {
    dispatch((getSubstances as any)({ useCache: true }));
    setCurrentSubstance(sctidA ?? null);
    setUserEditing(true);
  };

  const handleChange = (value: any) => {
    setCurrentSubstance(value);
  };

  const handleSave = () => {
    dispatch(updateDrugSubstance({ idDrug, sctid: currentSubstance })).then(
      (response: any) => {
        if (response.error) {
          notification.error({ message: getErrorMessage(response, t) });
        } else {
          notification.success({ message: "Substância atualizada!" });
          setUserEditing(false);
          onAfterSave?.(currentSubstance);
        }
      },
    );
  };

  const hasChanged = currentSubstance !== (sctidA ?? null);

  if (!editing) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <span>{sctNameA ?? "-"}</span>
        <div style={{ display: "flex", gap: "10px" }}>
          <Tooltip title="Alterar substância">
            <Button
              type="primary"
              ghost
              shape="circle"
              icon={<EditOutlined />}
              onClick={handleEnterEdit}
            />
          </Tooltip>
          {PermissionService().has(Permission.MAINTAINER) && (
            <>
              <Tooltip title="Referência">
                <Button
                  onClick={() => dispatch(setDrawerSctid(sctidA))}
                  icon={<FileTextOutlined />}
                  disabled={!sctidA}
                  shape="circle"
                ></Button>
              </Tooltip>
              <Tooltip title="Configurar substância">
                <Button
                  onClick={() => dispatch(fetchSubstance(sctidA))}
                  icon={<SettingOutlined />}
                  disabled={!sctidA}
                  shape="circle"
                />
              </Tooltip>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <Spin spinning={isLoadingList}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <Select
            id="sctidA"
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="children"
            placeholder="Selecione a substância..."
            value={currentSubstance ?? undefined}
            loading={isLoadingList}
            disabled={isSaving}
            onChange={handleChange}
            allowClear
          >
            {substanceList.map(
              ({
                sctid,
                name,
                active,
              }: {
                sctid: string;
                name: string;
                active: boolean;
              }) => (
                <Select.Option key={sctid} value={`${sctid}`} title={name}>
                  {`${active ? "" : "(INATIVO) "}`}
                  {name}
                </Select.Option>
              ),
            )}
          </Select>
        </div>
        {hasChanged && (
          <div style={{ flexShrink: 0 }}>
            <Button
              type="primary"
              className="gtm-bt-change-substancia"
              onClick={handleSave}
              disabled={isSaving}
              loading={isSaving}
              icon={<CheckOutlined />}
            />
          </div>
        )}
      </div>
    </Spin>
  );
}
