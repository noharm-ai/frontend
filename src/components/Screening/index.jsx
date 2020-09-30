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
import TableFilter from '@components/TableFilter';
import { format } from 'date-fns';
import ModalIntervention from '@containers/Screening/ModalIntervention';
import ModalPrescriptionDrug from '@containers/Screening/ModalPrescriptionDrug';
import { toDataSource } from '@utils';
import BackTop from '@components/BackTop';

import Patient from './Patient';
import columnsTable, {
  expandedRowRender,
  solutionColumns,
  groupSolutions,
  isPendingValidation
} from './columns';
import interventionColumns, { expandedInterventionRowRender } from './Intervention/columns';
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

const PrescriptionHeader = styled.div`
  background-color: lightgray;
  padding: 5px;
  padding-left: 15px;
  border-radius: 4px;
  margin-top: 20px;

  span {
    padding-left: 15px;
  }

  .p-number {
    padding-right: 10px;
  }

  a {
    color: rgba(0, 0, 0, 0.65);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

`;

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

  // extra resources to add in table item.
  const bag = {
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
    weight: content.weight
  };

  const [dsDrugList, setDrugList] = useState([]);
  const [dsSolutions, setDsSolutions] = useState([]);
  const [dsProcedures, setDsProcedures] = useState([]);
  const [dsInterventions, setDsInterventions] = useState([]);
  const [dsExams, setDsExams] = useState([]);

  useEffect(() => {
    const splitDS = list => {
      const drugArray = [];
      list.forEach(item => {
        if (!drugArray[item.grp_solution]) {
          drugArray[item.grp_solution] = [];
        }
        drugArray[item.grp_solution].push(item);
      });

      const dsArray = [];
      drugArray.forEach((item, index) => {
        dsArray.push({
          key: index,
          value: toDataSource(item, 'idPrescriptionDrug', {
            ...bag,
            prescriptionType: 'prescriptions'
          })
        });
      });

      return dsArray;
    };

    setDrugList(drugList ? splitDS(drugList) : []);
  }, [drugList]); // eslint-disable-line

  useEffect(() => {
    setDsSolutions(
      groupSolutions(
        toDataSource(solutionList, 'idPrescriptionDrug', {
          ...bag,
          prescriptionType: 'solutions'
        }),
        infusionList
      )
    );
  }, [solutionList]); // eslint-disable-line

  useEffect(() => {
    setDsProcedures(
      toDataSource(proceduresList, 'idPrescriptionDrug', {
        ...bag,
        prescriptionType: 'procedures'
      })
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

  const rowClassName = (record, index) => {
    const classes = [];

    if (record.total) {
      classes.push('summary-row');
    }

    if (record.suspended) {
      classes.push('suspended');
    }

    if (record.checked && isEmpty(record.prevIntervention)) {
      classes.push('checked');
    }

    if (record.whiteList && !record.total) {
      classes.push('checked');
    }

    if (record.status === 's') {
      classes.push('danger');
    }

    return classes.join(' ');
  };

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
    return null;
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
              {isFetching ? (
                <LoadBox />
              ) : (
                dsDrugList.map((ds, index) => (
                  <div key={index}>
                    {content.agg && (
                      <PrescriptionHeader>
                        <strong className="p-number">
                          Prescrição &nbsp;
                          <a
                            href={`/prescricao/${ds.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            # {ds.key}
                          </a>
                        </strong>
                        <span>
                          <strong>Liberação:</strong> &nbsp;
                          {format(new Date(content.headers[ds.key].date), 'dd/MM/yyyy HH:mm')}
                        </span>
                        <span>
                          <strong>Vigência:</strong> &nbsp;
                          {format(new Date(content.headers[ds.key].expire), 'dd/MM/yyyy HH:mm')}
                        </span>
                        <span>
                          <strong>Leito:</strong> &nbsp;
                          {content.headers[ds.key].bed}
                        </span>
                        <span>
                          <strong>Prescritor:</strong> &nbsp;
                          {content.headers[ds.key].prescriber}
                        </span>
                      </PrescriptionHeader>
                    )}
                    <ExpandableTable
                      expandedRowKeys={expandedRows.prescription}
                      onExpand={(expanded, record) => handleRowExpand(record)}
                      title={title}
                      columns={columnsTable(filter)}
                      pagination={false}
                      loading={isFetching}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Nenhum medicamento encontrado."
                          />
                        )
                      }}
                      dataSource={!isFetching ? ds.value : []}
                      expandedRowRender={expandedRowRender}
                      rowClassName={rowClassName}
                    />
                  </div>
                ))
              )}
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane tab={<TabTitle title="Soluções" count={listCount.solutions} />} key="2">
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <ExpandableTable
                title={title}
                columns={solutionColumns}
                pagination={false}
                loading={isFetching}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhuma solução encontrada."
                    />
                  )
                }}
                dataSource={!isFetching ? dsSolutions : []}
                expandedRowRender={expandedRowRender}
                expandedRowKeys={expandedRows.solution}
                onExpand={(expanded, record) => handleRowExpand(record)}
                rowClassName={rowClassName}
              />
            </Col>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<TabTitle title="Procedimentos/Exames" count={listCount.procedures} />}
            key="3"
          >
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <ExpandableTable
                title={title}
                columns={columnsTable({ status: null })}
                pagination={false}
                loading={isFetching}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhum procedimento/exame encontrado."
                    />
                  )
                }}
                dataSource={!isFetching ? dsProcedures : []}
                expandedRowRender={expandedRowRender}
                expandedRowKeys={expandedRows.procedure}
                onExpand={(expanded, record) => handleRowExpand(record)}
                rowClassName={rowClassName}
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
