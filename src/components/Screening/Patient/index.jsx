import 'styled-components/macro';
import React, { useState } from 'react';
import moment from 'moment';
import { Row, Col } from 'antd';

import Popover from '@components/PopoverStyled';
import Statistic from '@components/Statistic';
import Card from '@components/Card';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';
import FormPatientModal from '@containers/Forms/Patient';

import { Wrapper, Name, NameWrapper, Box, ExamBox } from './Patient.style';

function Cell({ children, ...props }) {
  return (
    <Box {...props}>
      <p>{children}</p>
    </Box>
  );
}

const getExamValue = exam => {
  if (!exam || !exam.value) {
    return '--';
  }

  return exam.value + ' ' + (exam.unit ? exam.unit : '');
};

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

const ExamData = ({ exam }) => (
  <>
    {exam && exam.date && <div>Data: {moment(exam.date).format('DD/MM/YYYY hh:mm')}</div>}
    {exam && exam.ref && <div>Ref: {refText(exam.ref)}</div>}
  </>
);

const exams = [
  {
    value: 'mdrd',
    label: 'MDRD',
    description: 'Modification of Diet in Renal Disease',
    width: '15%'
  },
  {
    value: 'cg',
    label: 'CG',
    description: 'Cockcroft-Gault',
    width: '15%'
  },
  {
    value: 'ckd',
    label: 'CKD',
    description: 'Chronic Kidney Disease Epidemiology',
    width: '15%'
  },
  {
    value: 'cr',
    label: 'Creatinina',
    description: 'Creatinina',
    width: '20%'
  },
  {
    value: 'pcr',
    label: 'PCR',
    description: 'Proteína C Reativa',
    width: '20%'
  },
  {
    value: 'rni',
    label: 'RNI',
    description: 'Razão de Normatização Internacional',
    width: '15%'
  },
  {
    value: 'tgo',
    label: 'TGO',
    description: 'Transaminase Glutâmico-Pxalacética',
    width: '20%'
  },
  {
    value: 'tgp',
    label: 'TGP',
    description: 'Transaminase Glutâmico-Pirúvica',
    width: '20%'
  },
  {
    value: 'k',
    label: 'K',
    description: 'Potássio',
    width: '20%'
  },
  {
    value: 'na',
    label: 'Na',
    description: 'Sódio',
    width: '20%'
  },
  {
    value: 'mg',
    label: 'Magnésio',
    description: 'Magnésio',
    width: '20%'
  }
];

export default function Patient({
  admissionNumber,
  department,
  age,
  gender,
  weight,
  weightDate,
  skinColor,
  namePatient,
  segmentName,
  bed,
  fetchScreening,
  record,
  ...prescription
}) {
  const [visible, setVisible] = useState(false);
  const [seeMore, setSeeMore] = useState(false);

  const onCancel = () => {
    setVisible(false);
  };

  const gridStyle = width => {
    return { width: width, textAlign: 'center' };
  };

  const formatWeightDate = weightDate => {
    const emptyMsg = 'data não disponível';
    if (!weightDate) {
      return emptyMsg;
    }

    const date = moment(weightDate).add('hours', 3);
    const now = moment();

    if (now.diff(date, 'year') > 10) {
      return emptyMsg;
    }

    return date.format('DD/MM/YYYY hh:mm');
  };

  const afterSavePatient = () => {
    fetchScreening(prescription.idPrescription);
  };

  const toggleSeeMore = () => {
    setSeeMore(!seeMore);
  };

  return (
    <Row gutter={8}>
      <Col md={8}>
        <Wrapper>
          <NameWrapper>
            <Row gutter={8}>
              <Col xs={20}>
                <Name as="h3" size="18px">
                  {namePatient || '-'}
                </Name>
              </Col>
              <Col xs={4} className="btn-container">
                <Tooltip title="Editar dados do paciente">
                  <Button type="none gtm-bt-edit-patient" onClick={() => setVisible(true)}>
                    <Icon type="edit" style={{ fontSize: 16 }} />
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </NameWrapper>
          <Cell>
            <strong>Atendimento:</strong> {admissionNumber}
          </Cell>
          <Cell>
            <strong>Setor:</strong> {department}
          </Cell>
          <Cell>
            <strong>Idade:</strong> {age} {isNaN(age) ? '' : 'anos'}
          </Cell>
          <Cell>
            <strong>Sexo:</strong> {gender ? (gender === 'M' ? 'Masculino' : 'Feminino') : ''}
          </Cell>
          <Cell>
            <strong>Peso:</strong> {weight} Kg ({formatWeightDate(weightDate)})
          </Cell>
          <Cell>
            <strong>Cor da pele:</strong> {skinColor}
          </Cell>
          {seeMore && (
            <>
              <Cell>
                <strong>Segmento:</strong> {segmentName}
              </Cell>
              <Cell>
                <strong>Leito:</strong> {bed}
              </Cell>
              <Cell>
                <strong>Prontuário:</strong> {record}
              </Cell>
            </>
          )}
          <Cell className="see-more">
            <Button type="link gtm-btn-seemore" onClick={toggleSeeMore}>
              <Icon type={seeMore ? 'up' : 'down'} /> {seeMore ? 'Ver menos' : 'Ver mais'}
            </Button>
          </Cell>
        </Wrapper>
      </Col>

      <Col md={16}>
        <ExamBox>
          <Card title="Exames">
            {exams.map(exam => (
              <Popover
                content={<ExamData exam={prescription[exam.value]} />}
                title={exam.description}
                key={exam.value}
              >
                <Card.Grid hoverable={true} style={gridStyle(exam.width)}>
                  <Statistic
                    title={exam.label}
                    value={getExamValue(prescription[exam.value])}
                    valueStyle={!prescription[exam.value] || !prescription[exam.value].alert ? {} : { color: '#cf1322' }}
                  />
                </Card.Grid>
              </Popover>
            ))}
          </Card>
        </ExamBox>
      </Col>
      <FormPatientModal
        visible={visible}
        onCancel={onCancel}
        okText="Salvar"
        okType="primary gtm-bt-save-patient"
        cancelText="Cancelar"
        afterSavePatient={afterSavePatient}
      />
    </Row>
  );
}
