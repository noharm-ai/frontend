import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Flex, Popconfirm, Select } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

import Button from "components/Button";
import notification from "components/notification";
import { getSubstances } from "features/lists/ListsSlice";
import { updateAllergySubstance } from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch } from "store/index";

import type { IAllergyRecord } from "../types";

interface IAllergySubstanceEditProps {
  record: IAllergyRecord;
  onCancel: () => void;
  onSaved: () => void;
}

/**
 * Picks (or clears) the substance of an allergy record without a medicamento
 * record. The backend sets it on every record with the same fkmedicamento and
 * nome_medicamento, of every patient, and maps the name to it.
 */
export function AllergySubstanceEdit({
  record,
  onCancel,
  onSaved,
}: IAllergySubstanceEditProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const substanceList = useSelector(
    (state: any) => state.lists.getSubstances.list,
  );
  const substanceStatus = useSelector(
    (state: any) => state.lists.getSubstances.status,
  );
  const [sctid, setSctid] = useState<string | null>(record.sctid);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch((getSubstances as any)({ useCache: true }));
  }, [dispatch]);

  // null removes the substance
  const changed = sctid !== record.sctid;
  const removing = sctid === null;

  const save = () => {
    setSaving(true);
    dispatch(
      updateAllergySubstance({
        idDrug: record.idDrug,
        drugName: record.drugName,
        sctid,
      }),
    ).then((response: any) => {
      setSaving(false);

      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({
          message: t("allergyRecords.substanceUpdated", {
            count: response.payload.data.updated,
          }),
        });
        onSaved();
      }
    });
  };

  const hasName = !!record.drugName?.trim();

  return (
    // the select takes the whole cell, the actions go below it: the column
    // is narrow and substance names are long
    <Flex vertical gap={4}>
      <Select
        size="small"
        style={{ width: "100%" }}
        // the options are wider than the cell
        popupMatchSelectWidth={360}
        placeholder={t("allergyRecords.selectSubstance")}
        value={sctid ?? undefined}
        loading={substanceStatus === "loading"}
        disabled={saving}
        onChange={(value?: string) => setSctid(value ?? null)}
        allowClear
        showSearch={{ optionFilterProp: "label" }}
        options={substanceList.map(
          ({
            sctid,
            name,
            active,
          }: {
            sctid: string;
            name: string;
            active: boolean;
          }) => ({
            value: `${sctid}`,
            label: `${active ? "" : "(INATIVO) "}${name}`,
          }),
        )}
        aria-label={t("allergyRecords.selectSubstance")}
      />
      <Flex gap={4} justify="flex-end">
        <Popconfirm
          title={
            removing
              ? t("allergyRecords.confirmRemoveTitle")
              : t("allergyRecords.confirmSubstanceTitle")
          }
          description={
            <div style={{ maxWidth: 360 }}>
              {hasName
                ? t(
                    removing
                      ? "allergyRecords.confirmRemove"
                      : "allergyRecords.confirmSubstance",
                    { name: record.drugName },
                  )
                : t(
                    removing
                      ? "allergyRecords.confirmRemoveNoName"
                      : "allergyRecords.confirmSubstanceNoName",
                  )}
            </div>
          }
          okText={t("actions.save")}
          cancelText={t("actions.cancel")}
          onConfirm={save}
          disabled={!changed}
        >
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            aria-label={t("actions.save")}
            disabled={!changed}
            loading={saving}
          />
        </Popconfirm>
        <Button
          size="small"
          icon={<CloseOutlined />}
          aria-label={t("actions.cancel")}
          onClick={onCancel}
          disabled={saving}
        />
      </Flex>
    </Flex>
  );
}
