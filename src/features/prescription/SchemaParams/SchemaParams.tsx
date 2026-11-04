import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Collapse, Descriptions, Flex, Spin, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";

import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import { getSchemaParams } from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch } from "store/index";

import { Footer, Muted, ParamsRoot, Schema } from "./SchemaParams.style";
import type {
  AlertLevel,
  IInteractionKindParams,
  ISchemaParams,
} from "./types";

// alert_service types, in the order the table lists them
const ALERT_TYPES = [
  "kidney",
  "liver",
  "platelets",
  "elderly",
  "tube",
  "allergy",
  "maxTime",
  "maxDose",
  "maxDosePlus",
  "ira",
  "pregnant",
  "lactating",
  "fasting",
  "protocol",
  "cultureResistant",
  "cultureResistantClass",
];

// interaction relation kinds: params only lists the ones with settings
const INTERACTION_KINDS = ["it", "dt", "dm", "iy", "sl", "rx"];

const DEFAULT_KIND: IInteractionKindParams = {
  enabled: true,
  ignoreLevels: [],
  ignoreFrequencies: [],
  requireIntervalIntersection: false,
};

// each protocol sets its own level: the type's level is not applied
const LEVEL_NOT_APPLIED = ["protocol"];
// the second side is an allergy: frequency and shared time are not applied
const FREQUENCY_NOT_APPLIED = ["rx"];

const isSet = (values: object | undefined, key: string) =>
  !!values && Object.prototype.hasOwnProperty.call(values, key);

// the thunk's settled action (ServerActionsSlice is untyped JS)
interface ISchemaParamsResponse {
  error?: unknown;
  payload: { data: ISchemaParams };
}

interface IRow {
  key: string;
  custom: Record<string, unknown> | undefined;
}

/**
 * The schema params in force (the schema's item over the code defaults), read
 * only, for maintainers: they are edited in the admin project. Fetched on each
 * mount, never kept in the store, so changes made in admin show at once.
 */
