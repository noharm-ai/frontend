import 'styled-components/macro';
import React from 'react';
import { Row, Col } from 'antd';

import Popover from '@components/PopoverStyled';
import Statistic from '@components/Statistic';
import Card from '@components/Card';
import { format } from 'date-fns';

import { Wrapper, Name, Box, ExamBox } from './Patient.style';

function Cell({ children }) {
  return (
    <Box>
      <p>{children}</p>
    </Box>
  );
}

const getExamValue = exam => {
  if (!exam.value) {
    return '--';
  }

  return exam.value;
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
    {exam.date && <div>Data: {exam.date}</div>}
    {exam.ref && <div>Ref: {refText(exam.ref)}</div>}
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
    value: 'creatinina',
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
  ...prescription
}) {
  const gridStyle = width => {
    return { width: width, textAlign: 'center' };
  };

  return (
    <Row gutter={8}>
      <Col md={8}>
        <Wrapper>
          <Name as="h3" size="18px">
            {namePatient || '-'}
          </Name>
          <Cell>
            <strong>Atendimento:</strong> {admissionNumber}
          </Cell>
          <Cell>
            <strong>Setor:</strong> {department}
          </Cell>
          <Cell>
            <strong>Segmento:</strong> {segmentName}
          </Cell>
          <Cell>
            <strong>Idade:</strong> {age} {isNaN(age) ? '' : 'anos'}
          </Cell>
          <Cell>
            <strong>Sexo:</strong> {gender ? (gender === 'M' ? 'Masculino' : 'Feminino') : ''}
          </Cell>
          <Cell>
            <strong>Peso:</strong> {weight} Kg{' '}
            {weightDate ? '(' + format(new Date(weightDate), 'dd/MM/yyyy HH:mm') + ')' : ''}
          </Cell>
          <Cell>
            <strong>Cor da pele:</strong> {skinColor}
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
                    valueStyle={prescription[exam.value].alert ? { color: '#cf1322' } : {}}
                  />
                </Card.Grid>
              </Popover>
            ))}
          </Card>
        </ExamBox>
      </Col>
    </Row>
  );
}
