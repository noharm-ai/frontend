import 'styled-components/macro';
import React, { useState, useCallback } from 'react';
import moment from 'moment';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

import api from '@services/api';
import { PopoverWelcome } from '@components/Popover';
import Button from '@components/Button';
import Icon, { InfoIcon } from '@components/Icon';
import Tooltip from '@components/Tooltip';
import FormPatientModal from '@containers/Forms/Patient';
import RichTextView from '@components/RichTextView';
import Alert from '@components/Alert';
import PrescriptionCard from '@components/PrescriptionCard';
import { getCorporalSurface, getIMC } from '@utils/index';

import FormIntervention from '@containers/Forms/Intervention';

import { Wrapper, Name, NameWrapper, Box } from './Patient.style';
import ExamCard from '../Exam/Card';
import AlertCard from '../AlertCard';
import ClinicalNotesCard from '../ClinicalNotes/Card';

function Cell({ children, ...props }) {
  return (
    <Box {...props}>
      <div className="cell">{children}</div>
    </Box>
  );
}

export default function Patient({
  fetchScreening,
  access_token,
  prescription,
  checkPrescriptionDrug,
  selectIntervention,
  security,
  interventionCount,
  siderCollapsed
}) {
  const {
    admissionNumber,
    admissionDate,
    alertExams,
    department,
    lastDepartment,
    age,
    birthdate,
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
    concilia,
    alertStats,
    clinicalNotes,
    clinicalNotesStats,
    features
  } = prescription;
  const [interventionVisible, setInterventionVisibility] = useState(false);

  const [visible, setVisible] = useState(false);
  const [seeMore, setSeeMore] = useState(false);
  const { t } = useTranslation();

  const hasNoHarmCare = security.hasNoHarmCare();
  const hasAIData = hasNoHarmCare && (notesSigns !== '' || notesInfo !== '');

  const showInterventionModal = () => {
    selectIntervention({
      idPrescriptionDrug: '0',
      admissionNumber,
      idPrescription: prescription.idPrescription,
      idSegment: prescription.idSegment,
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
            {birthdate ? `(${moment(birthdate).format('DD/MM/YYYY')})` : ''}
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
            {hasNoHarmCare && notesInfo && (
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
            {hasNoHarmCare && notesInfo && (
              <>
                <PopoverWelcome
                  content={
                    <AISuggestion notes={notesInfo} action={t('patientCard.editHeight')} t={t} />
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
                <strong>{t('patientCard.admissionDate')}:</strong> {admissionDate}
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
              {hasNoHarmCare && (
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

      <Col xl={10} xxl={11}>
        <ExamCard exams={exams} siderCollapsed={siderCollapsed} count={alertExams} />
      </Col>
      <Col xl={6} xxl={5}>
        <AlertCard stats={alertStats} />
        {clinicalNotes > 0 && (
          <div style={{ marginTop: '10px' }}>
            <ClinicalNotesCard stats={clinicalNotesStats} total={clinicalNotes} />
          </div>
        )}
        {!clinicalNotes && (
          <div style={{ marginTop: '10px' }}>
            <PrescriptionCard style={{ minHeight: '113px' }}>
              <div className="header">
                <h3 className="title">{t('tableHeader.interventions')}</h3>
              </div>
              <div className="content">
                <div className="stat-number">{interventionCount}</div>
              </div>
              <div className="footer">
                <div className="stats">
                  <>
                    {features && features.interventions}{' '}
                    {features && features.interventions === 1
                      ? t('tableHeader.pending')
                      : t('tableHeader.pendingPlural')}
                  </>
                </div>
                <div className="action"></div>
              </div>
            </PrescriptionCard>
          </div>
        )}
      </Col>

      <FormPatientModal
        visible={visible}
        onCancel={onCancel}
        okText="Salvar"
        okType="primary gtm-bt-save-patient"
        cancelText="Cancelar"
        afterSavePatient={afterSavePatient}
      />
      <FormIntervention
        visible={interventionVisible}
        setVisibility={setInterventionVisibility}
        checkPrescriptionDrug={checkPrescriptionDrug}
      />
    </Row>
  );
}
