import { useTranslation } from "react-i18next";
import { Button, Empty, Spin } from "antd";
import { LeftOutlined, ReloadOutlined, RightOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";

import {
  closeCultureHistory,
  fetchCultureHistory,
  IRecentCulture,
} from "../../InfectionControlSlice";
import { CulturesBox, CulturesError } from "../InfectionControlCultures.style";
import { CultureHistoryTabs } from "./CultureHistoryTabs/CultureHistoryTabs";
import { HistoryBody, HistoryNav } from "./CultureHistoryModal.style";

interface CultureHistoryModalProps {
  admissionNumber: string;
}

/**
 * What a row of the recent cultures opens: the antibiogram of the culture
 * clicked, and a tab away every collection of the patient with its exam and
 * material, released at any time and newest first. A collection there opens
 * its own antibiogram. The history brings the antibiogram of each collection,
 * so moving between them needs no other request. The other recent cultures
 * are a click away too, in the order of the card
 */
export function CultureHistoryModal({
  admissionNumber,
}: CultureHistoryModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { culture, status, data } = useAppSelector(
    (state) => state.infectionControl.cultureHistory,
  );
  const recent = useAppSelector(
    (state) => state.infectionControl.cultures.data?.cultures ?? [],
  );

  const open = (target: IRecentCulture) => {
    dispatch(fetchCultureHistory({ admissionNumber, culture: target }));
  };

  const retry = () => {
    if (culture) {
      open(culture);
    }
  };

  // where the open culture sits among the rows of the card
  const position = culture ? recent.findIndex((c) => c.id === culture.id) : -1;
  const previous = position > 0 ? recent[position - 1] : null;
  const next =
    position >= 0 && position < recent.length - 1 ? recent[position + 1] : null;

  let content = null;
  if (status === "failed") {
    content = (
      <CulturesError>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("infectionControl.cultures.history.loadError")}
        />
        <Button icon={<ReloadOutlined />} onClick={retry}>
          {t("infectionControl.retry")}
        </Button>
      </CulturesError>
    );
  } else if (status === "succeeded" && data && culture) {
    content = (
      <CultureHistoryTabs
        // a culture opened anew starts on its own antibiogram
        key={culture.id}
        history={data}
        idCulture={culture.id}
      />
    );
  } else if (culture) {
    content = (
      <div className="history-loading">
        <Spin />
      </div>
    );
  }

  // the other recent cultures, in the order of the card
  const nav =
    position >= 0 && recent.length > 1 ? (
      <HistoryNav
        data-kb="infectionControl.cultureHistory.nav"
        data-testid="culture-nav"
      >
        <Button
          icon={<LeftOutlined />}
          disabled={!previous}
          onClick={() => previous && open(previous)}
        >
          {t("infectionControl.cultures.history.previous")}
        </Button>
        <span className="history-position">
          {t("infectionControl.cultures.history.position", {
            current: position + 1,
            total: recent.length,
          })}
        </span>
        <Button
          icon={<RightOutlined />}
          iconPlacement="end"
          disabled={!next}
          onClick={() => next && open(next)}
        >
          {t("infectionControl.cultures.history.next")}
        </Button>
      </HistoryNav>
    ) : null;

  return (
    <DefaultModal
      open={!!culture}
      width={1120}
      centered
      destroyOnHidden
      footer={nav}
      onCancel={() => dispatch(closeCultureHistory())}
    >
      <HistoryBody
        data-kb="infectionControl.cultureHistory"
        data-testid="culture-history"
      >
        <header className="history-header">
          <h2 className="history-title">{culture?.examName ?? "-"}</h2>
          {culture?.material && (
            <div className="history-material">{culture.material}</div>
          )}
        </header>
        <CulturesBox>{content}</CulturesBox>
      </HistoryBody>
    </DefaultModal>
  );
}
