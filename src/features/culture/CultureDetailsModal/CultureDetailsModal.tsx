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

interface ICultureItemProps {
  item: ICultureItem;
  t: TFunction;
}

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

// the antibiogram of a released collection: the reading the drug is grouped by
const CultureReleasedResult = ({ item, t }: ICultureItemProps) => (
  <>
    <div>
      {t("culture.result")}: {item.result}
    </div>
    <div>
      {t("culture.releaseDate")}: {formatDate(item.releaseDate)}
    </div>
  </>
);

// a pending collection has no result to state, and the modal is where that
// has to be said outright: the prediction is set apart from the result line
// it stands in for, so that it is never read as the lab result
const CulturePendingResult = ({ item, t }: ICultureItemProps) => (
  <>
    <div className="culture-result-pending">
      {t("culture.result")}:{" "}
      <span className="pending">
        <ClockCircleOutlined /> {t("culture.resultPending")}
      </span>
    </div>
    <div
      className={`culture-prediction culture-prediction-${
        [RESULT_RESISTANT, RESULT_SUSCEPTIBLE].includes(
          item.predictionType ?? "",
        )
          ? item.predictionType
          : "unknown"
      }`}
    >
      <div className="prediction-title">
        <RobotOutlined /> {t("culture.predictionTitle")}
      </div>
      <div className="prediction-value">
        {predictionLabel(item, t)}
        {item.probability != null && (
          <span className="prediction-accuracy">
            {" "}
            · {t("culture.predictionAccuracy")}:{" "}
            {Math.round(item.probability * 100)}%
          </span>
        )}
      </div>
      <div className="prediction-hint">{t("culture.predictionHint")}</div>
    </div>
  </>
);

const CultureDetails = ({ drug, t }: ICultureDetailsProps) => (
  <Details>
    {/* the classification of the drug itself, before the collections: unlike
        the row, the modal has room to say that it has none */}
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
        <div className="culture-aware-hint">{t("culture.awareLevel.hint")}</div>
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
    {/* one block per collection, in the order the backend reads them: the
        worst result first (the one the drug is grouped by), then the pending
        collections. A released antibiogram and a pending collection must not
        run together. They are laid out in two columns, so a drug with several
        collections is read without scrolling the modal */}
    <div className="culture-detail-items">
      {drug.items.map((item, index) => (
        <DetailItem
          key={item.key || index}
          className="culture-detail-item"
          $prediction={isPrediction(item)}
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
          {/* a pending collection may carry a release date of its own, and it
              is not a release: nothing came back from it to be read as one */}
          {isPrediction(item) ? (
            <CulturePendingResult item={item} t={t} />
          ) : (
            <CultureReleasedResult item={item} t={t} />
          )}
        </DetailItem>
      ))}
    </div>
  </Details>
);

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
