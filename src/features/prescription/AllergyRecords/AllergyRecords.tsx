import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spin, Table, Tag } from "antd";
import {
  DisconnectOutlined,
  EditOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";

import { formatDateTime } from "utils/date";
import { getErrorMessage } from "utils/errorHandler";
import Button from "components/Button";
import notification from "components/notification";
import Tooltip from "components/Tooltip";
import { getAllergyRecords } from "features/serverActions/ServerActionsSlice";
import { useAppDispatch } from "store/index";

import { AllergySubstanceEdit } from "./AllergySubstanceEdit/AllergySubstanceEdit";
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
 * the name and substance stored in the record itself, which can be edited.
 */
export function AllergyRecords({ idPrescription }: IAllergyRecordsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [records, setRecords] = useState<IAllergyRecordRow[] | null>(null);
  // bumped after an edit: it changes the other records of the same name too
  const [version, setVersion] = useState(0);
  // version of the last answered request: loading while it differs
  const [answeredVersion, setAnsweredVersion] = useState<number | null>(null);
  const loading = answeredVersion !== version;
  const [editingKey, setEditingKey] = useState<number | null>(null);

  useEffect(() => {
    let stale = false;
    dispatch(getAllergyRecords({ idPrescription })).then((response: any) => {
      if (stale) {
        return;
      }
      setAnsweredVersion(version);

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
  }, [dispatch, t, idPrescription, version]);

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

  const origin = (record: IAllergyRecordRow) => {
    const label = record.drug
      ? t("allergyRecords.withDrug")
      : t("allergyRecords.withoutDrug");

    return (
      <Tooltip
        title={
          <>
            <strong>{label}</strong>
            <br />
            {record.drug
              ? t("allergyRecords.withDrugHint")
              : t("allergyRecords.withoutDrugHint")}
          </>
        }
      >
        <Tag
          color={record.drug ? "blue" : "orange"}
          icon={record.drug ? <LinkOutlined /> : <DisconnectOutlined />}
          aria-label={label}
          style={{ marginInlineEnd: 0 }}
        >
          {record.idDrug ?? "--"}
        </Tag>
      </Tooltip>
    );
  };

  const columns: TableColumnsType<IAllergyRecordRow> = [
    {
      // the color and icon tell whether fkmedicamento has a medicamento record
      title: "fkmedicamento",
      key: "origin",
      width: 135,
      render: (_, record) => origin(record),
    },
    {
      title: t("allergyRecords.name"),
      key: "name",
      width: 200,
      render: (_, record) =>
        record.drug ? record.drug.name : record.drugName || <Muted>--</Muted>,
    },
    {
      title: t("allergyRecords.substance"),
      key: "substance",
      render: (_, record) => {
        if (record.drug) {
          return substance(record.drug.substance, record.drug.sctid);
        }

        if (editingKey === record.key) {
          return (
            <AllergySubstanceEdit
              record={record}
              onCancel={() => setEditingKey(null)}
              onSaved={() => {
                setEditingKey(null);
                setVersion((current) => current + 1);
              }}
            />
          );
        }

        return (
          <>
            {substance(record.substance, record.sctid)}{" "}
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              aria-label={t("allergyRecords.editSubstance")}
              title={t("allergyRecords.editSubstance")}
              onClick={() => setEditingKey(record.key)}
            />
          </>
        );
      },
    },
    {
      title: t("allergyRecords.status"),
      dataIndex: "active",
      width: 90,
      render: (active: boolean) => (
        <Tag color={active ? "green" : "default"}>
          {active ? t("allergyRecords.active") : t("allergyRecords.inactive")}
        </Tag>
      ),
    },
    {
      title: t("allergyRecords.createdAt"),
      dataIndex: "createdAt",
      width: 110,
      render: (createdAt: string | null) =>
        formatDateTime(createdAt) ?? <Muted>--</Muted>,
    },
  ];

  const withDrug = (records ?? []).filter((r) => r.drug !== null).length;

  return (
    <Spin spinning={loading}>
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
          // fixed: the substance editor takes the width of its column instead
          // of widening the table past the modal; narrower screens scroll
          tableLayout="fixed"
          scroll={{ x: 900 }}
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
