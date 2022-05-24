import React from 'react';
import DOMPurify from 'dompurify';

import { CustomFormViewContainer } from './View.style';

export default function CustomFormView({ template, values }) {
  const getValue = value => {
    if (!value) {
      return 'Sem resposta';
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value;
  };

  return (
    <CustomFormViewContainer>
      {template.map(item => (
        <div key={item.group} className="group">
          <h2>{item.group}</h2>
          {item.questions.map(question => (
            <div className="question" key={question.id}>
              <div className="label">{question.label}</div>
              {question.type === 'text' ? (
                <div
                  className="value"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(getValue(values[question.id]))
                  }}
                ></div>
              ) : (
                <div className="value">{getValue(values[question.id])}</div>
              )}
            </div>
          ))}
        </div>
      ))}
    </CustomFormViewContainer>
  );
}
