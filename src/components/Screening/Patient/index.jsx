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
import Tabs from '@components/Tabs';

import FormIntervention from '@containers/Forms/Intervention';

import { PatientBox, SeeMore } from './Patient.style';
import ExamCard from '../Exam/Card';
import AlertCard from '../AlertCard';
import ClinicalNotesCard from '../ClinicalNotes/Card';

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
        <PatientBox>
          <div className="patient-header">
            <div className="patient-header-name">
              {namePatient || '-'}
              {dischargeMessage(dischargeFormated, dischargeReason)}
            </div>
            <div className="patient-header-action">
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
            </div>
          </div>
          <div className="patient-body">
            <Tabs defaultActiveKey="patientData" type="gtm-tab-patient" centered>
              <Tabs.TabPane tab={t('patientCard.patientData')} key="patientData">
                <div className="patient-data">
                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.age')}</div>
                    <div className="patient-data-item-value">
                      {age} {isNaN(age) ? '' : 'anos'}
                      {birthdate ? `(${moment(birthdate).format('DD/MM/YYYY')})` : ''}
                    </div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.gender')}</div>
                    <div className="patient-data-item-value">
                      {gender
                        ? gender === 'M'
                          ? t('patientCard.male')
                          : t('patientCard.female')
                        : ''}
                    </div>
                  </div>

                  <div className="patient-data-item edit">
                    <div className="patient-data-item-label">{t('patientCard.height')}</div>
                    <div className="patient-data-item-value">
                      {height ? (
                        <Tooltip title={t('patientCard.manuallyUpdated')}>
                          {height} cm <InfoIcon />
                        </Tooltip>
                      ) : (
                        t('patientCard.notAvailable')
                      )}
                    </div>
                    <div className="patient-data-item-edit">
                      {hasNoHarmCare && notesInfo ? (
                        <>
                          <PopoverWelcome
                            content={
                              <AISuggestion
                                notes={notesInfo}
                                date={notesInfoDate}
                                action={t('patientCard.editHeight')}
                                t={t}
                              />
                            }
                            placement="right"
                            mouseLeaveDelay={0.02}
                          >
                            <Button type="link" onClick={() => setVisible(true)}>
                              <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                            </Button>
                          </PopoverWelcome>
                        </>
                      ) : (
                        <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                      )}
                    </div>
                  </div>

                  <div className="patient-data-item edit">
                    <div className="patient-data-item-label">{t('patientCard.weight')}</div>
                    <div className="patient-data-item-value">
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
                    </div>
                    <div className="patient-data-item-edit">
                      {hasNoHarmCare && notesInfo ? (
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
                            <Button type="link" onClick={() => setVisible(true)}>
                              <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                            </Button>
                          </PopoverWelcome>
                        </>
                      ) : (
                        <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                      )}
                    </div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.bmi')}</div>
                    <div className="patient-data-item-value">
                      {weight && height ? (
                        <>{getIMC(weight, height).toFixed(2)} kg/m²</>
                      ) : (
                        t('patientCard.notAvailable')
                      )}
                    </div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.bodySurface')}</div>
                    <div className="patient-data-item-value">
                      {weight && height ? (
                        <>{getCorporalSurface(weight, height).toFixed(3)} m²</>
                      ) : (
                        t('patientCard.notAvailable')
                      )}
                    </div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.skin')}</div>
                    <div className="patient-data-item-value">{skinColor}</div>
                  </div>

                  <div className="patient-data-item edit">
                    <div className="patient-data-item-label">{t('patientCard.notes')}</div>
                    <div className="patient-data-item-value">
                      {observation ? 'Ver anotações' : 'Adicionar anotação'}
                      <div className="patient-data-item-edit">
                        <Button type="link" onClick={() => setVisible(true)}>
                          <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="patient-data-item full">
                    <div className="patient-data-item-label">Tags</div>
                    <div className="patient-data-item-value"></div>
                  </div>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab={t('patientCard.admissionData')} key="admissionData">
                <div className="patient-data">
                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.admission')}</div>
                    <div className="patient-data-item-value">{admissionNumber}</div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.admissionDate')}</div>
                    <div className="patient-data-item-value">{admissionDate}</div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.department')}</div>
                    <div className="patient-data-item-value">
                      {department}
                      {lastDepartment && department !== lastDepartment && (
                        <Tooltip
                          title={`${t('patientCard.previousDepartment')}: ${lastDepartment}`}
                        >
                          {' '}
                          <InfoIcon />
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.bed')}</div>
                    <div className="patient-data-item-value">{bed}</div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.segment')}</div>
                    <div className="patient-data-item-value">{segmentName}</div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.medicalRecord')}</div>
                    <div className="patient-data-item-value">{record}</div>
                  </div>

                  <div className="patient-data-item">
                    <div className="patient-data-item-label">{t('patientCard.prescriber')}</div>
                    <div className="patient-data-item-value">{prescriber}</div>
                  </div>
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>

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
        </PatientBox>
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
      {seeMore && (
        <Col xs={24} style={{ marginTop: '10px' }}>
          <Col xs={8}>
            <PrescriptionCard style={{ minHeight: '113px' }}>
              <div className="header">
                <h3 className="title">Sinais</h3>
              </div>
              <div className="content">
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
              </div>
            </PrescriptionCard>
          </Col>
          <Col xs={8}>
            <PrescriptionCard style={{ minHeight: '113px' }}>
              <div className="header">
                <h3 className="title">Dados</h3>
              </div>
              <div className="content">
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
              </div>
            </PrescriptionCard>
          </Col>
          <Col xs={8}>
            <PrescriptionCard style={{ minHeight: '113px' }}>
              <div className="header">
                <h3 className="title">Alergias</h3>
              </div>
              <div className="content">
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
              </div>
            </PrescriptionCard>
          </Col>
        </Col>
      )}
      <Col xs={24}>
        <SeeMore onClick={toggleSeeMore}>
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
        </SeeMore>
      </Col>
    </Row>
  );
}
