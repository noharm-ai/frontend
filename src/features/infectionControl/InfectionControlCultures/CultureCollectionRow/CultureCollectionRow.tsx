import { useTranslation } from "react-i18next";
import { Button, Tag, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { formatDate, formatDateTime } from "utils/date";
import { RESULT_RESISTANT } from "features/culture/cultureResistance";

import { ICultureCollection } from "../../InfectionControlSlice";
import {
  countResults,
  hasIsolate,
  hasResistantInUse,
  ICollectionOrganism,
  inUseFirst,
  isInUse,
  organismsOf,
  resultColor,
} from "../cultureCollections";
import { Gram } from "../InfectionControlCultures.style";
import { LabResult } from "../LabResult/LabResult";
import { CollectionRow } from "./CultureCollectionRow.style";

interface CultureCollectionRowProps {
  collection: ICultureCollection;
  // the drugs of the prescription, by drugKey: empty without the cultures by
  // drug
  prescribed: Set<string>;
  onOpen: (collection: ICultureCollection) => void;
}

/**
 * A microorganism of the collection and its antibiogram at a glance: how many
 * drugs it resists and is susceptible to, the drugs of the prescription with
 * their result, and the other drugs it resists
 */
function OrganismSummary({
  organism,
  prescribed,
}: {
  organism: ICollectionOrganism;
  prescribed: Set<string>;
}) {
  const { t } = useTranslation();
  const name =
    organism.microorganism ??
    t("infectionControl.cultures.antibiogram.noMicroorganism");

  if (!organism.results.length) {
    return (
      <div className="organism" data-testid="collection-organism">
        <span className="organism-name" title={name}>
          {name}
        </span>
        <span className="collection-text muted">
          {t("infectionControl.cultures.collections.noAntibiogram")}
        </span>
      </div>
    );
  }

  const counts = countResults(organism.results);
  const total = organism.results.length;
  const share = (count: number) => `${(count / total) * 100}%`;
  const ordered = inUseFirst(organism.results, prescribed);
  const inUse = ordered.filter((row) => isInUse(row, prescribed));
  const resistant = ordered.filter(
    (row) => row.resultType === RESULT_RESISTANT && !isInUse(row, prescribed),
  );

  return (
    <div className="organism" data-testid="collection-organism">
      <span className="organism-name" title={name}>
        {name}
      </span>
      <span
        className="organism-counts"
        title={t("infectionControl.cultures.collections.tested", {
          count: total,
        })}
      >
        <span className="organism-bar" aria-hidden="true">
          <span
            className="resistant"
            style={{ width: share(counts.resistant) }}
          />
          <span className="other" style={{ width: share(counts.other) }} />
          <span
            className="susceptible"
            style={{ width: share(counts.susceptible) }}
          />
        </span>
        <span data-testid="organism-counts">
          {[
            counts.resistant > 0 && (
              <span key="r" className="resistant">
                {t("infectionControl.cultures.collections.resistantCount", {
                  count: counts.resistant,
                })}
              </span>
            ),
            counts.other > 0 && (
              <span key="o" className="other">
                {t("infectionControl.cultures.collections.otherCount", {
                  count: counts.other,
                })}
              </span>
            ),
            counts.susceptible > 0 && (
              <span key="s" className="susceptible">
                {t("infectionControl.cultures.collections.susceptibleCount", {
                  count: counts.susceptible,
                })}
              </span>
            ),
          ]
            .filter(Boolean)
            .flatMap((item, index) => (index ? [" · ", item] : [item]))}
        </span>
      </span>
      <span className="organism-drugs">
        {inUse.map((row) => (
          <span
            key={row.drug}
            className="in-use"
            data-testid="organism-in-use"
            title={row.result}
          >
            <Tag color={resultColor(row.resultType)}>
              {row.drug} {row.resultType}
            </Tag>
            <Tag color="blue">{t("infectionControl.cultures.inUse")}</Tag>
          </span>
        ))}
        {resistant.length > 0 && (
          <span data-testid="organism-resistant">
            <span className="label">
              {t("infectionControl.cultures.collections.resistantTo")}
            </span>{" "}
            {resistant.map((row) => row.drug).join(", ")}
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * One collection of the list: when it was collected, the exam and material,
 * and what the lab found, each microorganism with its antibiogram summed up.
 * A collection with no microorganism shows the lab's own words (no growth,
 * waiting for the lab...), cut at two lines. The row, or its button, opens
 * the collection whole
 */
export function CultureCollectionRow({
  collection,
  prescribed,
  onOpen,
}: CultureCollectionRowProps) {
  const { t } = useTranslation();
  const organisms = organismsOf(collection);
  const isolated = hasIsolate(collection);
  const resistantInUse = hasResistantInUse(collection, prescribed);
  const count = collection.cultures.length;
  const last = collection.cultures[count - 1];
  const gram = [...collection.cultures].reverse().find((c) => c.gram)?.gram;

  return (
    <CollectionRow
      className={resistantInUse ? "resistant-in-use" : undefined}
      data-testid="culture-collection"
      onClick={() => onOpen(collection)}
    >
      <div className="collection-time">
        <span
          className={`status-dot${isolated ? " isolated" : ""}`}
          title={t(
            isolated
              ? "infectionControl.cultures.collections.isolated"
              : "infectionControl.cultures.collections.notIsolated",
          )}
        />
        {formatDate(collection.collectionDate, "HH:mm") ?? "-"}
      </div>

      <div className="collection-exam">
        <span className="culture-exam">{collection.examName ?? "-"}</span>
        {collection.material && (
          <span className="culture-material">{collection.material}</span>
        )}
        <span className="collection-records">
          {count > 1
            ? t("infectionControl.cultures.collections.results", { count })
            : t("infectionControl.cultures.collections.released", {
                date: formatDateTime(last?.releaseDate) ?? "-",
              })}
        </span>
      </div>

      <div className="collection-findings">
        {organisms.length ? (
          organisms.map((organism) => (
            <OrganismSummary
              key={organism.microorganism ?? ""}
              organism={organism}
              prescribed={prescribed}
            />
          ))
        ) : (
          <>
            {gram && (
              <div className="collection-text">
                <Gram className="clamp" data-testid="culture-gram" title={gram}>
                  {gram}
                </Gram>
              </div>
            )}
            <div className="collection-text clamp">
              <LabResult value={last?.previousResult ?? null} />
            </div>
          </>
        )}
      </div>

      <div className="collection-action">
        <Tooltip title={t("infectionControl.cultures.collections.details")}>
          <Button
            size="small"
            icon={<SearchOutlined />}
            aria-label={t("infectionControl.cultures.collections.details")}
            onClick={(event) => {
              event.stopPropagation();
              onOpen(collection);
            }}
          />
        </Tooltip>
      </div>
    </CollectionRow>
  );
}
