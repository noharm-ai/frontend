import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Empty, Table, Tabs } from "antd";

import {
  ICultureHistory,
  IRecentCulture,
} from "../../../InfectionControlSlice";
import { cultureColumns } from "../../cultureColumns";
import { CultureAntibiogram } from "../CultureAntibiogram/CultureAntibiogram";

interface CultureHistoryTabsProps {
  history: ICultureHistory;
  // the culture whose row was clicked on the recent cultures
  idCulture: string;
}

/**
 * The antibiogram of the open collection, the clicked one at first, and a
 * tab away every collection of its exam and material, where another one is
 * picked
 */
export function CultureHistoryTabs({
  history,
  idCulture,
}: CultureHistoryTabsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("antibiogram");
  // the collection whose antibiogram is open: the clicked one, until another
  // is picked among the previous ones
  const [selectedId, setSelectedId] = useState(idCulture);

  const columns = useMemo(
    () => cultureColumns(t, { withExam: false, stackDates: false }),
    [t],
  );

  const selected =
    history.cultures.find((c) => c.id === selectedId) ??
    history.cultures[0] ??
    null;

  // the newest other collection the lab has released an antibiogram for:
  // the clicked one is often the newest, still waiting for the lab
  const released =
    history.cultures.find(
      (c) => c.id !== selected?.id && (c.antibiogram?.length ?? 0) > 0,
    ) ?? null;

  const select = (culture: IRecentCulture) => {
    setSelectedId(culture.id);
    setActiveTab("antibiogram");
  };

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        {
          key: "antibiogram",
          label: t("infectionControl.cultures.antibiogram.tab"),
          children: (
            <div data-kb="infectionControl.cultureHistory.antibiogram">
              {selected ? (
                <CultureAntibiogram
                  culture={selected}
                  released={released}
                  onSelect={select}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("infectionControl.cultures.history.empty")}
                />
              )}
            </div>
          ),
        },
        {
          key: "collections",
          label: t("infectionControl.cultures.history.tab", {
            count: history.cultures.length,
          }),
          children: (
            <div
              className="history-collections"
              data-kb="infectionControl.cultureHistory.collections"
              data-testid="culture-collections"
            >
              <p className="legend">
                {t("infectionControl.cultures.history.legend")}
              </p>
              <Table
                rowKey="id"
                size="small"
                columns={columns}
                dataSource={history.cultures}
                pagination={false}
                scroll={{ x: 800 }}
                rowClassName={(row) =>
                  row.id === selected?.id
                    ? "culture-row culture-current"
                    : "culture-row"
                }
                onRow={(culture) => ({
                  tabIndex: 0,
                  title: t("infectionControl.cultures.history.openAntibiogram"),
                  onClick: () => select(culture),
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      select(culture);
                    }
                  },
                })}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t("infectionControl.cultures.history.empty")}
                    />
                  ),
                }}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
