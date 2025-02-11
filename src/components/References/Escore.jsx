import "styled-components";
import React, { useState, useRef } from "react";
import { CheckOutlined, EditOutlined } from "@ant-design/icons";

import Button from "components/Button";
import { InputNumber } from "components/Inputs";
import { useOutsideAlerter } from "lib/hooks";

export default function Escore({ outlier }) {
  const { idOutlier, manualScore, saveOutlier } = outlier;
  const [edit, setEdit] = useState(false);
  const [score, setScore] = useState(manualScore === null ? "-" : manualScore);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setEdit(false);
  });

  const handleClick = (event) => {
    event.preventDefault();
    setEdit(true);
  };

  const handleSave = () => {
    const validValues = [0, 1, 2, 3];
    let manualScore = score;

    if (manualScore === "-") {
      manualScore = 0;
      setScore(0);
    }

    if (validValues.indexOf(manualScore) === -1) {
      return;
    }

    setEdit(false);
    saveOutlier(idOutlier, { manualScore });
  };

  return edit ? (
    <span ref={wrapperRef}>
      <InputNumber
        style={{
          marginRight: 8,
          width: 60,
        }}
        min={0}
        max={3}
        defaultValue={score === "-" ? 0 : score}
        onChange={setScore}
        autoFocus={true}
        onPressEnter={handleSave}
      />
      <Button
        type="primary"
        className="gtm-bt-change-score"
        onClick={handleSave}
        icon={<CheckOutlined />}
      ></Button>
    </span>
  ) : (
    <>
      <span css="margin-right: 10px;">{score}</span>
      {/*eslint-disable-next-line*/}
      <a href="#" css="color: inherit;" onClick={handleClick}>
        <EditOutlined />
      </a>
    </>
  );
}
