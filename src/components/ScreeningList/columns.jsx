import React from 'react';
import styled from 'styled-components/macro';
import Button, { Link } from '@components/Button';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import Table from '@components/Table';

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

const ScreeningActions = ({ idPrescription, status, slug, checkScreening, check }) => {
  const checkAction = () => checkScreening(idPrescription, 's');

  const isDisabled = check.idPrescription !== idPrescription && check.isChecking;
  const isChecking = check.idPrescription === idPrescription && check.isChecking;
  const isChecked = check.checkedPrescriptions.indexOf(idPrescription) !== -1 || status === 's';

  return (
    <ActionsBox>
      {!isChecked && (
        <Tooltip title="Checar prescrição">
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
        <Tooltip title="Prescrição checada">
          <CheckedBox>
            <Icon type="check" />
          </CheckedBox>
        </Tooltip>
      )}
      <Tooltip title="Ver detalhes">
        <span>
          <Link type="secondary gtm-bt-detail" href={`/triagem/${slug}`} target="_blank">
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

const getValue = v => {
  if (v === 'None' || v === '') {
    return -1;
  }

  return parseFloat(v, 10);
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

  const exams = setDataIndex([
    {
      title: 'Exames',
      align: 'left',
      children: setDataIndex([
        {
          title: <Tooltip title="Modification of Diet in Renal Disease">MDRD</Tooltip>,
          className: 'gtm-th-mdrd',
          key: 'mdrd',
          width: 55,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.mdrd} />
        },
        {
          title: <Tooltip title="Cockcroft-Gault">CG</Tooltip>,
          className: 'gtm-th-cg',
          key: 'cg',
          width: 40,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.cg} />
        },
        {
          title: <Tooltip title="Chronic Kidney Disease Epidemiology">CKD</Tooltip>,
          className: 'gtm-th-ckd',
          key: 'ckd',
          width: 40,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.ckd} />
        },
        {
          title: <Tooltip title="Creatinina">CR</Tooltip>,
          className: 'gtm-th-cr',
          key: 'cr',
          width: 40,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.cr} />
        },
        {
          title: <Tooltip title="Proteína C Reativa">PCR</Tooltip>,
          className: 'gtm-th-pcr',
          key: 'pcr',
          width: 30,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.pcr} />
        },
        {
          title: <Tooltip title="Razão de Normatização Internacional">RNI</Tooltip>,
          className: 'gtm-th-rni',
          key: 'rni',
          width: 30,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.rni} />
        },
        {
          title: <Tooltip title="Transaminase Glutâmico-Pxalacética">TGO</Tooltip>,
          className: 'gtm-th-tgo',
          key: 'tgo',
          width: 40,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.tgo} />
        },
        {
          title: <Tooltip title="Transaminase Glutâmico-Pirúvica">TGP</Tooltip>,
          className: 'gtm-th-tgp',
          key: 'tgp',
          width: 40,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.tgp} />
        },
        {
          title: <Tooltip title="Potássio">K</Tooltip>,
          className: 'gtm-th-k',
          key: 'k',
          width: 20,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.k} />
        },
        {
          title: <Tooltip title="Sódio">Na</Tooltip>,
          className: 'gtm-th-na',
          key: 'na',
          width: 30,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.na} />
        },
        {
          title: <Tooltip title="Magnésio">Mg</Tooltip>,
          className: 'gtm-th-mg',
          key: 'mg',
          width: 30,
          align: 'center',
          render: (text, prescription) => <ExamResult exam={prescription.mg} />
        }
      ])
    }
  ]);

  return (
    <NestedTableContainer>
      <Table columns={columns} dataSource={[record]} pagination={false} />

      <Table
        columns={exams}
        dataSource={[record]}
        pagination={false}
        style={{ marginTop: '20px' }}
      />
    </NestedTableContainer>
  );
};

const sortDirections = ['descend', 'ascend'];

