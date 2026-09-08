import React from "react";
import { useTranslation } from "react-i18next";
import { Flex } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import moment from "moment";

import Popover from "components/PopoverStyled";
import Empty from "components/Empty";

import { List, Item } from "./CultureTab.style";

const isResistant = (result) =>
  `${result}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .startsWith("resist");

// a pending culture is shown through the prediction, which must never be
// presented as if it were the lab result
const isPrediction = (item) => !item.result;

const isAlert = (item) =>
  isPrediction(item) ? item.prediction === "R" : isResistant(item.result);

const formatDate = (date) => (date ? moment(date).format("DD/MM/YYYY") : "-");

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
  // the most recent collection is the one shown on the card
  const [current] = drug.items;

  return (
    <Popover
      content={<CultureDetails drug={drug} t={t} />}
      title={drug.drug}
      mouseLeaveDelay={0}
      mouseEnterDelay={0.5}
    >
      <Item
        className="culture-item"
        $alert={isAlert(current)}
        $prediction={isPrediction(current)}
      >
        <div className="name">{drug.drug}</div>
        <div className="result">
          {isPrediction(current) && <RobotOutlined />}
          <span>
            <CultureResult item={current} t={t} />
          </span>
        </div>
      </Item>
    </Popover>
  );
};

export function CultureTab({ cultures }) {
  const { t } = useTranslation();

  if (!cultures || cultures.length === 0) {
    return (
      <Flex align="center" justify="center" style={{ width: "100%" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("culture.empty")}
        />
      </Flex>
    );
  }

  return (
    <List>
      {cultures.map((drug) => (
        <CultureListItem drug={drug} key={drug.drug} t={t} />
      ))}
    </List>
  );
}
