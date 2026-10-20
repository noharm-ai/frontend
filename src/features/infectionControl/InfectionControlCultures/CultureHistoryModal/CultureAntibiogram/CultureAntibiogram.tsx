import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Empty, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import Tag from "components/Tag";
import { formatDateTime } from "utils/date";
import {
  RESULT_RESISTANT,
  RESULT_SUSCEPTIBLE,
} from "features/culture/cultureResistance";

import {
  IAntibiogramResult,
  ICultureWithAntibiogram,
} from "../../../InfectionControlSlice";
import { Gram } from "../../InfectionControlCultures.style";
import { LabResult } from "../../LabResult/LabResult";
import { AntibiogramBox } from "./CultureAntibiogram.style";

interface CultureAntibiogramProps {
  culture: ICultureWithAntibiogram;
  // the newest other collection of the exam and material with an antibiogram,
  // offered while this one waits for the lab
  released: ICultureWithAntibiogram | null;
  onSelect: (culture: ICultureWithAntibiogram) => void;
}

// the tag colour of the culture card (CultureDetailsModal): a result the
// backend could not classify is not a sensitivity, so it gets no colour
const resultTagColor = (row: IAntibiogramResult): string | undefined => {
  if (row.resultType === RESULT_RESISTANT) return "red";
  if (row.resultType === RESULT_SUSCEPTIBLE) return "green";

  return undefined;
};

// the results of each microorganism, in the order the backend sorts them
const byMicroorganism = (antibiogram: IAntibiogramResult[]) => {
  const groups = new Map<string | null, IAntibiogramResult[]>();

  antibiogram.forEach((row) => {
    groups.set(row.microorganism, [
      ...(groups.get(row.microorganism) ?? []),
      row,
    ]);
  });

  return [...groups.entries()];
};

/**
 * The antibiogram of one collection: the drugs the lab tested against each
 * microorganism it found, resistant or susceptible, under the collection's
 * dates, gram and result. A collection still waiting for the lab has none, so
 * the newest one that has is a click away
 */
export function CultureAntibiogram({
  culture,
  released,
  onSelect,
}: CultureAntibiogramProps) {
  const { t } = useTranslation();
  // a backend that does not send the antibiogram yet reads as none released
  const antibiogram = culture.antibiogram ?? [];

  const columns: ColumnsType<IAntibiogramResult> = useMemo(
    () => [
      {
        title: t("infectionControl.cultures.antibiogram.drug"),
        key: "drug",
        dataIndex: "drug",
      },
      {
        title: t("infectionControl.cultures.antibiogram.result"),
        key: "result",
        render: (_, row) => (
          <Tag
            className="antibiogram-result"
            variant="filled"
            color={resultTagColor(row)}
          >
            {row.result}
          </Tag>
        ),
      },
      {
        title: t("infectionControl.cultures.antibiogram.mic"),
        key: "mic",
        className: "antibiogram-mic",
        render: (_, row) => row.mic ?? <span className="muted">-</span>,
      },
    ],
    [t],
  );

  return (
    <AntibiogramBox data-testid="culture-antibiogram">
      <dl className="antibiogram-culture">
        <div>
          <dt>{t("infectionControl.cultures.collectionDate")}</dt>
          <dd>{formatDateTime(culture.collectionDate) ?? "-"}</dd>
        </div>
        <div>
          <dt>{t("infectionControl.cultures.releaseDate")}</dt>
          <dd>{formatDateTime(culture.releaseDate) ?? "-"}</dd>
        </div>
        {culture.gram && (
          <div>
            <dt>{t("infectionControl.cultures.gram")}</dt>
            <dd>
              <Gram data-testid="culture-gram">{culture.gram}</Gram>
            </dd>
          </div>
        )}
        {culture.previousResult && (
          <div className="antibiogram-lab-result">
            <dt>{t("infectionControl.cultures.result")}</dt>
            <dd>
              <LabResult value={culture.previousResult} />
            </dd>
          </div>
        )}
      </dl>

      {antibiogram.length ? (
        <div className="antibiogram-groups">
          {byMicroorganism(antibiogram).map(([microorganism, rows]) => (
            <section
              key={microorganism ?? ""}
              className="antibiogram-group"
              data-testid="antibiogram-microorganism"
            >
              <h3 className="antibiogram-microorganism">
                {microorganism ??
                  t("infectionControl.cultures.antibiogram.noMicroorganism")}
              </h3>
              <Table
                size="small"
                columns={columns}
                // a lab may repeat a drug: the position is the only key
                dataSource={rows.map((row, index) => ({ ...row, key: index }))}
                pagination={false}
              />
            </section>
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("infectionControl.cultures.antibiogram.empty")}
        >
          {released && (
            <Button type="link" onClick={() => onSelect(released)}>
              {t("infectionControl.cultures.antibiogram.openReleased", {
                date: formatDateTime(released.collectionDate) ?? "-",
              })}
            </Button>
          )}
        </Empty>
      )}
    </AntibiogramBox>
  );
}
