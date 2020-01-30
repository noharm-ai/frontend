import 'styled-components/macro';
import React, { useState } from 'react';

import Button from '@components/Button';
import Icon from '@components/Icon';
import { InputNumber } from '@components/Inputs';

export default function Escore({ idOutlier, manualScore, saveOutlier }) {
  const [edit, setEdit] = useState(false);
  const [score, setScore] = useState(manualScore || 0);

  const handleClick = event => {
    event.preventDefault();
    setEdit(true);
  };

  const handleSave = () => {
    setEdit(false);
    saveOutlier(
      idOutlier,
      {
        manualScore: score
      }
    );
  };

  return edit
    ? (
      <>
        <InputNumber
          style={{
            marginRight: 8,
            width: 60
          }}
          min={0}
          max={3}
          defaultValue={score}
          onChange={setScore}
        />
        <Button type="primary" onClick={handleSave}>
          <Icon type="check" />
        </Button>
      </>
    )
    :
    <>
      <span css="margin-right: 10px;">{score}</span>
      {/*eslint-disable-next-line*/}
      <a href="#" css="color: inherit;" onClick={handleClick}>
        <Icon type="edit" />
      </a>
    </>
  ;
}
