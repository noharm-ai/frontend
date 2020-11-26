import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import styled from 'styled-components/macro';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { ExpandableTable } from '@components/Table';
import Empty from '@components/Empty';
import LoadBox from '@components/LoadBox';
import { Row, Col } from '@components/Grid';
import Tabs from '@components/Tabs';
import Tag from '@components/Tag';
import notification from '@components/notification';
import PreviousInterventionList from '@containers/Screening/PreviousInterventionList';
import BackTop from '@components/BackTop';
import PrescriptionList from '@containers/Screening/PrescriptionDrug/PrescriptionList';
import { toDataSource } from '@utils';

import Patient from './Patient';
import examColumns, { examRowClassName, expandedExamRowRender } from './Exam/columns';

// extract idPrescription from slug.
const extractId = slug => slug.match(/([0-9]+)$/)[0];

const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

const ScreeningTabs = styled(Tabs)`
  .ant-tabs-nav {
    width: 100%;
  }

  .ant-tabs-nav .ant-tabs-tab:nth-child(4) {
    margin-left: 50px !important;
  }
`;

const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

export default function Screening({
  match,
  fetchScreeningById,
  fetchExams,
  access_token,
  isFetching,
  content,
  error,
  exams
}) {
  const id = extractId(match.params.slug);
  const {
    prescriptionRaw: drugList,
    solutionRaw: solutionList,
    proceduresRaw: proceduresList,
    interventions: interventionList
  } = content;

  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);
  const [dsExams, setDsExams] = useState([]);

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
    interventions: interventionList ? interventionList.length : 0
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
      <Row type="flex" gutter={24}>
        <Col span={24} md={24}>
          {isFetching ? (
            <LoadBox />
          ) : (
            <Patient {...content} fetchScreening={fetchScreeningById} access_token={access_token} />
          )}
        </Col>
        <ScreeningTabs
          defaultActiveKey="1"
          style={{ width: '100%', marginTop: '20px' }}
          type="card gtm-tab-screening"
          onTabClick={onTabClick}
        >
          <Tabs.TabPane
            tab={<TabTitle title="Medicamentos" count={listCount.prescriptions} />}
            key="1"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <PrescriptionList emptyMessage="Nenhum medicamento encontrado." />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab={<TabTitle title="Soluções" count={listCount.solutions} />} key="2">
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              {/* <PrescriptionDrugList
                isFetching={isFetching}
                dataSource={solutionList}
                headers={content.headers}
                aggregated={content.agg}
                columns={solutionColumns}
                expandedRowRender={expandedRowRender}
                handleRowExpand={handleRowExpand}
                expandedRows={expandedRows.solution}
                emptyMessage="Nenhuma solução encontrada."
              /> */}
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<TabTitle title="Procedimentos/Exames" count={listCount.procedures} />}
            key="3"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              {/* <PrescriptionDrugList
                isFetching={isFetching}
                dataSource={proceduresList}
                headers={content.headers}
                aggregated={content.agg}
                columns={columnsTable({ status: null })}
                expandedRowRender={expandedRowRender}
                handleRowExpand={handleRowExpand}
                expandedRows={expandedRows.procedure}
                emptyMessage="Nenhum procedimento/exame encontrado."
              /> */}
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<TabTitle title="Intervenções Anteriores" count={listCount.interventions} />}
            key="4"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <PreviousInterventionList />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab={<TabTitle title="Exames" />} key="5">
            <ExpandableTable
              title={title}
              columns={examColumns}
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
        </ScreeningTabs>
      </Row>

      <BackTop />
    </>
  );
}
