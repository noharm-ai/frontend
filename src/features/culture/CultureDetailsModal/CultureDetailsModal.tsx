import { useTranslation } from "react-i18next";
import type { TFunction } from "react-i18next";
import {
  RobotOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import CustomIcon from "components/Icon";
import DefaultModal from "components/Modal";
import { IconGerm } from "components/Icon/svgs/IconGerm";
import {
  RESULT_RESISTANT,
  RESULT_SUSCEPTIBLE,
  isPrediction,
  resultTypeOf,
  isResistantInUse,
} from "features/culture/cultureResistance";
import { awareKey, hasAwareLevel } from "features/culture/awareLevel";
import { formatDate } from "features/culture/cultureDate";
import type { ICultureDrug, ICultureItem } from "features/culture/cultureTypes";

import { Details, DetailItem } from "./CultureDetailsModal.style";

interface ICultureDetailsProps {
  drug: ICultureDrug;
  t: TFunction;
}

interface ICultureDetailsModalProps {
  drug: ICultureDrug | null;
  onClose: () => void;
}

// the prediction, in the same wording the row groups use, or the raw text of
// one the backend could not classify
const predictionLabel = (item: ICultureItem, t: TFunction): string =>
  t(`culture.prediction.${item.prediction}`, {
    defaultValue: item.prediction,
  });

interface ICultureItemsProps {
  items: ICultureItem[];
  t: TFunction;
}

// the accent class of a prediction: R, S, or the plain prediction colour of
// one the backend could not classify
const predictionClass = (item: ICultureItem): string => {
  const type = item.predictionType ?? "";

  return [RESULT_RESISTANT, RESULT_SUSCEPTIBLE].includes(type)
    ? type
    : "unknown";
};

// the antibiogram of a released collection: the reading the drug is grouped
// by, and what the modal is opened for, so each one keeps a full card
const CultureReleasedItems = ({ items, t }: ICultureItemsProps) => (
  <div className="culture-detail-items">
    {items.map((item, index) => (
      <DetailItem
        key={item.key || index}
        className="culture-detail-item"
        $resistant={resultTypeOf(item) === RESULT_RESISTANT}
        $susceptible={resultTypeOf(item) === RESULT_SUSCEPTIBLE}
      >
        <div>
          {t("culture.microorganism")}: {item.microorganism || "-"}
        </div>
        <div>
          {t("culture.material")}: {item.material || "-"}
        </div>
        <div>
          {t("culture.collectionDate")}: {formatDate(item.collectionDate)}
        </div>
        <div>
          {t("culture.result")}: {item.result}
        </div>
        <div>
          {t("culture.releaseDate")}: {formatDate(item.releaseDate)}
        </div>
      </DetailItem>
    ))}
  </div>
);

// the pending collections are summarised: one line each, under a header that
// says outright the lab result is pending, and the prediction in its own
// column so it is never read as the result. What a prediction is, is said
// once for the whole list instead of under every collection. A pending
// collection may carry a release date of its own, and it is not a release:
// nothing came back from it to be read as one
const CulturePendingItems = ({ items, t }: ICultureItemsProps) => (
  <div className="culture-pending">
    <div className="culture-pending-title">
      <ClockCircleOutlined />{" "}
      {t("culture.pendingTitle", { count: items.length })}
    </div>
    <div className="culture-pending-list" role="table">
      <div className="culture-pending-row culture-pending-header" role="row">
        <span role="columnheader">{t("culture.material")}</span>
        <span className="pending-date-header" role="columnheader">
          {t("culture.collectionDate")}
        </span>
        <span role="columnheader">
          <RobotOutlined /> {t("culture.predictionTitle")}
        </span>
      </div>
      {items.map((item, index) => (
        <div
          key={item.key || index}
          className="culture-pending-row culture-pending-item"
          role="row"
        >
          <span className="pending-material" role="cell">
            {item.material || "-"}
            {item.microorganism && (
              <span className="pending-microorganism">
                {item.microorganism}
              </span>
            )}
          </span>
          <span className="pending-date" role="cell">
            {formatDate(item.collectionDate)}
          </span>
          <span
            className={`culture-prediction culture-prediction-${predictionClass(
              item,
            )}`}
            role="cell"
          >
            <span className="prediction-value">
              {predictionLabel(item, t)}
            </span>
            {item.probability != null && (
              <span
                className="prediction-accuracy"
                title={t("culture.predictionAccuracy")}
              >
                {" "}
                · {Math.round(item.probability * 100)}%
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
    <div className="prediction-hint">{t("culture.predictionHint")}</div>
  </div>
);

const CultureDetails = ({ drug, t }: ICultureDetailsProps) => {
  // the backend order is kept within each group: the worst released result
  // first, then the pending collections
  const released = drug.items.filter((item) => !isPrediction(item));
  const pending = drug.items.filter(isPrediction);

  return (
    <Details>
      {/* the classification of the drug itself, before the collections:
          unlike the row, the modal has room to say that it has none */}
      <div className="culture-aware-detail">
        {t("culture.awareLevel.label")}:{" "}
        <span
          className={`culture-aware-value culture-aware-value-${awareKey(
            drug.atbLevel,
          )}`}
        >
          {t(`culture.awareLevel.${awareKey(drug.atbLevel)}`)}
        </span>
        {/* what the scale means, only where the drug is on it: under a drug
            nobody classified the sentence would explain a scale it is not on */}
        {hasAwareLevel(drug.atbLevel) && (
          <div className="culture-aware-hint">
            {t("culture.awareLevel.hint")}
          </div>
        )}
      </div>
      {drug.prescribed && (
        <div className="culture-prescribed-detail">
          {isResistantInUse(drug) ? (
            <>
              <CustomIcon component={IconGerm} style={{ color: "#f44336" }} />{" "}
              {t("culture.resistantInUseHint")}
            </>
          ) : (
            <>
              <MedicineBoxOutlined /> {t("culture.prescribedHint")}
            </>
          )}
        </div>
      )}
      {released.length > 0 && <CultureReleasedItems items={released} t={t} />}
      {pending.length > 0 && <CulturePendingItems items={pending} t={t} />}
    </Details>
  );
};

// the row is too narrow to carry the antibiogram: the details open in a
// modal, which stays open while the user reads it
export function CultureDetailsModal({
  drug,
  onClose,
}: ICultureDetailsModalProps) {
  const { t } = useTranslation();

  return (
    <DefaultModal
      open={!!drug}
      title={drug?.drug}
      width="min(760px, 96vw)"
      centered
      destroyOnHidden
      footer={null}
      onCancel={onClose}
      className="culture-details-modal"
    >
      {drug && <CultureDetails drug={drug} t={t} />}
    </DefaultModal>
  );
}