export default (sortedInfo, filteredInfo) => {
  return setDataIndex([
    {
      key: 'class',
      width: 20,
      align: 'center',
      className: 'hidden-sorter',
      render: className => <Flag className={className || 'green'} />,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order
    },
    {
      title: 'Risco do paciente',
      className: 'ant-table-right-border',
      children: setDataIndex([
        {
          title: <Tooltip title="Idade">ID</Tooltip>,
          className: 'gtm-th-idade',
          key: 'age',
          width: 30,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.age) - getValue(b.age),
          sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order
        },
        {
          title: <Tooltip title="Tempo de internação (dias)">TI</Tooltip>,
          className: 'bg-light-gray gtm-th-tempo-int',
          key: 'lengthStay',
          width: 30,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.lengthStay) - getValue(b.lengthStay),
          sortOrder: sortedInfo.columnKey === 'lengthStay' && sortedInfo.order
        },
        {
          title: <Tooltip title="Exames alterados">EXA</Tooltip>,
          className: 'ant-table-right-border gtm-th-exames',
          key: 'alertExams',
          width: 30,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.alertExams) - getValue(b.alertExams),
          sortOrder: sortedInfo.columnKey === 'alertExams' && sortedInfo.order
        }
      ])
    },
    {
      title: 'Risco da prescrição',
      children: setDataIndex([
        {
          title: <Tooltip title="Antimicrobianos">AM</Tooltip>,
          className: 'bg-light-gray gtm-th-am',
          key: 'am',
          width: 30,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.am) - getValue(b.am),
          sortOrder: sortedInfo.columnKey === 'am' && sortedInfo.order
        },
        {
          title: <Tooltip title="Alta Vigilância">AV</Tooltip>,
          className: 'gtm-th-av',
          key: 'av',
          width: 30,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.av) - getValue(b.av),
          sortOrder: sortedInfo.columnKey === 'av' && sortedInfo.order
        },
        {
          title: <Tooltip title="Controlados">C</Tooltip>,
          className: 'bg-light-gray gtm-th-c',
          key: 'controlled',
          width: 20,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.controlled) - getValue(b.controlled),
          sortOrder: sortedInfo.columnKey === 'controlled' && sortedInfo.order
        },
        {
          title: <Tooltip title="Não padronizados">NP</Tooltip>,
          className: 'gtm-th-np',
          key: 'np',
          width: 30,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.np) - getValue(b.np),
          sortOrder: sortedInfo.columnKey === 'np' && sortedInfo.order
        },
        {
          title: <Tooltip title="Sonda">S</Tooltip>,
          className: 'bg-light-gray gtm-th-s',
          key: 'tube',
          width: 20,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.tube) - getValue(b.tube),
          sortOrder: sortedInfo.columnKey === 'tube' && sortedInfo.order
        },
        {
          title: <Tooltip title="Diferentes">D</Tooltip>,
          className: 'gtm-th-d',
          key: 'diff',
          width: 20,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.diff) - getValue(b.diff),
          sortOrder: sortedInfo.columnKey === 'diff' && sortedInfo.order
        },
        {
          title: <Tooltip title="Intervenções Pendentes">IP</Tooltip>,
          className: 'bg-light-gray gtm-th-ip',
          key: 'interventions',
          width: 20,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.interventions) - getValue(b.interventions),
          sortOrder: sortedInfo.columnKey === 'interventions' && sortedInfo.order
        },
        {
          title: <Tooltip title="Escore Alto">A</Tooltip>,
          className: 'gtm-th-a',
          key: 'scoreThree',
          width: 20,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.scoreThree) - getValue(b.scoreThree),
          sortOrder: sortedInfo.columnKey === 'scoreThree' && sortedInfo.order
        },
        {
          title: <Tooltip title="Escore Médio">M</Tooltip>,
          className: 'bg-light-gray gtm-th-m',
          key: 'scoreTwo',
          width: 20,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.scoreTwo) - getValue(b.scoreTwo),
          sortOrder: sortedInfo.columnKey === 'scoreTwo' && sortedInfo.order
        },
        {
          title: <Tooltip title="Escore Baixo">B</Tooltip>,
          className: 'gtm-th-b',
          key: 'scoreOne',
          width: 20,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.scoreOne) - getValue(b.scoreOne),
          sortOrder: sortedInfo.columnKey === 'scoreOne' && sortedInfo.order
        },
        {
          title: <Tooltip title="Escore Total">T</Tooltip>,
          className: 'bg-light-gray gtm-th-t',
          key: 'prescriptionScore',
          width: 20,
          align: 'center',
          sortDirections: sortDirections,
          sorter: (a, b) => getValue(a.prescriptionScore) - getValue(b.prescriptionScore),
          sortOrder: sortedInfo.columnKey === 'prescriptionScore' && sortedInfo.order
        }
      ])
    },
    {
      title: 'Ações',
      key: 'operations',
      width: 70,
      align: 'center',
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (text, prescription) => <ScreeningActions {...prescription} />
    }
  ]);
};
