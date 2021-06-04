import 'styled-components/macro';
import React, { useState, useCallback } from 'react';
import moment from 'moment';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

import api from '@services/api';
import Popover from '@components/PopoverStyled';
import { PopoverWelcome } from '@components/Popover';
import Statistic from '@components/Statistic';
import Card from '@components/Card';
import Button from '@components/Button';
import Icon, { InfoIcon } from '@components/Icon';
import Tooltip from '@components/Tooltip';
import FormPatientModal from '@containers/Forms/Patient';
import RichTextView from '@components/RichTextView';
import Alert from '@components/Alert';
import { getCorporalSurface, getIMC } from '@utils/index';

import FormIntervention from '@containers/Forms/Intervention';

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

const getExamDelta = delta => {
  if (delta > 0) {
    return <Icon type="arrow-up" />;
  }

  if (delta < 0) {
    return <Icon type="arrow-down" />;
  }

  return null;
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

const ExamData = ({ exam, t }) => (
  <>
    {exam && exam.date && (
      <div>
        {t('patientCard.examDate')}: {moment(exam.date).format('DD/MM/YYYY hh:mm')}
      </div>
    )}
    {exam && exam.ref && <div>Ref: {refText(exam.ref)}</div>}
    {exam && exam.delta && (
      <div>
        {t('patientCard.examVariation')}: {exam.delta > 0 ? '+' : ''}
        {exam.delta}%
      </div>
    )}
  </>
);

export default function Patient({
  fetchScreening,
  access_token,
  prescription,
  selectIntervention,
  security
}) {
  const {
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
    record,
    height,
    exams,
    observation,
    intervention,
    prevIntervention,
    existIntervention,
    notesInfo,
    notesInfoDate,
    notesSigns,
    notesSignsDate,
    concilia
  } = prescription;
  const [interventionVisible, setInterventionVisibility] = useState(false);
  const [visible, setVisible] = useState(false);
  const [seeMore, setSeeMore] = useState(false);
  const { t } = useTranslation();

  const hasClinicalNotes = security.hasNoHarmCare();
  const hasAIData = hasClinicalNotes && (notesSigns !== '' || notesInfo !== '');

  const showInterventionModal = () => {
    selectIntervention({
      idPrescriptionDrug: 0,
      admissionNumber,
      idPrescription: prescription.idPrescription,
      patientName: namePatient,
      age,
      status: intervention ? intervention.status : '0',
      intervention: intervention || { id: 0, idPrescription: prescription.idPrescription }
    });
    setInterventionVisibility(true);
  };

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

  const aiDataTooltip = (msg, date) => {
    if (date) {
      return `${msg} (${moment(date).format('DD/MM/YYYY hh:mm')})`;
    }

    return msg;
  };

  const AISuggestion = ({ notes, action, date, t }) => {
    return (
      <>
        <div style={{ maxWidth: '300px', textAlign: 'center' }}>
          <Alert description={notes} type="info" />
        </div>
        <div style={{ fontSize: '11px', fontWeight: 300, marginTop: '10px' }}>
          {t('patientCard.extractedFrom')} {moment(date).format('DD/MM/YYYY hh:mm')}
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Button type="primary gtm-bt-update-weight" onClick={() => setVisible(true)}>
            {action}
          </Button>
        </div>
      </>
    );
  };

  const closedStatus = ['a', 'n', 'x'];
  const currentStatus = intervention ? intervention.status : 's';
  const isInterventionClosed = closedStatus.indexOf(currentStatus) !== -1;
  let interventionTooltip = t('patientCard.patientIntervention');

  if (isInterventionClosed) {
    interventionTooltip = t('patientCard.patientInterventionDisabled');
  }

  return (
    <Row gutter={8}>
      <Col md={8}>
        <Wrapper>
          <NameWrapper hasIntervention={intervention && intervention.status === 's'}>
            <Row gutter={8}>
              <Col xs={20}>
                <Name as="h3" size="18px">
                  {namePatient || '-'}
                  {dischargeMessage(dischargeFormated, dischargeReason)}
                </Name>
              </Col>
              <Col xs={4} className="btn-container">
                {prevIntervention && (
                  <Tooltip title="Possui intervenção anterior (consulte a aba Intervenções)">
                    <Icon type="warning" style={{ fontSize: 18, color: '#fa8c16' }} />
                  </Tooltip>
                )}
                {!prevIntervention && existIntervention && (
                  <Tooltip title="Possui intervenção anterior já resolvida (consulte a aba Intervenções)">
                    <Icon type="warning" style={{ fontSize: 18, color: 'gray' }} />
                  </Tooltip>
                )}

                <Tooltip title={interventionTooltip}>
                  <Button
                    type="primary gtm-bt-patient-intervention"
                    onClick={() => showInterventionModal()}
                    style={{ marginRight: '3px' }}
                    ghost={!intervention || intervention.status !== 's'}
                    disabled={isInterventionClosed}
                  >
                    <Icon type="warning" style={{ fontSize: 16 }} />
                  </Button>
                </Tooltip>
                <Tooltip title={t('patientCard.editPatient')}>
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
            <strong>{t('patientCard.admission')}:</strong> {admissionNumber}
          </Cell>
          <Cell>
            <strong>{t('patientCard.department')}:</strong> {department}
            {lastDepartment && department !== lastDepartment && (
              <Tooltip title={`${t('patientCard.previousDepartment')}: ${lastDepartment}`}>
                {' '}
                <InfoIcon />
              </Tooltip>
            )}
          </Cell>
          <Cell>
            <strong>{t('patientCard.bed')}:</strong> {bed}
          </Cell>
          <Cell>
            <strong>{t('patientCard.age')}:</strong> {age} {isNaN(age) ? '' : 'anos'}
          </Cell>
          <Cell>
            <strong>{t('patientCard.gender')}:</strong>{' '}
            {gender ? (gender === 'M' ? t('patientCard.male') : t('patientCard.female')) : ''}
          </Cell>
          <Cell>
            <strong>{t('patientCard.weight')}: </strong>
            {weight && (
              <>
                {weight} Kg ({formatWeightDate(weightDate)})
                {weightUser && (
                  <Tooltip title={t('patientCard.manuallyUpdated')}>
                    {' '}
                    <InfoIcon />
                  </Tooltip>
                )}
              </>
            )}
            {!weight && t('patientCard.notAvailable')}
            {hasClinicalNotes && notesInfo && (
              <>
                <PopoverWelcome
                  content={
                    <AISuggestion
                      notes={notesInfo}
                      date={notesInfoDate}
                      action={t('patientCard.editWeigth')}
                      t={t}
                    />
                  }
                  placement="right"
                  mouseLeaveDelay={0.02}
                >
                  <button
                    type="button"
                    className="experimental-text"
                    onClick={() => setVisible(true)}
                  >
                    (NoHarm Care) <InfoIcon />
                  </button>
                </PopoverWelcome>
              </>
            )}
          </Cell>
          {seeMore && (
            <>
              <Cell>
                <strong>{t('patientCard.skin')}:</strong> {skinColor}
              </Cell>
              <Cell>
                <strong>{t('patientCard.height')}:</strong>{' '}
                {height ? (
                  <Tooltip title={t('patientCard.manuallyUpdated')}>
                    {height} cm <InfoIcon />
                  </Tooltip>
                ) : (
                  t('patientCard.notAvailable')
                )}
                {hasClinicalNotes && notesInfo && (
                  <>
                    <PopoverWelcome
                      content={
                        <AISuggestion
                          notes={notesInfo}
                          action={t('patientCard.editHeight')}
                          t={t}
                        />
                      }
                      placement="right"
                      mouseLeaveDelay={0.02}
                    >
                      <button
                        type="button"
                        className="experimental-text"
                        onClick={() => setVisible(true)}
                      >
                        (NoHarm Care) <InfoIcon />
                      </button>
                    </PopoverWelcome>
                  </>
                )}
              </Cell>
              <Cell>
                <strong>{t('patientCard.bodySurface')}: </strong>
                {weight && height ? (
                  <>{getCorporalSurface(weight, height).toFixed(3)} m²</>
                ) : (
                  t('patientCard.notAvailable')
                )}
              </Cell>
              <Cell>
                <strong>{t('patientCard.bmi')}: </strong>
                {weight && height ? (
                  <>{getIMC(weight, height).toFixed(2)} kg/m²</>
                ) : (
                  t('patientCard.notAvailable')
                )}
              </Cell>
              <Cell>
                <strong>{t('patientCard.segment')}:</strong> {segmentName}
              </Cell>
              <Cell>
                <strong>{t('patientCard.medicalRecord')}:</strong> {record}
              </Cell>
              <Cell>
                <strong>{t('patientCard.prescriber')}:</strong> {prescriber}
              </Cell>
              <Cell>
                <strong>{t('patientCard.notes')}:</strong>
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
              {hasClinicalNotes && (
                <>
                  <Cell className="experimental">
                    <strong>
                      {t('patientCard.data')}{' '}
                      <Tooltip
                        title={aiDataTooltip(t('patientCard.dataExtractedFrom'), notesInfoDate)}
                      >
                        {' '}
                        <InfoIcon />
                      </Tooltip>{' '}
                      :
                    </strong>
                    <div
                      style={{
                        maxHeight: '300px',
                        overflow: 'auto',
                        marginTop: '10px',
                        minHeight: '60px'
                      }}
                    >
                      {notesInfo === '' ? '--' : notesInfo}
                    </div>
                  </Cell>
                  <Cell className="experimental">
                    <strong>
                      {t('patientCard.signals')}{' '}
                      <Tooltip
                        title={aiDataTooltip(t('patientCard.signalsExtractedFrom'), notesSignsDate)}
                      >
                        {' '}
                        <InfoIcon />
                      </Tooltip>{' '}
                      :
                    </strong>
                    <div
                      style={{
                        maxHeight: '300px',
                        overflow: 'auto',
                        marginTop: '10px',
                        minHeight: '60px'
                      }}
                    >
                      {notesSigns === '' ? '--' : notesSigns}
                    </div>
                  </Cell>
                </>
              )}
              {!concilia && (
                <Cell className="recalc">
                  <Button type="primary gtm-bt-update" onClick={updatePrescriptionData}>
                    {t('patientCard.recalculate')}
                  </Button>
                </Cell>
              )}
            </>
          )}
          <Cell className="see-more">
            <Button type="link gtm-btn-seemore" onClick={toggleSeeMore}>
              <Icon type={seeMore ? 'up' : 'down'} />{' '}
              {seeMore ? t('patientCard.less') : t('patientCard.more')}
            </Button>
            {hasAIData && (
              <Tooltip title={t('patientCard.ctaNoHarmCare')}>
                {'  '}
                <InfoIcon />
              </Tooltip>
            )}
          </Cell>
        </Wrapper>
      </Col>

      <Col md={16}>
        <ExamBox>
          {exams.map(exam => (
            <Popover
              content={<ExamData exam={exam.value} t={t} />}
              title={exam.value.name}
              key={exam.key}
              mouseLeaveDelay={0}
              mouseEnterDelay={0.5}
            >
              <Card.Grid hoverable>
                <Statistic
                  title={exam.value.initials}
                  suffix={getExamDelta(exam.value.delta)}
                  value={getExamValue(exam.value)}
                  valueStyle={!exam.value.value || !exam.value.alert ? {} : { color: '#cf1322' }}
                />
              </Card.Grid>
            </Popover>
          ))}
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
      <FormIntervention visible={interventionVisible} setVisibility={setInterventionVisibility} />
    </Row>
  );
}
