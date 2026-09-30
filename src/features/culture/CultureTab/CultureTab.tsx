import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "react-i18next";
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
import Tooltip from "components/Tooltip";
import { IconGerm } from "components/Icon/svgs/IconGerm";
import {
  RESULT_RESISTANT,
  RESULT_SUSCEPTIBLE,
  isPrediction,
  resultTypeOf,
  isResistantInUse,
} from "features/culture/cultureResistance";
import { formatDate } from "features/culture/cultureDate";
import { CultureDetailsModal } from "features/culture/CultureDetailsModal/CultureDetailsModal";
import { AwareTag } from "components/AwareTag/AwareTag";
import type { ICultureDrug } from "features/culture/cultureTypes";

import {
  Container,
  Scroll,
  Table,
  Group,
  Item,
  EmptyDescription,
  Predictions,
  PredictionsToggle,
  NoReleased,
} from "./CultureTab.style";

interface ICultureGroup {
  key: string;
  drugs: ICultureDrug[];
}

interface ICultureListItemProps {
  drug: ICultureDrug;
  onOpenDetails: (drug: ICultureDrug) => void;
  t: TFunction;
}

interface ICultureGroupProps {
  group: ICultureGroup;
  onOpenDetails: (drug: ICultureDrug) => void;
  t: TFunction;
}

interface ICultureTableProps {
  groups: ICultureGroup[];
  onOpenDetails: (drug: ICultureDrug) => void;
  t: TFunction;
}

interface ICultureTabProps {
  cultures?: ICultureDrug[] | null;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

const GROUP_RESISTANT_IN_USE = "resistantInUse";
const GROUP_RESISTANT = "resistant";
const GROUP_SUSCEPTIBLE_IN_USE = "susceptibleInUse";
const GROUP_SUSCEPTIBLE = "susceptible";
// a pending collection is read through its prediction, which is split the
// same way the released results are: the header says what was predicted
const GROUP_PREDICTION_RESISTANT = "predictionResistant";
const GROUP_PREDICTION_SUSCEPTIBLE = "predictionSusceptible";

// drug, AWaRe, prescribed, age and the details chevron
const COLUMN_COUNT = 5;

const PREDICTION_GROUPS = [
  GROUP_PREDICTION_RESISTANT,
  GROUP_PREDICTION_SUSCEPTIBLE,
];

// how old the result is, in the shortest form that still reads: "45m", "6h",
// "3d". The unit letters are the same in both languages, so they are not
// translated
const formatAge = (date: string): string => {
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

const byDrug = (a: ICultureDrug, b: ICultureDrug) =>
  `${a.drug}`.localeCompare(`${b.drug}`);

const buildGroups = (cultures: ICultureDrug[]): ICultureGroup[] => {
  const resistantInUse: ICultureDrug[] = [];
  const resistant: ICultureDrug[] = [];
  const susceptibleInUse: ICultureDrug[] = [];
  const susceptible: ICultureDrug[] = [];
  const predictedResistant: ICultureDrug[] = [];
  const predictedSusceptible: ICultureDrug[] = [];

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
    } else if (drug.prescribed) {
      // what the patient is on reads before what they are not, on the
      // susceptible side too: it is the answer to whether the current
      // antimicrobial covers the culture
      susceptibleInUse.push(drug);
    } else {
      // a result the backend could not read stays here, spelled out by
      // resultDetail instead of being guessed into resistance
      susceptible.push(drug);
    }
  });

  return [
    { key: GROUP_RESISTANT_IN_USE, drugs: resistantInUse.sort(byDrug) },
    { key: GROUP_RESISTANT, drugs: resistant.sort(byDrug) },
    { key: GROUP_SUSCEPTIBLE_IN_USE, drugs: susceptibleInUse.sort(byDrug) },
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

const CultureListItem = ({ drug, onOpenDetails, t }: ICultureListItemProps) => {
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
    ? [RESULT_RESISTANT, RESULT_SUSCEPTIBLE].includes(
        current.predictionType ?? "",
      )
      ? null
      : current.prediction
    : current.resultDetail;

  // the row carries only the reading of the list: the antibiogram itself
  // opens in a modal, which stays open while the user reads it
  const openDetails = () => onOpenDetails(drug);

  return (
    <Item
      className={`culture-item${inUse ? " culture-item-in-use" : ""}`}
      $prediction={prediction}
      $resistant={resultTypeOf(current) === RESULT_RESISTANT}
      $susceptible={resultTypeOf(current) === RESULT_SUSCEPTIBLE}
      $inUse={inUse}
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetails();
        }
      }}
    >
      <td className="cell-drug">
        <div className="drug">
          <div className="name">{drug.drug}</div>
          {/* the robot marks a prediction on the row itself: the group header
              scrolls away with the list, and a pending collection must never
              be read as a lab result */}
          {(prediction || marker) && (
            <div className="marker">
              {prediction && <RobotOutlined />}
              {marker && <span>{marker}</span>}
            </div>
          )}
        </div>
      </td>
      {/* how aggressive the drug is: the reading of an antibiogram is which
          drug to reach for, and the AWaRe group is part of that answer */}
      <td className="cell-aware">
        <AwareTag level={drug.atbLevel} />
      </td>
      <td className="cell-prescribed">
        {drug.prescribed && (
          <Tooltip title={t("culture.prescribedHint")}>
            <span className={`prescribed${inUse ? " in-use" : ""}`}>
              <MedicineBoxOutlined />
            </span>
          </Tooltip>
        )}
      </td>
      {/* how long ago the antibiogram was released. A pending collection may
          carry a release date of its own, but it has no antibiogram to age:
          only a released result is read here, and the collection date is not
          the same reading */}
      <td className="cell-age">
        {!prediction && current.releaseDate && (
          <Tooltip
            title={t("culture.releaseAgeHint", {
              date: formatDate(current.releaseDate),
            })}
          >
            <span className="age culture-age">
              <ClockCircleOutlined />
              <span>
                {t("culture.releaseAge", {
                  age: formatAge(current.releaseDate),
                })}
              </span>
            </span>
          </Tooltip>
        )}
      </td>
      {/* the row opens the details, and the hover shadow alone never said so */}
      <td className="cell-hint">
        <span className="details-hint">
          <RightOutlined />
        </span>
      </td>
    </Item>
  );
};

