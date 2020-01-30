import 'styled-components/macro';
import React from 'react';

import Heading from '@components/Heading';
import { Input, InputNumber, FieldSet } from '@components/Inputs';

export default function Field({ identify, type, labelText, optional, onChange, ...props }) {
  return (
    <FieldSet css="margin-bottom: 25px">
      <Heading as="label" htmlFor={identify} size="16px" margin="0 0 10px">
        {labelText}
        {optional && (
          <span
            css="
            font-weight: 300;
            font-size: 12px;
          "
          >
            {' '}
            opcional
          </span>
        )}
      </Heading>
      {type === 'number' ? (
        <InputNumber
          name={identify}
          id={identify}
          min={0}
          onChange={value => onChange(identify, value)}
          {...props}
        />
      ) : (
        <Input
          name={identify}
          id={identify}
          onChange={({ target }) => onChange(identify, target.value)}
          {...props}
        />
      )}
    </FieldSet>
  );
}
