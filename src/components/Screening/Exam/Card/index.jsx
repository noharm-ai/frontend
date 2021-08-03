import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ExamListItem from './ExamListItem';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import PrescriptionCard from '@components/PrescriptionCard';

import ExamModal from '@containers/Screening/Exam/ExamModal';

export default function ExamCard({ exams, siderCollapsed, count }) {
  const [examVisible, setExamVisibility] = useState(false);
  const { t } = useTranslation();

  return (
    <PrescriptionCard>
      <div className="header">
        <h3 className="title">{t('tableHeader.exams')}</h3>
      </div>
      <div className="content">
        <div className="exam-list">
          {exams.map(exam => (
            <div className="exam-item" key={exam.key}>
              <ExamListItem exam={exam} siderCollapsed={siderCollapsed} />
            </div>
          ))}
        </div>
      </div>
      <div className="footer">
        <div className="stats">
          {count > 0 && (
            <div>
              <Tooltip title={t('screeningList.clExamHint')}>
                <Icon type="bell" style={{ fontSize: '18px' }} /> <span>{count}</span>
              </Tooltip>
            </div>
          )}
        </div>
        <div className="action">
          <Button type="link" onClick={() => setExamVisibility(true)}>
            Ver todos
          </Button>
        </div>
      </div>
      <ExamModal visible={examVisible} setVisibility={setExamVisibility} />
    </PrescriptionCard>
  );
}
