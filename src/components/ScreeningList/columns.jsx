import React from 'react';
import styled from 'styled-components/macro';
import Button, { Link } from '@components/Button';
import Icon, { InfoIcon } from '@components/Icon';
import Tooltip from '@components/Tooltip';
import Table from '@components/Table';
import { useTranslation } from 'react-i18next';

const setDataIndex = list =>
  list.map(({ key, ...column }) => ({
    ...column,
    key,
    dataIndex: key
  }));

const Flag = styled.span`
  border-radius: 3px;
  display: inline-block;
  height: 15px;
  width: 5px;

  &.red {
    background-color: #e46666;
  }

  &.orange {
    background-color: #e67e22;
  }

  &.yellow {
    background-color: #e4da66;
  }

  &.green {
    background-color: #7ebe9a;
  }

  &.blue {
    background-color: #66c7e4;
  }
`;

const ActionsBox = styled.div`
  display: flex;
  justify-content: center;

  @media (min-width: 768px) {
    text-align: right;

    .ant-btn:last-child {
      margin-left: 5px;
    }
  }
`;

const CheckedBox = styled.span`
  padding: 5px 15px;
`;

const NestedTableContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 35px;
`;

const ScreeningActions = ({
  idPrescription,
  status,
  slug,
  checkScreening,
  check,
  prioritizationType
}) => {
  const checkAction = () => checkScreening(idPrescription, 's');

  const isDisabled = check.idPrescription !== idPrescription && check.isChecking;
  const isChecking = check.idPrescription === idPrescription && check.isChecking;
  const isChecked = status === 's';

  return (
    <ActionsBox>
      {!isChecked && (
        <Tooltip title="Checar prescrição" placement="left">
          <Button
            type="primary gtm-bt-check"
            loading={isChecking}
            disabled={isDisabled}
            onClick={checkAction}
          >
            <Icon type="check" />
          </Button>
        </Tooltip>
      )}
      {isChecked && (
        <Tooltip title="Prescrição checada" placement="left">
          <CheckedBox>
            <Icon type="check" />
          </CheckedBox>
        </Tooltip>
      )}
      <Tooltip title="Ver detalhes" placement="left">
        <span>
          <Link
            type="secondary gtm-bt-detail"
            href={
              prioritizationType === 'conciliation' ? `/conciliacao/${slug}` : `/prescricao/${slug}`
            }
            target="_blank"
          >
            <Icon type="search" />
          </Link>
        </span>
      </Tooltip>
    </ActionsBox>
  );
};

const ExamResult = ({ exam }) => {
  if (exam.alert) {
    return <span style={{ fontWeight: 600, color: '#ff4d4f' }}>{exam.value}</span>;
  }

  return exam.value;
};

export const defaultAction = {
  title: 'Ações',
  key: 'operations',
  width: 70,
  align: 'center',
  render: (text, prescription) => <ScreeningActions {...prescription} />
};

export const desktopAction = {
  ...defaultAction
};

export const expandedRowRender = record => {
  const columns = setDataIndex([
    {
      title: 'Nome',
      width: 150,
      key: 'namePatient'
    },
    {
      title: 'Data/Hora',
      width: 100,
      key: 'dateFormated',
      align: 'center'
    },
    {
      title: 'Setor',
      width: 150,
      key: 'department'
    },
    {
      title: '# Atendimento',
      width: 100,
      key: 'admissionNumber'
    },
    {
      title: '# Prescrição',
      width: 100,
      key: 'idPrescription'
    }
  ]);

  const examColumns = examList => {
    const columns = examList.map(e => ({
      title: <Tooltip title={e.value.name}>{e.value.initials}</Tooltip>,
      key: e.key,
      dataIndex: e.key,
      width: 55,
      align: 'center',
      render: (text, obj) => <ExamResult exam={obj[e.key]} />
    }));

    return setDataIndex([
      {
        title: 'Exames',
        key: 'exams',
        align: 'left',
        children: setDataIndex(columns)
      }
    ]);
  };

  const examDatasource = examList => {
    const reducer = (acc, item) => {
      acc[item.key] = item.value;
      return acc;
    };

    return examList.reduce(reducer, {});
  };

  return (
    <NestedTableContainer>
      <Table columns={columns} dataSource={[record]} pagination={false} />

      {false && (
        <Table
          columns={examColumns(record.exams)}
          dataSource={[{ ...examDatasource(record.exams), key: 'examRow' }]}
          pagination={false}
          style={{ marginTop: '20px' }}
        />
      )}
    </NestedTableContainer>
  );
};

const oddClass = index => (index % 2 ? 'bg-light-gray' : '');

const sortDirections = ['descend', 'ascend'];

export default (sortedInfo, filteredInfo, noharmCare) => {
  const { t } = useTranslation();
  let index = 0;

  const patientRiskColumns = [
    {
      title: <Tooltip title="Idade">ID</Tooltip>,
      className: `gtm-th-idade ${oddClass(index++)}`,
      key: 'age',
      width: 30,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.birthdays - b.birthdays,
      sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order
    },
    {
      title: <Tooltip title="Tempo de internação (dias)">TI</Tooltip>,
      className: `gtm-th-tempo-int ${oddClass(index++)}`,
      key: 'lengthStay',
      render: (entry, { lengthStay, dischargeFormated }) => {
        if (dischargeFormated) {
          return (
            <Tooltip title={`Paciente com alta em ${dischargeFormated}`} placement="top">
              {lengthStay} <InfoIcon />
            </Tooltip>
          );
        }
        return lengthStay;
      },
      width: 30,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.lengthStay - b.lengthStay,
      sortOrder: sortedInfo.columnKey === 'lengthStay' && sortedInfo.order
    },
    {
      title: <Tooltip title="Exames Alterados">EX</Tooltip>,
      className: `gtm-th-exames ${oddClass(index++)}`,
      key: 'alertExams',
      width: 30,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.alertExams - b.alertExams,
      sortOrder: sortedInfo.columnKey === 'alertExams' && sortedInfo.order
    },
    {
      title: (
        <Tooltip title="Alertas na Prescrição: Relações, Toxicidades e Dose de Alerta">AL</Tooltip>
      ),
      className: `ant-table-right-border gtm-th-alerts ${oddClass(index++)}`,
      key: 'alerts',
      width: 30,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.alerts - b.alerts,
      sortOrder: sortedInfo.columnKey === 'alerts' && sortedInfo.order
    }
  ];

  if (noharmCare) {
    patientRiskColumns.push({
      title: <Tooltip title="Eventos adversos">EA</Tooltip>,
      className: `ant-table-right-border gtm-th-ea ${oddClass(index++)}`,
      key: 'complication',
      width: 30,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.complication - b.complication,
      sortOrder: sortedInfo.columnKey === 'complication' && sortedInfo.order
    });
  }

  const prescriptionRiskColumns = [
    {
      title: <Tooltip title="Antimicrobianos">AM</Tooltip>,
      className: `gtm-th-am ${oddClass(index++)}`,
      key: 'am',
      width: 30,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.am - b.am,
      sortOrder: sortedInfo.columnKey === 'am' && sortedInfo.order
    },
    {
      title: <Tooltip title="Alta Vigilância">AV</Tooltip>,
      className: `gtm-th-av ${oddClass(index++)}`,
      key: 'av',
      width: 30,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.av - b.av,
      sortOrder: sortedInfo.columnKey === 'av' && sortedInfo.order
    },
    {
      title: <Tooltip title="Controlados">C</Tooltip>,
      className: `gtm-th-c ${oddClass(index++)}`,
      key: 'controlled',
      width: 20,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.controlled - b.controlled,
      sortOrder: sortedInfo.columnKey === 'controlled' && sortedInfo.order
    },
    {
      title: <Tooltip title="Não padronizados (sem Intervenção)">NP</Tooltip>,
      className: `gtm-th-np ${oddClass(index++)}`,
      key: 'np',
      width: 30,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.np - b.np,
      sortOrder: sortedInfo.columnKey === 'np' && sortedInfo.order
    },
    {
      title: <Tooltip title="Alerta de Sonda">S</Tooltip>,
      className: `gtm-th-s ${oddClass(index++)}`,
      key: 'tube',
      width: 20,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.tube - b.tube,
      sortOrder: sortedInfo.columnKey === 'tube' && sortedInfo.order
    },
    {
      title: <Tooltip title="Diferentes">D</Tooltip>,
      className: `gtm-th-d ${oddClass(index++)}`,
      key: 'diff',
      width: 20,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.diff - b.diff,
      sortOrder: sortedInfo.columnKey === 'diff' && sortedInfo.order
    },
    {
      title: <Tooltip title="Intervenções Pendentes">IP</Tooltip>,
      className: `gtm-th-ip ${oddClass(index++)}`,
      key: 'interventions',
      width: 20,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.interventions - b.interventions,
      sortOrder: sortedInfo.columnKey === 'interventions' && sortedInfo.order
    },
    {
      title: <Tooltip title="Escore Total da Prescrição">T</Tooltip>,
      className: `ant-table-right-border gtm-th-t ${oddClass(index++)}`,
      key: 'prescriptionScore',
      width: 20,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.prescriptionScore - b.prescriptionScore,
      sortOrder: sortedInfo.columnKey === 'prescriptionScore' && sortedInfo.order
    },
    {
      title: (
        <Tooltip
          title="Escore Global: Exames + Alertas + Alta Vigilância + Diferentes + Escore Total da Prescrição."
          underline
        >
          EG
        </Tooltip>
      ),
      className: `ant-table-right-border gtm-th-ge ${oddClass(index++)}`,
      key: 'globalScore',
      width: 20,
      align: 'center',
      sortDirections,
      sorter: (a, b) => a.globalScore - b.globalScore,
      sortOrder: sortedInfo.columnKey === 'globalScore' && sortedInfo.order
    }
  ];

  return [
    {
      key: 'class',
      width: 20,
      align: 'center',
      className: 'hidden-sorter',
      render: record => {
        if (record.processed) {
          return <Flag className={record.class || 'green'} />;
        }

        return (
          <Tooltip title="Os indicadores estão sendo calculados. Aguarde ou atualize a página para visualizá-los.">
            <Icon type="loading" spin />
          </Tooltip>
        );
      },
      filteredValue: filteredInfo.searchKey || null,
      onFilter: (value, record) =>
        record.namePatient.toLowerCase().includes(value) || `${record.admissionNumber}` === value
    },
    {
      title: t('screeningList.patientRisk'),
      className: 'ant-table-right-border',
      children: setDataIndex(patientRiskColumns)
    },
    {
      title: t('screeningList.prescriptionRisk'),
      children: setDataIndex(prescriptionRiskColumns)
    },
    {
      title: t('screeningList.actions'),
      key: 'operations',
      width: 70,
      align: 'center',
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (text, prescription) => <ScreeningActions {...prescription} />
    }
  ];
};
