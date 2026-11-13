import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Drawer } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import { formatDateTime } from "utils/date";

import { ICultureCollection } from "../../InfectionControlSlice";
import { Gram } from "../InfectionControlCultures.style";
import { LabResult } from "../LabResult/LabResult";
import { CollectionAntibiogram } from "./CollectionAntibiogram/CollectionAntibiogram";
import {
  DrawerBody,
  DrawerNav,
  DrawerTitle,
} from "./CultureCollectionDrawer.style";

interface CultureCollectionDrawerProps {
  // the collections of the list as filtered, which the drawer moves through
  collections: ICultureCollection[];
  // the open one, null while closed
  collection: ICultureCollection | null;
  // the drugs of the prescription, by drugKey
  prescribed: Set<string>;
  onSelect: (collection: ICultureCollection) => void;
  onClose: () => void;
}

/**
 * A collection whole, beside the list: each of its cultures with its release,
 * microorganisms, gram, the lab's result in full and the antibiogram. The
 * other collections of the list are a button (or an arrow key) away
 */
export function CultureCollectionDrawer({
  collections,
  collection,
  prescribed,
  onSelect,
  onClose,
}: CultureCollectionDrawerProps) {
  const { t } = useTranslation();

  const position = collection
    ? collections.findIndex((c) => c.id === collection.id)
    : -1;
  const previous = position > 0 ? collections[position - 1] : null;
  const next =
    position >= 0 && position < collections.length - 1
      ? collections[position + 1]
      : null;

  useEffect(() => {
    if (!collection) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      // the arrows of a field or a table scroll stay theirs
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) {
        return;
      }
      if (event.key === "ArrowLeft" && previous) onSelect(previous);
      if (event.key === "ArrowRight" && next) onSelect(next);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [collection, previous, next, onSelect]);

  const count = collection?.cultures.length ?? 0;

  return (
    <Drawer
      open={!!collection}
      onClose={onClose}
      placement="right"
      size="min(760px, 100vw)"
      destroyOnHidden
      title={
        collection && (
          <DrawerTitle>
            <div className="drawer-exam">{collection.examName ?? "-"}</div>
            {collection.material && (
              <div className="drawer-material">{collection.material}</div>
            )}
            <div className="drawer-collected">
              {t("infectionControl.cultures.collectionDate")}{" "}
              {formatDateTime(collection.collectionDate) ?? "-"}
            </div>
          </DrawerTitle>
        )
      }
      footer={
        collections.length > 1 && position >= 0 ? (
          <DrawerNav
            data-kb="infectionControl.cultureHistory.nav"
            data-testid="culture-nav"
          >
            <Button
              icon={<LeftOutlined />}
              disabled={!previous}
              onClick={() => previous && onSelect(previous)}
            >
              {t("infectionControl.cultures.collections.previous")}
            </Button>
            <span className="drawer-position">
              {t("infectionControl.cultures.collections.position", {
                current: position + 1,
                total: collections.length,
              })}
            </span>
            <Button
              icon={<RightOutlined />}
              iconPlacement="end"
              disabled={!next}
              onClick={() => next && onSelect(next)}
            >
              {t("infectionControl.cultures.collections.next")}
            </Button>
          </DrawerNav>
        ) : null
      }
    >
      {collection && (
        <DrawerBody
          data-kb="infectionControl.cultureHistory"
          data-testid="culture-history"
        >
          {collection.cultures.map((culture, index) => (
            <article
              key={culture.id}
              className="collection-culture"
              data-testid="collection-culture"
            >
              <header className="collection-culture-head">
                <span className="collection-culture-name">
                  {count > 1
                    ? t("infectionControl.cultures.collections.resultOf", {
                        current: index + 1,
                        total: count,
                      })
                    : t("infectionControl.cultures.result")}
                </span>
                <span className="collection-culture-release">
                  {t("infectionControl.cultures.releaseDate")}{" "}
                  {formatDateTime(culture.releaseDate) ?? "-"}
                </span>
              </header>
              <div className="collection-culture-body">
                <dl className="collection-facts">
                  <dt>{t("infectionControl.cultures.microorganism")}</dt>
                  <dd>
                    {culture.microorganisms.length ? (
                      culture.microorganisms.map((name, i) => (
                        <span key={name}>
                          {i > 0 && " · "}
                          <span className="culture-microorganism">{name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="muted">
                        {t(
                          "infectionControl.cultures.collections.noneIsolated",
                        )}
                      </span>
                    )}
                  </dd>
                  <dt>{t("infectionControl.cultures.gram")}</dt>
                  <dd>
                    {culture.gram ? (
                      <Gram data-testid="culture-gram">{culture.gram}</Gram>
                    ) : (
                      <span className="muted">-</span>
                    )}
                  </dd>
                  <dt>{t("infectionControl.cultures.result")}</dt>
                  <dd>
                    <LabResult value={culture.previousResult} />
                  </dd>
                </dl>
                {(culture.antibiogram ?? []).length > 0 ? (
                  <CollectionAntibiogram
                    culture={culture}
                    prescribed={prescribed}
                  />
                ) : (
                  culture.microorganisms.length > 0 && (
                    <span className="muted">
                      {t("infectionControl.cultures.antibiogram.empty")}
                    </span>
                  )
                )}
              </div>
            </article>
          ))}
        </DrawerBody>
      )}
    </Drawer>
  );
}
