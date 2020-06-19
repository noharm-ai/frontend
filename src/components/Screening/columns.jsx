import React from 'react';
import styled from 'styled-components/macro';
import isEmpty from 'lodash.isempty';

import Icon from '@components/Icon';
import Button, { Link } from '@components/Button';
import Tooltip from '@components/Tooltip';
import Popover from '@components/PopoverStyled';
import Descriptions from '@components/Descriptions';
import Tag from '@components/Tag';
import { createSlug } from '@utils/transformers/utils';
import Menu from '@components/Menu';
import Dropdown from '@components/Dropdown';
import Alert from '@components/Alert';
import RichTextView from '@components/RichTextView';

import { InterventionView } from './Intervention/columns';

const TableLink = styled.a`
  color: rgba(0, 0, 0, 0.65);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const TableTags = styled.div`
  display: flex;
  justify-content: space-between;

  *:only-child {
    margin-left: auto;
  }

  span.tag {
    display: inline-block;
    width: 20px;
  }
`;

const interventionMenu = (id, saveInterventionStatus) => (
  <Menu>
    <Menu.Item onClick={() => saveInterventionStatus(id, 'a')} className="gtm-btn-interv-accept">
      Aceita
    </Menu.Item>
    <Menu.Item
      onClick={() => saveInterventionStatus(id, 'n')}
      className="gtm-btn-interv-not-accept"
    >
      Não aceita
    </Menu.Item>
    <Menu.Item onClick={() => saveInterventionStatus(id, 'x')} className="gtm-btn-interv-not-apply">
      Não se aplica
    </Menu.Item>
  </Menu>
);

const InterventionAction = ({
  checkIntervention: check,
  prevIntervention,
  saveInterventionStatus
}) => {
  const id = prevIntervention.id;
  const isDisabled = check.currentId !== id && check.isChecking;
  const isChecking = check.currentId === id && check.isChecking;
  const isChecked = prevIntervention.status !== 's';

  return (
    <>
      {isChecked && (
        <Tooltip title="Desfazer situação" placement="left">
          <Button
            type="danger gtm-bt-undo-interv-status"
            ghost
            onClick={() => saveInterventionStatus(id, 's')}
            loading={isChecking}
            disabled={isDisabled}
          >
            <Icon type="rollback" style={{ fontSize: 16 }} />
          </Button>
        </Tooltip>
      )}
      {!isChecked && (
        <Dropdown
          overlay={interventionMenu(id, saveInterventionStatus)}
          loading={isChecking}
          disabled={isDisabled}
        >
          <Button
            type="primary"
            loading={isChecking}
            disabled={isDisabled}
            className="gtm-bt-interv-status"
          >
            <Icon type="caret-down" style={{ fontSize: 16 }} />
          </Button>
        </Dropdown>
      )}
    </>
  );
};

const Action = ({
  check,
  savePrescriptionDrugStatus,
  idPrescriptionDrug,
  prescriptionType,
  onShowModal,
  onShowPrescriptionDrugModal,
  uniqueDrugList,
  admissionNumber,
  ...data
}) => {
  if (!check) return null;

  const closedStatuses = ['a', 'n', 'x'];
  const isClosed = closedStatuses.indexOf(data.status) !== -1;
  const isDisabled =
    (check.idPrescriptionDrug !== idPrescriptionDrug && check.isChecking) || isClosed;
  const isChecking = check.idPrescriptionDrug === idPrescriptionDrug && check.isChecking;
  const isChecked = data.status === 's';
  const isIntervened = data.intervened;
  const hasNotes = data.notes !== '' && data.notes != null;
  let btnTitle = isChecked ? 'Alterar intervenção' : 'Enviar intervenção';

  if (isIntervened && !isChecked) {
    btnTitle = 'Enviar intervenção (novamente)';
  }

  if (isClosed) {
    btnTitle = 'Esta intervenção não pode mais ser alterada, pois já foi resolvida.';
  }

  return (
    <TableTags>
      <Tooltip title={btnTitle} placement="left">
        <Button
          type={isIntervened ? 'danger gtm-bt-interv' : 'primary gtm-bt-interv'}
          onClick={() => {
            onShowModal({ ...data, idPrescriptionDrug, uniqueDrugList, admissionNumber });
          }}
          loading={isChecking}
          disabled={isDisabled}
        >
          <Icon type="warning" style={{ fontSize: 16 }} />
        </Button>
      </Tooltip>

      <Tooltip title={hasNotes ? 'Alterar anotação' : 'Adicionar anotação'} placement="left">
        <Button
          type="primary gtm-bt-notes"
          ghost={!hasNotes}
          onClick={() => {
            onShowPrescriptionDrugModal({ ...data, idPrescriptionDrug });
          }}
          disabled={isDisabled}
        >
          <Icon type="form" style={{ fontSize: 16 }} />
        </Button>
      </Tooltip>
    </TableTags>
  );
};
export const defaultAction = {
  title: 'Ações',
  dataIndex: 'intervention',
  width: 180,
  render: (text, prescription) => <Action {...prescription} />
};

export const desktopAction = {
  ...defaultAction,
  fixed: 'right'
};

const NestedTableContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 35px;

  .ant-descriptions-item-label {
    font-weight: 600;
    color: #2e3c5a;
  }
`;

