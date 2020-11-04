import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import styled from 'styled-components/macro';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { getUniqueDrugs } from '@utils/transformers';
import { ExpandableTable } from '@components/Table';
import Empty from '@components/Empty';
import LoadBox from '@components/LoadBox';
import { Row, Col } from '@components/Grid';
import Tabs from '@components/Tabs';
import Tag from '@components/Tag';
import Button from '@components/Button';
import Tooltip from '@components/Tooltip';
import notification from '@components/notification';
import TableFilter from '@components/TableFilter';
import ModalIntervention from '@containers/Screening/ModalIntervention';
import ModalPrescriptionDrug from '@containers/Screening/ModalPrescriptionDrug';
import BackTop from '@components/BackTop';
import {
  groupSolutions,
  groupProcedures,
  filterWhitelistedChildren,
  getWhitelistedChildren
} from '@utils/transformers/prescriptionDrugs';
import { toDataSource } from '@utils';

import Patient from './Patient';
import columnsTable, { expandedRowRender, solutionColumns, isPendingValidation } from './columns';
import interventionColumns, { expandedInterventionRowRender } from './Intervention/columns';
import examColumns, { examRowClassName, expandedExamRowRender } from './Exam/columns';
import PrescriptionDrugList from './PrescriptionDrug/PrescriptionDrugList';

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
  select,
  fetchScreeningById,
  savePrescriptionDrugStatus,
  saveInterventionStatus,
  fetchPeriod,
  fetchExams,
  selectPrescriptionDrug,
  access_token,
  isFetching,
  content,
  error,
  exams,
  checkPrescriptionDrug,
  checkIntervention,
  periodObject
}) {
  const id = extractId(match.params.slug);
  const {
    prescription: drugList,
    solution: solutionList,
    procedures: proceduresList,
    interventions: interventionList,
    infusion: infusionList
  } = content;
  // const { isSaving, wasSaved, item } = maybeCreateOrUpdate;

  const [visible, setVisibility] = useState(false);
  const [expandedRows, setExpandedRows] = useState({
    prescription: [],
    solution: [],
    procedure: []
  });
  const [openPrescriptionDrugModal, setOpenPrescriptionDrugModal] = useState(false);
  const [filter, setFilter] = useState({
    status: null
  });

  const handleFilter = (e, status) => {
    if (status) {
      setFilter({ status: status === 'all' ? null : [status] });
    }
  };

  const isFilterActive = status => {
    if (filter.status) {
      return filter.status[0] === status;
    }

    return filter.status == null && status == null;
  };

  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);

  const onShowPrescriptionDrugModal = data => {
    selectPrescriptionDrug(data);
    setOpenPrescriptionDrugModal(true);
  };

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter(i => i !== key);
    }
    return [...list, key];
  };

  const handleRowExpand = record => {
    switch (record.source) {
      case 'Medicamentos':
        setExpandedRows({
          ...expandedRows,
          prescription: updateExpandedRows(expandedRows.prescription, record.key)
        });
        break;
      case 'Soluções':
        setExpandedRows({
          ...expandedRows,
          solution: updateExpandedRows(expandedRows.solution, record.key)
        });
        break;
      default:
        setExpandedRows({
          ...expandedRows,
          procedure: updateExpandedRows(expandedRows.procedure, record.key)
        });
    }
  };

  const onShowModal = data => {
    select(data);
    setVisibility(true);
  };

  const [dsDrugList, setDrugList] = useState([]);
  const [dsSolutions, setDsSolutions] = useState([]);
  const [dsProcedures, setDsProcedures] = useState([]);
  const [dsInterventions, setDsInterventions] = useState([]);
  const [dsExams, setDsExams] = useState([]);
  const [bag, setBag] = useState({});

  const splitDatasource = (list, prescriptionType, groupFunction) => {
    const drugArray = [];
    list.forEach(item => {
      if (!drugArray[item.idPrescription]) {
        drugArray[item.idPrescription] = [];
      }
      drugArray[item.idPrescription].push(item);
    });

    const dsArray = [];
    drugArray.forEach((item, index) => {
      if (groupFunction) {
        dsArray.push({
          key: index,
          value: groupFunction(
            toDataSource(item, 'idPrescriptionDrug', {
              ...bag,
              prescriptionType
            }),
            infusionList
          )
        });
      } else {
        dsArray.push({
          key: index,
          value: toDataSource(item, 'idPrescriptionDrug', {
            ...bag,
            prescriptionType
          })
        });
      }
    });

    return dsArray;
  };

  useEffect(() => {
    setBag({
      onShowModal,
      onShowPrescriptionDrugModal,
      check: checkPrescriptionDrug,
      savePrescriptionDrugStatus,
      idSegment: content.idSegment,
      uniqueDrugList: getUniqueDrugs(drugList, solutionList, proceduresList),
      admissionNumber: content.admissionNumber,
      saveInterventionStatus,
      checkIntervention,
      periodObject,
      fetchPeriod,
      handleRowExpand,
      weight: content.weight,
      whitelistedChildren: getWhitelistedChildren(drugList)
    });
  }, [ // eslint-disable-line
    content.idSegment, // eslint-disable-line
    content.admissionNumber, // eslint-disable-line
    content.weight, // eslint-disable-line
    drugList, // eslint-disable-line
    solutionList, // eslint-disable-line
    proceduresList // eslint-disable-line
  ]); // eslint-disable-line

  useEffect(() => {
    setDrugList(
      drugList ? splitDatasource(filterWhitelistedChildren(drugList), 'prescriptions') : []
    );
  }, [drugList]); // eslint-disable-line

  useEffect(() => {
    setDsSolutions(solutionList ? splitDatasource(solutionList, 'solutions', groupSolutions) : []);
  }, [solutionList]); // eslint-disable-line

  useEffect(() => {
    setDsProcedures(
      proceduresList ? splitDatasource(proceduresList, 'procedures', groupProcedures) : []
    );
  }, [proceduresList]); // eslint-disable-line

  useEffect(() => {
    setDsInterventions(
      toDataSource(interventionList, 'id', {
        saveInterventionStatus,
        check: checkIntervention
      })
    );
  }, [interventionList]); // eslint-disable-line

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

  const prescriptionCount = {
    all: listCount.prescriptions,
    pendingValidation: drugList ? drugList.reduce((n, i) => n + isPendingValidation(i), 0) : 0
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

  const ListFilter = ({ listCount, handleFilter, isFilterActive }) => (
    <TableFilter style={{ marginBottom: 15 }}>
      <Tooltip title="Ver somente pendentes de validação">
        <Button
          type="gtm-lnk-filter-presc-pendentevalidacao ant-btn-link-hover"
          className={isFilterActive('pending-validation') ? 'active' : ''}
          onClick={e => handleFilter(e, 'pending-validation')}
        >
          Pendentes de validação
          <Tag color="orange">{listCount.pendingValidation}</Tag>
        </Button>
      </Tooltip>
      <Tooltip title="Ver todos">
        <Button
          type="gtm-lnk-filter-presc-todos ant-btn-link-hover"
          className={isFilterActive(null) ? 'active' : ''}
          onClick={e => handleFilter(e, 'all')}
        >
          Todos
          <Tag>{listCount.all}</Tag>
        </Button>
      </Tooltip>
    </TableFilter>
  );

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
              <ListFilter
                listCount={prescriptionCount}
                handleFilter={handleFilter}
                isFilterActive={isFilterActive}
              />
              <PrescriptionDrugList
                isFetching={isFetching}
                dataSource={dsDrugList}
                headers={content.headers}
                aggregated={content.agg}
                columns={columnsTable(filter)}
                expandedRowRender={expandedRowRender}
                handleRowExpand={handleRowExpand}
                expandedRows={expandedRows.prescription}
                emptyMessage="Nenhum medicamento encontrado."
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab={<TabTitle title="Soluções" count={listCount.solutions} />} key="2">
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <PrescriptionDrugList
                isFetching={isFetching}
                dataSource={dsSolutions}
                headers={content.headers}
                aggregated={content.agg}
                columns={solutionColumns}
                expandedRowRender={expandedRowRender}
                handleRowExpand={handleRowExpand}
                expandedRows={expandedRows.solution}
                emptyMessage="Nenhuma solução encontrada."
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<TabTitle title="Procedimentos/Exames" count={listCount.procedures} />}
            key="3"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <PrescriptionDrugList
                isFetching={isFetching}
                dataSource={dsProcedures}
                headers={content.headers}
                aggregated={content.agg}
                columns={columnsTable({ status: null })}
                expandedRowRender={expandedRowRender}
                handleRowExpand={handleRowExpand}
                expandedRows={expandedRows.procedure}
                emptyMessage="Nenhum procedimento/exame encontrado."
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<TabTitle title="Intervenções Anteriores" count={listCount.interventions} />}
            key="4"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <ExpandableTable
                title={title}
                columns={interventionColumns({ status: null })}
                pagination={false}
                loading={isFetching}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhuma intervenção encontrada."
                    />
                  )
                }}
                dataSource={!isFetching ? dsInterventions : []}
                expandedRowRender={expandedInterventionRowRender}
              />
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

      <ModalIntervention visible={visible} setVisibility={setVisibility} />
      <ModalPrescriptionDrug
        visible={openPrescriptionDrugModal}
        setVisibility={setOpenPrescriptionDrugModal}
      />
    </>
  );
}
