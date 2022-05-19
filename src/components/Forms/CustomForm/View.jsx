import React from 'react';

export default function CustomFormView({ template, values }) {
  return (
    <div>
      {template.map(item => (
        <React.Fragment key={item.group}>
          <h2>{item.group}</h2>
          {item.questions.map(question => (
            <div className="question">
              <div className="label">{question.label}</div>
              <div className="value">{values[question.id]}</div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
