import 'styled-components/macro';
import React, { useState, useCallback } from 'react';
import moment from 'moment';
import { Row, Col } from 'antd';

import api from '@services/api';
import Popover from '@components/PopoverStyled';
import Statistic from '@components/Statistic';
import Card from '@components/Card';
import Button from '@components/Button';
import Icon, { InfoIcon } from '@components/Icon';
import Tooltip from '@components/Tooltip';
import FormPatientModal from '@containers/Forms/Patient';
import RichTextView from '@components/RichTextView';

import { Wrapper, Name, NameWrapper, Box, ExamBox } from './Patient.style';

function Cell({ children, ...props }) {
  return (
    <Box {...props}>
      <div className="cell">{children}</div>
    </Box>
  );
}

const getExamValue = exam => {
  if (!exam || !exam.value) {
    return '--';
  }

  return `${exam.value} ${exam.unit ? exam.unit : ''}`;
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

export default function Patient({
  admissionNumber,
  department,
  lastDepartment,
  age,
  gender,
  weight,
  weightUser,
  weightDate,
  skinColor,
  dischargeReason,
  dischargeFormated,
  namePatient,
  segmentName,
  bed,
  prescriber,
  fetchScreening,
  access_token,
  record,
  height,
  exams,
  observation,
  ...prescription
}) {
  const [visible, setVisible] = useState(false);
  const [seeMore, setSeeMore] = useState(false);

  const onCancel = () => {
    setVisible(false);
  };

  const formatWeightDate = weightDate => {
    const emptyMsg = 'data não disponível';
    if (!weightDate) {
      return emptyMsg;
    }

    const date = moment(weightDate);
    const now = moment();

    if (now.diff(date, 'year') > 10) {
      return emptyMsg;
    }

    return date.format('DD/MM/YYYY HH:mm');
  };

  const afterSavePatient = () => {
    fetchScreening(prescription.idPrescription);
  };

  const updatePrescriptionData = useCallback(async () => {
    await api.shouldUpdatePrescription(access_token, prescription.idPrescription);
    fetchScreening(prescription.idPrescription);
  }, [access_token, fetchScreening, prescription.idPrescription]);

  const toggleSeeMore = () => {
    setSeeMore(!seeMore);
  };

  const dischargeMessage = (dischargeFormated, dischargeReason) => {
    if (dischargeFormated) {
      const reason = dischargeReason || 'alta';
      return (
        <Tooltip title={`Paciente com ${reason} em ${dischargeFormated}`}>
          {' '}
          <InfoIcon />
        </Tooltip>
      );
    }
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
                  {dischargeMessage(dischargeFormated, dischargeReason)}
                </Name>
              </Col>
              <Col xs={4} className="btn-container">
                <Tooltip title="Editar dados do paciente">
                  <Button
                    type="primary gtm-bt-edit-patient"
                    onClick={() => setVisible(true)}
                    ghost={!observation}
                  >
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
            {lastDepartment && department !== lastDepartment && (
              <Tooltip title={`Setor Anterior: ${lastDepartment}`}>
                {' '}
                <InfoIcon />
              </Tooltip>
            )}
          </Cell>
          <Cell>
            <strong>Leito:</strong> {bed}
          </Cell>
          <Cell>
            <strong>Idade:</strong> {age} {isNaN(age) ? '' : 'anos'}
          </Cell>
          <Cell>
            <strong>Sexo:</strong> {gender ? (gender === 'M' ? 'Masculino' : 'Feminino') : ''}
          </Cell>
          <Cell>
            <strong>Peso:</strong> {weight} Kg ({formatWeightDate(weightDate)})
            {weightUser && (
              <Tooltip title="Peso alterado manualmente">
                {' '}
                <InfoIcon />
              </Tooltip>
            )}
          </Cell>
          {seeMore && (
            <>
              <Cell>
                <strong>Cor da pele:</strong> {skinColor}
              </Cell>
              <Cell>
                <strong>Altura:</strong>{' '}
                {height ? (
                  <Tooltip title="Altura alterada manualmente">
                    {height} <InfoIcon />
                  </Tooltip>
                ) : (
                  'Não disponível'
                )}
              </Cell>
              <Cell>
                <strong>Segmento:</strong> {segmentName}
              </Cell>
              <Cell>
                <strong>Prontuário:</strong> {record}
              </Cell>
              <Cell>
                <strong>Prescritor:</strong> {prescriber}
              </Cell>
              <Cell>
                <strong>Anotações:</strong>
                <div
                  style={{
                    maxHeight: '300px',
                    overflow: 'auto',
                    marginTop: '10px',
                    minHeight: '60px'
                  }}
                >
                  <RichTextView text={observation} />
                </div>
              </Cell>
              <Cell className="recalc">
                <Button type="primary gtm-bt-update" onClick={updatePrescriptionData}>
                  Recalcular Prescrição
                </Button>
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
                content={<ExamData exam={exam.value} />}
                title={exam.value.name}
                key={exam.key}
                mouseLeaveDelay={0}
              >
                <Card.Grid hoverable>
                  <Statistic
                    title={exam.value.initials}
                    value={getExamValue(exam.value)}
                    valueStyle={!exam.value.value || !exam.value.alert ? {} : { color: '#cf1322' }}
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
