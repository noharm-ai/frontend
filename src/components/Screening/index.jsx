import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import { useTranslation } from 'react-i18next';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { ExpandableTable } from '@components/Table';
import Empty from '@components/Empty';
import LoadBox from '@components/LoadBox';
import { Row, Col } from '@components/Grid';
import Tabs from '@components/Tabs';
import Tag from '@components/Tag';
import notification from '@components/notification';
import BackTop from '@components/BackTop';

import PrescriptionList from '@containers/Screening/PrescriptionDrug/PrescriptionList';
import SolutionList from '@containers/Screening/PrescriptionDrug/SolutionList';
import ProcedureList from '@containers/Screening/PrescriptionDrug/ProcedureList';
import DietList from '@containers/Screening/PrescriptionDrug/DietList';
import PreviousInterventionList from '@containers/Screening/PreviousInterventionList';
import PageHeader from '@containers/Screening/PageHeader';
import Patient from '@containers/Screening/Patient';
import ClinicalNotes from '@containers/Screening/ClinicalNotes';

import { toDataSource } from '@utils';

import examColumns, { examRowClassName, expandedExamRowRender } from './Exam/columns';
import { BoxWrapper, ScreeningTabs } from './index.style';

// extract idPrescription from slug.
const extractId = slug => slug.match(/([0-9]+)$/)[0];

const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

export default function Screening({
  match,
  fetchScreeningById,
  fetchExams,
  fetchClinicalNotes,
  isFetching,
  content,
  error,
  exams,
  security
}) {
  const id = extractId(match.params.slug);
  const hasNoHarmCare = security.hasNoHarmCare();
  const {
    prescriptionRaw: drugList,
    solutionRaw: solutionList,
    proceduresRaw: proceduresList,
    interventionsRaw: interventionList,
    dietRaw: dietList
  } = content;

  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);
  const [dsExams, setDsExams] = useState([]);
  const [clinicalNotesLoaded, setClinicalNotesLoaded] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setDsExams(toDataSource(exams.list, 'key', {}));
  }, [exams.list]); // eslint-disable-line

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  const listCount = {
    prescriptions: drugList ? drugList.length : 0,
    solutions: solutionList ? solutionList.length : 0,
    procedures: proceduresList ? proceduresList.length : 0,
    interventions: interventionList ? interventionList.length : 0,
    diet: dietList ? dietList.length : 0
  };

  // fetch data
  useEffect(() => {
    fetchScreeningById(id);
  }, [id, fetchScreeningById]);

  const TabTitle = ({ title, count, ...props }) => (
    <>
      <span style={{ marginRight: '10px' }}>{title}</span>
      {count >= 0 ? <Tag {...props}>{count}</Tag> : null}
    </>
  );

  const loadExams = () => {
    if (isEmpty(exams.list)) {
      fetchExams(content.admissionNumber, { idSegment: content.idSegment });
    }
  };

  const onTabClick = key => {
    if (key === '5') {
      loadExams();
    } else if (key === '6') {
      if (!clinicalNotesLoaded) {
        fetchClinicalNotes(content.admissionNumber);
        setClinicalNotesLoaded(true);
      }
    }
  };

  if (error) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={error.message}
        id="gtm-prescription-error"
      />
    );
  }

  return (
    <>
      <BoxWrapper>
        <PageHeader match={match} />
        <Row type="flex" gutter={24}>
          <Col span={24} md={24}>
            {isFetching ? <LoadBox /> : <Patient />}
          </Col>
        </Row>
      </BoxWrapper>

      <Row type="flex" gutter={24}>
        <ScreeningTabs
          defaultActiveKey="1"
          style={{ width: '100%', padding: '10px', marginTop: '10px' }}
          type="card gtm-tab-screening"
          onTabClick={onTabClick}
          className={listCount.procedures > 0 ? 'breaktab-4' : 'breaktab-3'}
        >
          <Tabs.TabPane
            tab={<TabTitle title={t('screeningBody.tabDrugs')} count={listCount.prescriptions} />}
            key="1"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <PrescriptionList
                emptyMessage="Nenhum medicamento encontrado."
                hasFilter
                listType="prescription"
              />
            </Col>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={<TabTitle title={t('screeningBody.tabSolutions')} count={listCount.solutions} />}
            key="2"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <SolutionList
                emptyMessage="Nenhuma solução encontrada."
                hasFilter={false}
                listType="solution"
              />
            </Col>
          </Tabs.TabPane>
          {listCount.procedures > 0 && (
            <Tabs.TabPane
              tab={
                <TabTitle title={t('screeningBody.tabProcedures')} count={listCount.procedures} />
              }
              key="3"
            >
              <Col span={24} md={24} style={{ marginTop: '20px' }}>
                <ProcedureList
                  emptyMessage="Nenhuma solução encontrada."
                  hasFilter={false}
                  listType="procedure"
                />
              </Col>
            </Tabs.TabPane>
          )}
          <Tabs.TabPane
            tab={<TabTitle title={t('screeningBody.tabDiet')} count={listCount.diet} />}
            key="4"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <DietList
                emptyMessage="Nenhuma dieta encontrada."
                hasFilter={false}
                listType="diet"
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <TabTitle
                title={t('screeningBody.tabInterventions')}
                count={listCount.interventions}
              />
            }
            key="5"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <PreviousInterventionList />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab={<TabTitle title={t('screeningBody.tabLabResults')} />} key="6">
            <ExpandableTable
              title={title}
              columns={examColumns(t)}
              pagination={false}
              loading={exams.isFetching}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Nenhum exame encontrado."
                  />
                )
              }}
              dataSource={!exams.isFetching ? dsExams : []}
              rowClassName={examRowClassName}
              expandedRowRender={expandedExamRowRender}
            />
          </Tabs.TabPane>
          {!isFetching && hasNoHarmCare && (
            <Tabs.TabPane
              tab={
                <TabTitle
                  title={t('screeningBody.tabClinicalNotes')}
                  count={content.clinicalNotes}
                />
              }
              key="7"
            >
              <ClinicalNotes />
            </Tabs.TabPane>
          )}
        </ScreeningTabs>
      </Row>

      <BackTop />
    </>
  );
}
