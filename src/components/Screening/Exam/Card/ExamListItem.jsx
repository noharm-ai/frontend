import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";

import Popover from "components/PopoverStyled";
import NumericValue from "components/NumericValue";

import { Item } from "./ExamListItem.style";

export default function ExamListItem({ exam, siderCollapsed }) {
  const { t } = useTranslation();

  const getIcon = (delta) => {
    if (delta > 0) {
      return <ArrowUpOutlined />;
    }

    if (delta < 0) {
      return <ArrowDownOutlined />;
    }

    return <MinusOutlined />;
  };

  const refText = (text) => {
    return text.split("\n").map(function (item, key) {
      return (
        <span key={key}>
          {item}
          <br />
        </span>
      );
    });
  };

  const getExamValue = (exam, addUnit = true) => {
    if (!exam || !exam.value) {
      return "--";
    }

    return (
      <NumericValue
        suffix={addUnit && exam.unit ? ` ${exam.unit}` : ""}
        value={exam.value}
      />
    );
  };

  const ExamData = ({ exam, t }) => (
    <>
      {exam && exam.value && (
        <div>
          {t("tableHeader.value")}: {getExamValue(exam)}
        </div>
      )}
      {exam && exam.date && (
        <div>
          {t("patientCard.examDate")}:{" "}
          {moment(exam.date).format("DD/MM/YYYY HH:mm")}
        </div>
      )}
      {exam && exam.ref && <div>Ref: {refText(exam.ref)}</div>}
      {exam?.delta != null && (
        <div>
          {t("patientCard.examVariation")}: {exam.delta > 0 ? "+" : ""}
          {exam.delta}%
        </div>
      )}
    </>
  );

  return (
    <Popover
      content={<ExamData exam={exam.value} t={t} />}
      title={exam.value.name}
      key={exam.key}
      mouseLeaveDelay={0}
      mouseEnterDelay={0.5}
    >
      <Item
        $alert={exam.value.value && exam.value.alert}
        $siderCollapsed={siderCollapsed}
      >
        <div className="name">{exam.value.initials}</div>
        <div className="icon">
          <span>{getExamValue(exam.value, false)}</span>

          {getIcon(exam.value.delta)}
        </div>
      </Item>
    </Popover>
  );
}
