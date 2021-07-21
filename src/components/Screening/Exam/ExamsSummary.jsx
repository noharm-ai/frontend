import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import Popover from '@components/PopoverStyled';
import Statistic from '@components/Statistic';
import Card from '@components/Card';
import Icon from '@components/Icon';

import { ExamBox } from './ExamsSummary.style';

export default function ExamsSummary({ exams }) {
  const { t } = useTranslation();

  const refText = text => {
    return text.split('\n').map(function(item, key) {
      return (
        <span key={key}>
          {item}
          <br />
        </span>
      );
    });
  };

  const getExamValue = exam => {
    if (!exam || !exam.value) {
      return '--';
    }

    return `${exam.value} ${exam.unit ? exam.unit : ''}`;
  };

  const getExamDelta = delta => {
    if (delta > 0) {
      return <Icon type="arrow-up" />;
    }

    if (delta < 0) {
      return <Icon type="arrow-down" />;
    }

    return null;
  };

  const ExamData = ({ exam, t }) => (
    <>
      {exam && exam.date && (
        <div>
          {t('patientCard.examDate')}: {moment(exam.date).format('DD/MM/YYYY hh:mm')}
        </div>
      )}
      {exam && exam.ref && <div>Ref: {refText(exam.ref)}</div>}
      {exam && exam.delta && (
        <div>
          {t('patientCard.examVariation')}: {exam.delta > 0 ? '+' : ''}
          {exam.delta}%
        </div>
      )}
    </>
  );

  return (
    <ExamBox>
      {exams.map(exam => (
        <Popover
          content={<ExamData exam={exam.value} t={t} />}
          title={exam.value.name}
          key={exam.key}
          mouseLeaveDelay={0}
          mouseEnterDelay={0.5}
        >
          <Card.Grid hoverable>
            <Statistic
              title={exam.value.initials}
              suffix={getExamDelta(exam.value.delta)}
              value={getExamValue(exam.value)}
              valueStyle={!exam.value.value || !exam.value.alert ? {} : { color: '#cf1322' }}
            />
          </Card.Grid>
        </Popover>
      ))}
    </ExamBox>
  );
}
