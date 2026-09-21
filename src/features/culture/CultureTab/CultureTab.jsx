import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Flex, Spin } from "antd";
import {
  RobotOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";
import moment from "moment";

import Button from "components/Button";
import Empty from "components/Empty";
import CustomIcon from "components/Icon";
import DefaultModal from "components/Modal";
import Tooltip from "components/Tooltip";
import { IconGerm } from "components/Icon/svgs/IconGerm";
import {
  RESULT_RESISTANT,
  RESULT_SUSCEPTIBLE,
  isPrediction,
  resultTypeOf,
  isResistantInUse,
} from "features/culture/cultureResistance";
import { awareKey, hasAwareLevel } from "features/culture/awareLevel";
import { AwareTag } from "components/AwareTag/AwareTag";

import {
  Container,
  Scroll,
  Group,
  List,
  Item,
  Details,
  DetailItem,
  EmptyDescription,
  Predictions,
  PredictionsToggle,
  NoReleased,
} from "./CultureTab.style";

const GROUP_RESISTANT_IN_USE = "resistantInUse";
const GROUP_RESISTANT = "resistant";
const GROUP_SUSCEPTIBLE = "susceptible";
// a pending collection is read through its prediction, which is split the
// same way the released results are: the header says what was predicted
const GROUP_PREDICTION_RESISTANT = "predictionResistant";
const GROUP_PREDICTION_SUSCEPTIBLE = "predictionSusceptible";

const PREDICTION_GROUPS = [
  GROUP_PREDICTION_RESISTANT,
  GROUP_PREDICTION_SUSCEPTIBLE,
];

// the modal is where the dates are actually read, and the hour of a release
// is part of the reading: two collections of the same day are told apart by it
const formatDate = (date) =>
  date ? moment(date).format("DD/MM/YYYY HH:mm") : "-";

// how old the result is, in the shortest form that still reads: "45m", "6h",
// "3d". The unit letters are the same in both languages, so they are not
// translated
const formatAge = (date) => {
  const minutes = moment().diff(moment(date), "minutes");

  if (minutes < 60) {
    return `${Math.max(minutes, 1)}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  // nothing in the backend bounds how old a release can be (the retention is
  // a DynamoDB TTL, and the query filters by nothing), so the badge is capped:
  // a four-digit day count would eat the drug name next to it
  const days = Math.floor(hours / 24);

  return days > 99 ? "99d+" : `${days}d`;
};

const byDrug = (a, b) => `${a.drug}`.localeCompare(`${b.drug}`);

const buildGroups = (cultures) => {
  const resistantInUse = [];
  const resistant = [];
  const susceptible = [];
  const predictedResistant = [];
  const predictedSusceptible = [];

  cultures.forEach((drug) => {
    // the item that represents the drug, chosen by the backend (see
    // currentItemOf): its worst released result, never a prediction of a
    // pending collection while an antibiogram exists
    const [current] = drug.items;

    if (isResistantInUse(drug)) {
      // its own group, first: a resistance the patient is being given right
      // now is a different reading from a resistance on a drug nobody
      // prescribed, and the group header carries it instead of the row
      resistantInUse.push(drug);
    } else if (isPrediction(current)) {
      // the predictions are split like the results: a predicted resistance is
      // the one worth reading first, and a prediction the backend could not
      // classify is not guessed into it
      if (resultTypeOf(current) === RESULT_RESISTANT) {
        predictedResistant.push(drug);
      } else {
        predictedSusceptible.push(drug);
      }
    } else if (resultTypeOf(current) === RESULT_RESISTANT) {
      resistant.push(drug);
    } else {
      // a result the backend could not read stays here, spelled out by
      // resultDetail instead of being guessed into resistance
      susceptible.push(drug);
    }
  });

  return [
    { key: GROUP_RESISTANT_IN_USE, drugs: resistantInUse.sort(byDrug) },
    { key: GROUP_RESISTANT, drugs: resistant.sort(byDrug) },
    { key: GROUP_SUSCEPTIBLE, drugs: susceptible.sort(byDrug) },
    // the predictions stay below every released result: a pending collection
    // is not a lab result, whatever it predicts
    {
      key: GROUP_PREDICTION_RESISTANT,
      drugs: predictedResistant.sort(byDrug),
    },
    {
      key: GROUP_PREDICTION_SUSCEPTIBLE,
      drugs: predictedSusceptible.sort(byDrug),
    },
  ].filter((group) => group.drugs.length > 0);
};

// the prediction, in the same wording the row groups use, or the raw text of
// one the backend could not classify
const predictionLabel = (item, t) =>
  t(`culture.prediction.${item.prediction}`, {
    defaultValue: item.prediction,
  });

// the antibiogram of a released collection: the reading the drug is grouped by
const CultureReleasedResult = ({ item, t }) => (
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
const CulturePendingResult = ({ item, t }) => (
  <>
    <div className="culture-result-pending">
      {t("culture.result")}:{" "}
      <span className="pending">
        <ClockCircleOutlined /> {t("culture.resultPending")}
      </span>
    </div>
    <div
      className={`culture-prediction culture-prediction-${
        [RESULT_RESISTANT, RESULT_SUSCEPTIBLE].includes(item.predictionType)
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

const CultureDetails = ({ drug, t }) => (
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

const CultureListItem = ({ drug, onOpenDetails, t }) => {
  const [current] = drug.items;
  const prediction = isPrediction(current);
  // a resistant drug the patient is actually on: the row itself has to shout,
  // a label would only push the drug name out of a cell this narrow
  const inUse = isResistantInUse(drug);

  // the group header already states the result, predicted or released, so
  // the item only spells out what the header does not cover: any wording that
  // says more than the group itself, and a prediction the backend could not
  // classify, which the header does not read for it
  const marker = prediction
    ? [RESULT_RESISTANT, RESULT_SUSCEPTIBLE].includes(current.predictionType)
      ? null
      : current.prediction
    : current.resultDetail;

  // the row is too narrow to carry the antibiogram: the details open in a
  // modal, which stays open while the user reads it
  const openDetails = () => onOpenDetails(drug);

  return (
    <Item
      className={`culture-item${inUse ? " culture-item-in-use" : ""}`}
      $prediction={prediction}
      $resistant={resultTypeOf(current) === RESULT_RESISTANT}
      $susceptible={resultTypeOf(current) === RESULT_SUSCEPTIBLE}
      $inUse={inUse}
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetails();
        }
      }}
    >
      <div className="name">{drug.drug}</div>
      {/* how aggressive the drug is, next to its name: the reading of an
          antibiogram is which drug to reach for, and the AWaRe group is part
          of that answer */}
      <AwareTag level={drug.atbLevel} />
      {/* inside its own group every row is in use, so the marker is only
          needed where a prescribed drug sits among drugs that are not */}
      {drug.prescribed && !inUse && (
        <div className="prescribed">
          <MedicineBoxOutlined />
        </div>
      )}
      {/* the robot marks a prediction on the row itself: the sticky header
          scrolls away with the list, and a pending collection must never be
          read as a lab result */}
      {(prediction || marker) && (
        <div className="marker">
          {prediction && <RobotOutlined />}
          {marker && <span>{marker}</span>}
        </div>
      )}
      {/* how long ago the antibiogram was released. A pending collection may
          carry a release date of its own, but it has no antibiogram to age:
          only a released result is read here, and the collection date is not
          the same reading */}
      {!prediction && current.releaseDate && (
        <Tooltip
          title={t("culture.releaseAgeHint", {
            date: formatDate(current.releaseDate),
          })}
        >
          {/* the row has no space to spell it out, so the clock and the "há"
              carry what the bare number could not say */}
          <div className="age culture-age">
            <ClockCircleOutlined />
            <span>
              {t("culture.releaseAge", { age: formatAge(current.releaseDate) })}
            </span>
          </div>
        </Tooltip>
      )}
      {/* the row opens the details, and the hover shadow alone never said so */}
      <div className="details-hint">
        <RightOutlined />
      </div>
    </Item>
  );
};

const CultureGroup = ({ group, onOpenDetails, t }) => (
  <Group className={`culture-group culture-group-${group.key}`}>
    <div className="group-title">
      {PREDICTION_GROUPS.includes(group.key) && <RobotOutlined />}
      {group.key === GROUP_RESISTANT_IN_USE && (
        <CustomIcon component={IconGerm} />
      )}
      <span>{t(`culture.groups.${group.key}`)}</span>
      <span className="count">({group.drugs.length})</span>
    </div>
    <List>
      {group.drugs.map((drug) => (
        <CultureListItem
          drug={drug}
          key={drug.drug}
          onOpenDetails={onOpenDetails}
          t={t}
        />
      ))}
    </List>
  </Group>
);

export function CultureTab({ cultures, loading, error, onRetry }) {
  const { t } = useTranslation();
  const [details, setDetails] = useState(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const scrollRef = useRef(null);
  const predictionsRef = useRef(null);

  // the released results alone can fill the scroll area, so the groups the
  // fold opens are below it: without this the click looks like it did nothing
  useEffect(() => {
    if (!showPredictions) {
      return;
    }

    const scroll = scrollRef.current;
    const predictions = predictionsRef.current;

    if (!scroll || !predictions) {
      return;
    }

    // only the list scrolls: scrollIntoView would take the screening page
    // with it
    scroll.scrollTop +=
      predictions.getBoundingClientRect().top -
      scroll.getBoundingClientRect().top;
  }, [showPredictions]);

  // the cultures are fetched when the tab is opened (CultureSlice), so the
  // first open waits for them; a reload of a list already shown keeps the
  // list in place instead of flashing it away
  if (loading && (!cultures || cultures.length === 0)) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ width: "100%" }}
        className="culture-loading"
      >
        <Spin />
      </Flex>
    );
  }

  if (error) {
    // "no cultures" would be a statement about the patient, and this is not
    // one: the card says the load failed and offers to try again
    return (
      <Flex align="center" justify="center" style={{ width: "100%" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="culture-error"
          description={
            <EmptyDescription>
              <div className="culture-empty-title">
                {t("culture.loadError")}
              </div>
              {onRetry && (
                <Button type="link" onClick={onRetry}>
                  {t("culture.retry")}
                </Button>
              )}
            </EmptyDescription>
          }
        />
      </Flex>
    );
  }

  if (!cultures || cultures.length === 0) {
    // the card only carries the recent cultures, so "none" is a statement
    // about the window and not about the patient: the footer link to the full
    // report is what answers the older results, and it has to be said here
    return (
      <Flex align="center" justify="center" style={{ width: "100%" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <EmptyDescription>
              <div className="culture-empty-title">{t("culture.empty")}</div>
              <div className="culture-empty-hint">{t("culture.emptyHint")}</div>
            </EmptyDescription>
          }
        />
      </Flex>
    );
  }

  const groups = buildGroups(cultures);
  // the predictions are kept out of the released results and folded away: a
  // pending collection is not a lab result, and when the patient has no
  // released result at all an open prediction list was read as if it were one
  const releasedGroups = groups.filter(
    (group) => !PREDICTION_GROUPS.includes(group.key),
  );
  const predictionGroups = groups.filter((group) =>
    PREDICTION_GROUPS.includes(group.key),
  );
  const predictionCount = predictionGroups.reduce(
    (total, group) => total + group.drugs.length,
    0,
  );
  // what the fold hides: a predicted resistance is the one reason to open it,
  // so the closed toggle has to say how many there are
  const predictedResistantCount =
    predictionGroups.find((group) => group.key === GROUP_PREDICTION_RESISTANT)
      ?.drugs.length ?? 0;

  return (
    <Container>
      <Scroll ref={scrollRef}>
        {releasedGroups.map((group) => (
          <CultureGroup
            key={group.key}
            group={group}
            onOpenDetails={setDetails}
            t={t}
          />
        ))}

        {predictionCount > 0 && (
          <Predictions
            ref={predictionsRef}
            className="culture-predictions"
            $standalone={releasedGroups.length === 0}
          >
            {/* nothing came back from the lab: that is the answer the card
                owes the user, and it has to be given before the prediction
                that stands in for it */}
            {releasedGroups.length === 0 && (
              <NoReleased className="culture-no-released">
                <div className="culture-no-released-title">
                  {t("culture.noReleased")}
                </div>
                <div className="culture-no-released-hint">
                  {t("culture.noReleasedHint")}
                </div>
              </NoReleased>
            )}
            <PredictionsToggle
              type="button"
              className="culture-predictions-toggle"
              aria-expanded={showPredictions}
              onClick={() => setShowPredictions((open) => !open)}
            >
              <RobotOutlined />
              <span className="toggle-label">
                {t(
                  showPredictions
                    ? "culture.predictionsHide"
                    : "culture.predictionsShow",
                  { count: predictionCount },
                )}
              </span>
              {/* the count of predicted resistances is what the fold would
                  otherwise hide: it is stated while the list is closed */}
              {!showPredictions && predictedResistantCount > 0 && (
                <span className="toggle-alert">
                  {t("culture.predictionsResistant", {
                    count: predictedResistantCount,
                  })}
                </span>
              )}
              <DownOutlined
                className="toggle-chevron"
                rotate={showPredictions ? 180 : 0}
              />
            </PredictionsToggle>
            {/* conditional render, not a collapse: the group headers are
                sticky against the scroll area and an animated wrapper with
                overflow of its own would drop them */}
            {showPredictions &&
              predictionGroups.map((group) => (
                <CultureGroup
                  key={group.key}
                  group={group}
                  onOpenDetails={setDetails}
                  t={t}
                />
              ))}
          </Predictions>
        )}
      </Scroll>

      <DefaultModal
        open={!!details}
        title={details?.drug}
        width="min(760px, 96vw)"
        centered
        destroyOnHidden
        footer={null}
        onCancel={() => setDetails(null)}
        className="culture-details-modal"
      >
        {details && <CultureDetails drug={details} t={t} />}
      </DefaultModal>
    </Container>
  );
}
