import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { RESULT_RESISTANT } from "features/culture/cultureResistance";

import {
  IAntibiogramResult,
  ICultureWithAntibiogram,
} from "../../../InfectionControlSlice";
import { drugKey, isInUse, resultColor } from "../../cultureCollections";
import { AntibiogramBox } from "./CollectionAntibiogram.style";

interface CollectionAntibiogramProps {
  culture: ICultureWithAntibiogram;
  // the drugs of the prescription, by drugKey
  prescribed: Set<string>;
}

// a drug of the antibiogram and its result for each microorganism
interface IDrugRow {
  key: string;
  drug: string;
  inUse: boolean;
  resistantInUse: boolean;
  results: Map<string | null, IAntibiogramResult>;
}

const organismKey = (microorganism: string | null) => microorganism ?? "";

/**
 * The antibiogram of one culture as a table: a drug per row and a
 * microorganism per column, so that the microorganisms read side by side. The
 * drugs of the prescription come first, a resistant one marked
 */
export function CollectionAntibiogram({
  culture,
  prescribed,
}: CollectionAntibiogramProps) {
  const { t } = useTranslation();
  const antibiogram = useMemo(() => culture.antibiogram ?? [], [culture]);

  const organisms = useMemo(() => {
    const names: (string | null)[] = [...culture.microorganisms];
    antibiogram.forEach((row) => {
      if (!names.includes(row.microorganism)) names.push(row.microorganism);
    });
    // a microorganism the antibiogram does not test has no column
    return names.filter((name) =>
      antibiogram.some((row) => row.microorganism === name),
    );
  }, [culture, antibiogram]);

  const rows = useMemo(() => {
    const drugs = new Map<string, IDrugRow>();
    antibiogram.forEach((row) => {
      const key = drugKey(row.drug);
      if (!drugs.has(key)) {
        drugs.set(key, {
          key,
          drug: row.drug,
          inUse: isInUse(row, prescribed),
          resistantInUse: false,
          results: new Map(),
        });
      }
      const drug = drugs.get(key)!;
      drug.results.set(row.microorganism, row);
      if (drug.inUse && row.resultType === RESULT_RESISTANT) {
        drug.resistantInUse = true;
      }
    });

    return [...drugs.values()].sort(
      (a, b) => Number(b.inUse) - Number(a.inUse),
    );
  }, [antibiogram, prescribed]);

  const columns: ColumnsType<IDrugRow> = useMemo(
    () => [
      {
        title: t("infectionControl.cultures.antibiogram.drug"),
        key: "drug",
        className: "antibiogram-drug",
        render: (_, row) => (
          <>
            {row.drug}
            {row.inUse && (
              <Tag color="blue">{t("infectionControl.cultures.inUse")}</Tag>
            )}
          </>
        ),
      },
      ...organisms.map((microorganism) => ({
        title:
          microorganism ??
          t("infectionControl.cultures.antibiogram.noMicroorganism"),
        key: `organism-${organismKey(microorganism)}`,
        className: "antibiogram-cell",
        onHeaderCell: () => ({ className: "organism-column" }),
        render: (_: unknown, row: IDrugRow) => {
          const result = row.results.get(microorganism);
          if (!result) {
            return <span className="muted">—</span>;
          }

          return (
            <>
              <Tag color={resultColor(result.resultType)}>{result.result}</Tag>
              {result.mic && (
                <span className="antibiogram-mic">
                  {t("infectionControl.cultures.antibiogram.mic")} {result.mic}
                </span>
              )}
            </>
          );
        },
      })),
    ],
    [t, organisms],
  );

  return (
    <AntibiogramBox
      data-kb="infectionControl.cultureHistory.antibiogram"
      data-testid="culture-antibiogram"
    >
      <p className="antibiogram-title">
        <span>{t("infectionControl.cultures.antibiogram.title")}</span>
        {rows.some((row) => row.resistantInUse) && (
          <span className="antibiogram-warning">
            {t("infectionControl.cultures.antibiogram.resistantInUse")}
          </span>
        )}
      </p>
      <Table
        size="small"
        bordered
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: "max-content" }}
        rowClassName={(row) => (row.resistantInUse ? "resistant-in-use" : "")}
      />
    </AntibiogramBox>
  );
}