// a group is a tbody of its own: the header row states the result, predicted
// or released, and the rows below it only what the header does not cover
const CultureGroup = ({ group, onOpenDetails, t }: ICultureGroupProps) => (
  <Group className={`culture-group culture-group-${group.key}`}>
    <tr>
      <th className="group-title" colSpan={COLUMN_COUNT} scope="rowgroup">
        <div>
          {PREDICTION_GROUPS.includes(group.key) && <RobotOutlined />}
          {group.key === GROUP_RESISTANT_IN_USE && (
            <CustomIcon component={IconGerm} />
          )}
          <span>{t(`culture.groups.${group.key}`)}</span>
          <span className="count">({group.drugs.length})</span>
        </div>
      </th>
    </tr>
    {group.drugs.map((drug) => (
      <CultureListItem
        drug={drug}
        key={drug.drug}
        onOpenDetails={onOpenDetails}
        t={t}
      />
    ))}
  </Group>
);

// every drug in one table, one row each, in the order the groups are read:
// resistant in use, resistant, susceptible in use, susceptible
const CultureTable = ({ groups, onOpenDetails, t }: ICultureTableProps) => (
  <Table className="culture-table">
    <thead>
      <tr>
        <th className="cell-drug">{t("culture.columns.drug")}</th>
        <th className="cell-aware">{t("culture.columns.aware")}</th>
        <th className="cell-prescribed">{t("culture.columns.prescribed")}</th>
        <th className="cell-age">{t("culture.columns.age")}</th>
        <th className="cell-hint" aria-hidden />
      </tr>
    </thead>
    {groups.map((group) => (
      <CultureGroup
        key={group.key}
        group={group}
        onOpenDetails={onOpenDetails}
        t={t}
      />
    ))}
  </Table>
);

export function CultureTab({
  cultures,
  loading,
  error,
  onRetry,
}: ICultureTabProps) {
  const { t } = useTranslation();
  const [details, setDetails] = useState<ICultureDrug | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);

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
        {releasedGroups.length > 0 && (
          <CultureTable
            groups={releasedGroups}
            onOpenDetails={setDetails}
            t={t}
          />
        )}

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
            {/* conditional render, not a collapse: the table header is
                sticky against the scroll area and an animated wrapper with
                overflow of its own would drop it */}
            {showPredictions && (
              <CultureTable
                groups={predictionGroups}
                onOpenDetails={setDetails}
                t={t}
              />
            )}
          </Predictions>
        )}
      </Scroll>

      <CultureDetailsModal drug={details} onClose={() => setDetails(null)} />
    </Container>
  );
}
