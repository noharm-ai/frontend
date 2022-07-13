import React from 'react';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Collapse from '@components/Collapse';

import MemoryText from '@containers/MemoryText';
import Heading from '@components/Heading';

import Field from './Field';
import { Box, FieldError, FieldHelp } from '../Form.style';

export default function Base({ template, startClosed }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();

  return (
    <Collapse bordered defaultActiveKey={startClosed ? null : template[0].group} accordion>
      {template.map(item => (
        <Collapse.Panel key={item.group} header={item.group}>
          {item.questions.map(question => (
            <Box
              hasError={errors[question.id] && touched[question.id]}
              key={question.id}
              className="question-group"
            >
              <Col xs={24}>
                <div className="label-container">
                  <div className="label">
                    <Heading as="label" size="14px">
                      {question.label}
                    </Heading>
                  </div>

                  {question.type === 'text' && (
                    <MemoryText
                      storeId={`cf-text-${question.id}`}
                      memoryType={`cf-text-${question.id}`}
                      content={values[question.id]}
                      onLoad={value => setFieldValue(question.id, value)}
                    />
                  )}
                </div>

                <Field question={question} values={values} setFieldValue={setFieldValue} />
                {question.help && <FieldHelp>{question.help}</FieldHelp>}
                {errors[question.id] && touched[question.id] && (
                  <FieldError>{errors[question.id]}</FieldError>
                )}
              </Col>
            </Box>
          ))}
        </Collapse.Panel>
      ))}
    </Collapse>
  );
}