const SimpleList = styled.ul`
  padding-left: 1rem;

  li {
    list-style: none;
  }
`;

const periodDates = dates => {
  if (dates == null || dates.length === 0) {
    return '';
  }

  return (
    <div>
      {dates.map((item, index) => (
        <span key={index}>{item}, </span>
      ))}
    </div>
  );
};

const showAlerts = alerts => {
  if (alerts == null || alerts.length === 0) {
    return '--';
  }

  return (
    <>
      {alerts.map((item, index) => (
        <Alert key={index} type="error" message={item} style={{ marginTop: '5px' }} showIcon />
      ))}
    </>
  );
};

const periodDatesList = dates => {
  if (dates == null || dates.length === 0) {
    return '';
  }

  return (
    <div>
      <SimpleList>
        <li key="0">{dates[0]}</li>
        <li key="1">...</li>
        <li key="2">{dates[dates.length - 1]}</li>
      </SimpleList>
    </div>
  );
};

const DrugTags = ({ drug }) => (
  <span style={{ marginLeft: '10px' }}>
    {drug.np && (
      <Tooltip title="Não padronizado">
        <Tag>NP</Tag>
      </Tooltip>
    )}
    {drug.am && (
      <Tooltip title="Antimicrobianos">
        <Tag>AM</Tag>
      </Tooltip>
    )}
    {drug.av && (
      <Tooltip title="Alta vigilância">
        <Tag>AV</Tag>
      </Tooltip>
    )}
    {drug.c && (
      <Tooltip title="Controlado">
        <Tag>C</Tag>
      </Tooltip>
    )}
  </span>
);

export const groupSolutions = list => {
  if (list.length === 0) return list;

  const items = [];
  let currentGroup = list[0].grp_solution;
  list.forEach(item => {
    if (item.grp_solution !== currentGroup) {
      currentGroup = item.grp_solution;
      items.push({ key: item.key * 2 });
    }
    items.push(item);
  });

  return items;
};