export function SchemaParams() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<ISchemaParams | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stale = false;
    dispatch(getSchemaParams(undefined)).then(
      (response: ISchemaParamsResponse) => {
        if (stale) {
          return;
        }

        if (response.error) {
          setError(getErrorMessage(response, t));
        } else {
          setData(response.payload.data);
        }
      },
    );

    return () => {
      stale = true;
    };
  }, [dispatch, t]);

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title={t("schemaParams.loadError")}
        description={error}
      />
    );
  }

  if (!data) {
    return (
      <Flex justify="center" style={{ padding: "2rem" }}>
        <Spin />
      </Flex>
    );
  }

  const { alerts } = data.params;
  const customTypes = data.custom?.alerts?.types;
  const customKinds = data.custom?.alerts?.interactions;

  // a value the schema's item sets, marked apart from the code defaults
  const value = (row: IRow, field: string, content: ReactNode) => {
    if (!isSet(row.custom, field)) {
      return content;
    }

    return (
      <span className="custom-value" data-custom="true">
        {content}{" "}
        <Tag color="blue" style={{ marginInlineEnd: 0 }}>
          {t("schemaParams.custom")}
        </Tag>
      </span>
    );
  };

  const enabled = (on: boolean) =>
    on ? (
      <Tag color="green">{t("schemaParams.enabled")}</Tag>
    ) : (
      <Tag>{t("schemaParams.disabled")}</Tag>
    );

  const level = (lvl: AlertLevel) => (
    <DrugAlertLevelTag
      key={lvl}
      levels={[lvl]}
      count={lvl}
      showDescription
      showTooltip={false}
    />
  );

  const notApplicable = <Muted>{t("schemaParams.notApplicable")}</Muted>;
  const none = <Muted>{t("schemaParams.none")}</Muted>;

  const typeRows = ALERT_TYPES.map((type) => ({
    key: type,
    custom: customTypes?.[type],
    ...alerts.types[type],
  }));

  const typeColumns: TableColumnsType<(typeof typeRows)[number]> = [
    {
      title: t("schemaParams.type"),
      render: (_, row) => t(`drugAlertType.${row.key}`),
    },
    {
      title: t("schemaParams.state"),
      render: (_, row) => value(row, "enabled", enabled(row.enabled)),
    },
    {
      title: t("schemaParams.level"),
      render: (_, row) => {
        if (LEVEL_NOT_APPLIED.includes(row.key)) {
          return notApplicable;
        }

        return value(
          row,
          "level",
          row.level ? (
            level(row.level)
          ) : (
            <Muted>{t("schemaParams.defaultLevel")}</Muted>
          ),
        );
      },
    },
  ];

  const kindRows = INTERACTION_KINDS.map((kind) => ({
    key: kind,
    custom: customKinds?.[kind],
    ...DEFAULT_KIND,
    ...alerts.interactions?.[kind],
  }));

  const frequency = (code: number) => {
    const label = t(`schemaParams.frequency.${code}`, { defaultValue: "" });

    return <Tag key={code}>{label || code}</Tag>;
  };

  const kindColumns: TableColumnsType<(typeof kindRows)[number]> = [
    {
      title: t("schemaParams.kind"),
      render: (_, row) => t(`drugAlertType.${row.key}`),
    },
    {
      title: t("schemaParams.state"),
      render: (_, row) => value(row, "enabled", enabled(row.enabled)),
    },
    {
      title: t("schemaParams.ignoreLevels"),
      render: (_, row) =>
        value(
          row,
          "ignoreLevels",
          row.ignoreLevels.length ? (
            <Flex gap={4} wrap component="span">
              {row.ignoreLevels.map(level)}
            </Flex>
          ) : (
            none
          ),
        ),
    },
    {
      title: t("schemaParams.ignoreFrequencies"),
      render: (_, row) => {
        if (FREQUENCY_NOT_APPLIED.includes(row.key)) {
          return notApplicable;
        }

        return value(
          row,
          "ignoreFrequencies",
          row.ignoreFrequencies.length ? (
            <span>{row.ignoreFrequencies.map(frequency)}</span>
          ) : (
            none
          ),
        );
      },
    },
    {
      title: t("schemaParams.requireIntervalIntersection"),
      render: (_, row) => {
        if (FREQUENCY_NOT_APPLIED.includes(row.key)) {
          return notApplicable;
        }

        return value(
          row,
          "requireIntervalIntersection",
          row.requireIntervalIntersection
            ? t("schemaParams.yes")
            : t("schemaParams.no"),
        );
      },
    },
  ];

  const kidneyRow = typeRows.find((row) => row.key === "kidney")!;
  const exams = (list: string[]) => list.join(", ");

  return (
    <ParamsRoot>
      <div>
        <Schema>{data.schema}</Schema>
        {data.status === "found" && (
          <Alert
            type="success"
            showIcon
            title={t("schemaParams.statusFound")}
          />
        )}
        {data.status === "read_error" && (
          <Alert
            type="warning"
            showIcon
            title={t("schemaParams.statusReadError")}
          />
        )}
        {data.status !== "found" && data.status !== "read_error" && (
          <Alert
            type="info"
            showIcon
            title={t("schemaParams.statusNotFound")}
          />
        )}
      </div>

      {!!data.invalidSections?.length && (
        <Alert
          type="warning"
          showIcon
          title={t("schemaParams.invalidSections", {
            sections: data.invalidSections.join(", "),
          })}
        />
      )}

      <h4>{t("schemaParams.alerts")}</h4>
      <Table
        aria-label={t("schemaParams.alerts")}
        size="small"
        pagination={false}
        columns={typeColumns}
        dataSource={typeRows}
      />
      <Descriptions
        size="small"
        bordered
        column={1}
        title={t("schemaParams.kidneyExams")}
        items={[
          {
            key: "adultExams",
            label: t("schemaParams.adultExams"),
            children: value(
              kidneyRow,
              "adultExams",
              exams(alerts.types.kidney.adultExams),
            ),
          },
          {
            key: "pediatricExams",
            label: t("schemaParams.pediatricExams"),
            children: value(
              kidneyRow,
              "pediatricExams",
              exams(alerts.types.kidney.pediatricExams),
            ),
          },
        ]}
      />

      <h4>{t("schemaParams.interactions")}</h4>
      <Table
        aria-label={t("schemaParams.interactions")}
        size="small"
        pagination={false}
        columns={kindColumns}
        dataSource={kindRows}
      />

      <Collapse
        size="small"
        items={[
          {
            key: "json",
            label: t("schemaParams.json"),
            children: <pre>{JSON.stringify(data.custom ?? {}, null, 2)}</pre>,
          },
        ]}
      />

      <Footer>{t("schemaParams.footer")}</Footer>
    </ParamsRoot>
  );
}
