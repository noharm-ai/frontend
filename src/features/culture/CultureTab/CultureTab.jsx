import React from "react";
import { useTranslation } from "react-i18next";
import { Flex } from "antd";
import { RobotOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import moment from "moment";

import Popover from "components/PopoverStyled";
import Empty from "components/Empty";
import CustomIcon from "components/Icon";
import { IconGerm } from "components/Icon/svgs/IconGerm";
import {
  RESULT_RESISTANT,
  RESULT_SUSCEPTIBLE,
  isPrediction,
  resultTypeOf,
  isResistantInUse,
} from "features/culture/cultureResistance";

import {
  Container,
  Scroll,
  Group,
  List,
  Item,
  EmptyDescription,
} from "./CultureTab.style";

const GROUP_RESISTANT_IN_USE = "resistantInUse";
const GROUP_RESISTANT = "resistant";
const GROUP_SUSCEPTIBLE = "susceptible";
const GROUP_PREDICTION = "prediction";

const formatDate = (date) => (date ? moment(date).format("DD/MM/YYYY") : "-");

const byDrug = (a, b) => `${a.drug}`.localeCompare(`${b.drug}`);

// inside the prediction group a predicted resistance is the one worth reading
// first, the group header cannot say it for both
const byPrediction = (a, b) => {
  const rank = (drug) =>
    resultTypeOf(drug.items[0]) === RESULT_RESISTANT ? 0 : 1;

  return rank(a) - rank(b) || byDrug(a, b);
};

const buildGroups = (cultures) => {
  const resistantInUse = [];
  const resistant = [];
  const susceptible = [];
  const predictions = [];

  cultures.forEach((drug) => {
    // the item that represents the drug: the backend puts the released
    // results first (culture_service._group_by_drug), so a drug that has an
    // antibiogram is never grouped by a prediction of a pending collection
    const [current] = drug.items;

    if (isResistantInUse(drug)) {
      // its own group, first: a resistance the patient is being given right
      // now is a different reading from a resistance on a drug nobody
      // prescribed, and the group header carries it instead of the row
      resistantInUse.push(drug);
    } else if (isPrediction(current)) {
      predictions.push(drug);
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
    { key: GROUP_PREDICTION, drugs: predictions.sort(byPrediction) },
  ].filter((group) => group.drugs.length > 0);
};

const CultureResult = ({ item, t }) => {
  if (!isPrediction(item)) {
    return item.result;
  }

  return t(`culture.prediction.${item.prediction}`, {
    defaultValue: item.prediction,
  });
};

const CultureDetails = ({ drug, t }) => (
  <>
    {drug.prescribed && (
      <div
        className="culture-prescribed-detail"
        style={{ marginBottom: "8px", fontWeight: 500 }}
      >
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
    {drug.items.map((item, index) => (
      <div key={item.key || index} style={{ marginTop: index > 0 ? "8px" : 0 }}>
        <div>
          {t("culture.microorganism")}: {item.microorganism || "-"}
        </div>
        <div>
          {t("culture.material")}: {item.material || "-"}
        </div>
        <div>
          {t("culture.result")}: <CultureResult item={item} t={t} />
          {isPrediction(item) && (
            <>
              {" "}
              ({t("culture.predictionAccuracy")}:{" "}
              {Math.round(item.probability * 100)}%)
            </>
          )}
        </div>
        <div>
          {t("culture.collectionDate")}: {formatDate(item.collectionDate)}
        </div>
      </div>
    ))}
  </>
);

const CultureListItem = ({ drug, t }) => {
  const [current] = drug.items;
  const prediction = isPrediction(current);
  // a resistant drug the patient is actually on: the row itself has to shout,
  // a label would only push the drug name out of a cell this narrow
  const inUse = isResistantInUse(drug);

  // the group header already states the result, so the item only spells out
  // what the header does not cover: the predicted S/R and any result whose
  // wording says more than the group itself
  const marker = prediction ? current.prediction : current.resultDetail;

  return (
    <Popover
      content={<CultureDetails drug={drug} t={t} />}
      title={drug.drug}
      mouseLeaveDelay={0}
      mouseEnterDelay={0.5}
    >
      <Item
        className={`culture-item${inUse ? " culture-item-in-use" : ""}`}
        $prediction={prediction}
        $resistant={resultTypeOf(current) === RESULT_RESISTANT}
        $susceptible={resultTypeOf(current) === RESULT_SUSCEPTIBLE}
        $inUse={inUse}
      >
        <div className="name">{drug.drug}</div>
        {/* inside its own group every row is in use, so the marker is only
            needed where a prescribed drug sits among drugs that are not */}
        {drug.prescribed && !inUse && (
          <div className="prescribed">
            <MedicineBoxOutlined />
          </div>
        )}
        {marker && (
          <div className="marker">
            {prediction && <RobotOutlined />}
            <span>{marker}</span>
          </div>
        )}
      </Item>
    </Popover>
  );
};

export function CultureTab({ cultures }) {
  const { t } = useTranslation();

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

  return (
    <Container>
      <Scroll>
        {groups.map((group) => (
          <Group
            key={group.key}
            className={`culture-group culture-group-${group.key}`}
          >
            <div className="group-title">
              {group.key === GROUP_PREDICTION && <RobotOutlined />}
              {group.key === GROUP_RESISTANT_IN_USE && (
                <CustomIcon component={IconGerm} />
              )}
              <span>{t(`culture.groups.${group.key}`)}</span>
              <span className="count">({group.drugs.length})</span>
            </div>
            <List>
              {group.drugs.map((drug) => (
                <CultureListItem drug={drug} key={drug.drug} t={t} />
              ))}
            </List>
          </Group>
        ))}
      </Scroll>
    </Container>
  );
}