export const expandedRowRender = record => {
  const config = {};
  switch (record.prevIntervention.status) {
    case 'a':
      config.label = 'Aceita';
      config.color = 'green';
      break;
    case 'n':
      config.label = 'Não aceita';
      config.color = 'red';
      break;
    case 'x':
      config.label = 'Não se aplica';
      config.color = null;
      break;
    case 's':
      config.label = 'Pendente';
      config.color = 'orange';
      break;
    default:
      config.label = `Indefinido (${record.prevIntervention.status})`;
      config.color = null;
      break;
  }

  return (
    <NestedTableContainer>
      <Descriptions bordered size="small">
        {!isEmpty(record.alerts) && (
          <Descriptions.Item label="Alertas:" span={3}>
            {showAlerts(record.alerts)}
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Período de uso:" span={3}>
          {isEmpty(record.periodDates) && (
            <Link
              onClick={() => record.fetchPeriod(record.idPrescriptionDrug, record.source)}
              loading={record.periodObject.isFetching}
              type="nda gtm-bt-period"
            >
              Visualizar período de uso
            </Link>
          )}
          {!isEmpty(record.periodDates) && periodDates(record.periodDates)}
        </Descriptions.Item>
        {record.prescriptionType === 'solutions' && (
          <Descriptions.Item label="Horários:" span={3}>
            {record.time}
          </Descriptions.Item>
        )}
        {record.doseWeight && (
          <Descriptions.Item label="Dose / Kg:" span={3}>
            {record.doseWeight}
          </Descriptions.Item>
        )}
        {record.recommendation && (
          <Descriptions.Item label="Observação médica:" span={3}>
            <RichTextView text={record.recommendation} />
          </Descriptions.Item>
        )}
        {record.prevNotes && (
          <Descriptions.Item label="Anotação:" span={3}>
            <RichTextView text={record.prevNotes} />
          </Descriptions.Item>
        )}

        {!isEmpty(record.prevIntervention) && (
          <Descriptions.Item label="Intervenção anterior:" span={3}>
            <InterventionView
              intervention={record.prevIntervention}
              showReasons
              showDate
              status={
                <Descriptions.Item label="Situação" span={3}>
                  <Tag color={config.color}>{config.label}</Tag> <InterventionAction {...record} />
                </Descriptions.Item>
              }
            />
          </Descriptions.Item>
        )}
      </Descriptions>
    </NestedTableContainer>
  );
};

const flags = ['green', 'yellow', 'orange', 'red', 'red'];

const drugInfo = [
  {
    key: 'idPrescriptionDrug',
    dataIndex: 'score',
    width: 20,
    align: 'center',
    render: (entry, { score }) => <span className={`flag ${flags[parseInt(score, 10)]}`} />
  },
  {
    title: 'Medicamento',
    align: 'left',
    render: record => {
      const href = `/tabela-referencia/${record.idSegment}/${record.idDrug}/${createSlug(
        record.drug
      )}/${record.doseconv}/${record.dayFrequency}`;
      return (
        <>
          <Tooltip title="Ver tabela de referência" placement="top">
            <TableLink href={href} target="_blank" rel="noopener noreferrer">
              {record.drug}
            </TableLink>
          </Tooltip>
          <DrugTags drug={record} />
        </>
      );
    }
  },
  {
    title: <Tooltip title="Período de uso">Período</Tooltip>,
    width: 100,
    render: record => {
      if (record.periodDates == null || record.periodDates.length === 0) {
        return record.period;
      }

      return (
        <Popover content={periodDatesList(record.periodDates)} title="Período de uso">
          {record.period}
        </Popover>
      );
    }
  },
  {
    title: 'Dose',
    dataIndex: 'dosage',
    width: 100,
    render: (text, prescription) => {
      if (!prescription.measureUnit) return '';

      return (
        <Tooltip title={prescription.measureUnit.label} placement="top">
          {prescription.dosage}
        </Tooltip>
      );
    }
  }
];

const frequencyAndTime = [
  {
    title: 'Frequência',
    dataIndex: 'frequency',
    width: 150,
    render: (text, prescription) => {
      if (isEmpty(prescription.frequency)) {
        return (
          <Tooltip title="Frequência obtida por conversão" placement="top">
            *
          </Tooltip>
        );
      }

      return (
        <Tooltip title={prescription.frequency.label} placement="top">
          {prescription.frequency.label}
        </Tooltip>
      );
    }
  },
  {
    title: 'Horários',
    dataIndex: 'time',
    width: 100
  }
];

const stageAndInfusion = [
  {
    title: 'Etapas',
    dataIndex: 'stage',
    width: 100
  },
  {
    title: 'Infusão',
    dataIndex: 'infusion',
    width: 100
  }
];

const actionColumns = [
  {
    title: 'Via',
    dataIndex: 'route',
    width: 85
  },
  {
    title: 'Escore',
    dataIndex: 'score',
    width: 85,
    render: (text, prescription) => {
      if (prescription.near) {
        return (
          <Tooltip title="Escore aproximado" placement="left">
            {prescription.score} *
          </Tooltip>
        );
      }

      return prescription.score;
    }
  },
  {
    title: 'Tags',
    width: 50,
    align: 'center',
    render: (text, prescription) => (
      <TableTags>
        <span className="tag">
          {prescription.checked && (
            <Tooltip title="Checado anteriormente">
              <Icon type="check" style={{ fontSize: 18, color: '#52c41a' }} />
            </Tooltip>
          )}
        </span>
        <span className="tag">
          {prescription.recommendation && prescription.recommendation !== 'None' && (
            <Tooltip title="Possui observação médica">
              <Icon type="message" style={{ fontSize: 18, color: '#108ee9' }} />
            </Tooltip>
          )}
        </span>
        <span className="tag">
          {prescription.prevNotes && prescription.prevNotes !== 'None' && (
            <Tooltip title="Possui anotação">
              <Icon type="form" style={{ fontSize: 18, color: '#108ee9' }} />
            </Tooltip>
          )}
        </span>
        <span className="tag">
          {!isEmpty(prescription.prevIntervention) && (
            <Tooltip title="Possui intervenção anterior">
              <Icon type="warning" style={{ fontSize: 18, color: '#fa8c16' }} />
            </Tooltip>
          )}
        </span>
        <span className="tag">
          {prescription.suspended && (
            <Tooltip title="Suspenso">
              <Icon type="stop" style={{ fontSize: 18, color: '#f5222d' }} />
            </Tooltip>
          )}
        </span>
        <span className="tag">
          {!isEmpty(prescription.alerts) && (
            <Tooltip title="Alertas">
              <Tag color="red" style={{ marginLeft: '2px' }}>
                {prescription.alerts.length}
              </Tag>
            </Tooltip>
          )}
        </span>
      </TableTags>
    )
  },
  {
    title: 'Ações',
    dataIndex: 'intervention',
    width: 110,
    render: (text, prescription) => <Action {...prescription} />
  }
];

export const solutionColumns = [...drugInfo, ...stageAndInfusion, ...actionColumns];

export default [...drugInfo, ...frequencyAndTime, ...actionColumns];
