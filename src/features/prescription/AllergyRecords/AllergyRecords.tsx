import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spin, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";

import { formatDateTime } from "utils/date";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import Tooltip from "components/Tooltip";
import { getAllergyRecords } from "features/serverActions/ServerActionsSlice";
import { useAppDispatch } from "store/index";

import { Muted, RecordsRoot, Summary } from "./AllergyRecords.style";
import type { IAllergyRecord } from "./types";

interface IAllergyRecordsProps {
  idPrescription: number | string;
}

// no column identifies an alergia row: the position is the key
type IAllergyRecordRow = IAllergyRecord & { key: number };

/**
 * Every allergy record (alergia) of the prescription's patient, for
 * maintainers. fkmedicamento does not always reference a medicamento record,
 * so each record shows either the drug and its substance or, without a drug,
 * the name and substance stored in the record itself.
 */
export function AllergyRecords({ idPrescription }: IAllergyRecordsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [records, setRecords] = useState<IAllergyRecordRow[] | null>(null);

  useEffect(() => {
    let stale = false;
    dispatch(getAllergyRecords({ idPrescription })).then((response: any) => {
      if (stale) {
        return;
      }

      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
        setRecords([]);
      } else {
        setRecords(
          response.payload.data.map((record: IAllergyRecord, key: number) => ({
            ...record,
            key,
          })),
        );
      }
    });

    return () => {
      stale = true;
    };
  }, [dispatch, t, idPrescription]);

  const substance = (name: string | null, sctid: string | null) => {
    if (name) {
      return (
        <>
          {name} {sctid && <Muted>({sctid})</Muted>}
        </>
      );
    }

    return (
      <Muted>
        {sctid
          ? t("allergyRecords.unknownSubstance", { sctid })
          : t("allergyRecords.noSubstance")}
      </Muted>
    );
  };

  const columns: TableColumnsType<IAllergyRecordRow> = [
    {
      title: t("allergyRecords.origin"),
      key: "origin",
      render: (_, record) =>
        record.drug ? (
          <Tooltip title={t("allergyRecords.withDrugHint")}>
            <Tag color="blue">{t("allergyRecords.withDrug")}</Tag>
          </Tooltip>
        ) : (
          <Tooltip title={t("allergyRecords.withoutDrugHint")}>
            <Tag color="orange">{t("allergyRecords.withoutDrug")}</Tag>
          </Tooltip>
        ),
    },
    {
      title: t("allergyRecords.name"),
      key: "name",
      render: (_, record) =>
        record.drug ? record.drug.name : record.drugName || <Muted>--</Muted>,
    },
    {
      title: t("allergyRecords.substance"),
      key: "substance",
      render: (_, record) =>
        record.drug
          ? substance(record.drug.substance, record.drug.sctid)
          : substance(record.substance, record.sctid),
    },
    {
      title: "fkmedicamento",
      dataIndex: "idDrug",
      render: (idDrug: string | null) => idDrug ?? <Muted>--</Muted>,
    },
    {
      title: t("allergyRecords.status"),
      dataIndex: "active",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "default"}>
          {active ? t("allergyRecords.active") : t("allergyRecords.inactive")}
        </Tag>
      ),
    },
    {
      title: t("allergyRecords.createdAt"),
      dataIndex: "createdAt",
      render: (createdAt: string | null) =>
        formatDateTime(createdAt) ?? <Muted>--</Muted>,
    },
  ];

  const withDrug = (records ?? []).filter((r) => r.drug !== null).length;

  return (
    <Spin spinning={records === null}>
      <RecordsRoot>
        {records !== null && records.length > 0 && (
          <Summary>
            {t("allergyRecords.summary", {
              count: records.length,
              withDrug,
              withoutDrug: records.length - withDrug,
            })}
          </Summary>
        )}
        <Table
          size="small"
          columns={columns}
          dataSource={records ?? []}
          pagination={false}
          rowClassName={(record) => (record.active ? "" : "inactive")}
          locale={{ emptyText: t("allergyRecords.empty") }}
        />
      </RecordsRoot>
    </Spin>
  );
}
