import React from 'react';
import moment from 'moment';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import { Textarea, DatePicker } from '@components/Inputs';
import Heading from '@components/Heading';
import Tooltip from '@components/Tooltip';

import { Box, EditorBox, FieldError } from '../Form.style';

export default function Base() {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { alert, alertExpire } = values;
  const layout = { label: 4, input: 20 };

  return <></>;
}
