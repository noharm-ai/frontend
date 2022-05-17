import React from 'react';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import { Select } from '@components/Inputs';

import Heading from '@components/Heading';

import { Box, FieldError } from '../Form.style';

export default function Base({ template }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();

  const layout = { label: 24, input: 24 };

  return (
    <>
      {template.map(item => (
        <React.Fragment key={item.group}>
          <Heading>{item.group}</Heading>
          {item.questions.map(question => (
            <Box hasError={errors[question.id] && touched[question.id]} key={question.id}>
              <Col xs={layout.input}>
                <div className="label">
                  <Heading as="label" size="14px">
                    {question.label}
                  </Heading>
                </div>
                <Select
                  placeholder="Selecione..."
                  onChange={value => setFieldValue(question.id, value)}
                  value={values[question.id]}
                  allowClear
                  style={{ minWidth: '300px' }}
                >
                  <Select.Option value="" key="">
                    &nbsp;
                  </Select.Option>
                  {question.options.map(option => (
                    <Select.Option value={option} key={option}>
                      {option}
                    </Select.Option>
                  ))}
                </Select>
                {errors[question.id] && touched[question.id] && (
                  <FieldError>{errors[question.id]}</FieldError>
                )}
              </Col>
            </Box>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}
