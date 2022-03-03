import 'styled-components/macro';
import React, { useState, useCallback, useRef } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import api from '@services/api';
import { PopoverWelcome } from '@components/Popover';
import Button from '@components/Button';
import Icon, { InfoIcon } from '@components/Icon';
import Tooltip from '@components/Tooltip';
import Alert from '@components/Alert';
import { getCorporalSurface, getIMC } from '@utils/index';
import Tabs from '@components/Tabs';
import Menu from '@components/Menu';
import Dropdown from '@components/Dropdown';
import { useOutsideAlerter } from '@lib/hooks';

import FormIntervention from '@containers/Forms/Intervention';

import { PatientBox } from '../Patient.style';

export default function PatientCard({
  prescription,
  checkPrescriptionDrug,
  selectIntervention,
  security,
  access_token,
  setSeeMore,
  fetchScreening,
  setPatientModalVisible
}) {
  const [interventionVisible, setInterventionVisibility] = useState(false);
  const [isMenuVisible, setMenuVisibility] = useState(false);
  const { t } = useTranslation();
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setMenuVisibility(false);
  });

  const hasNoHarmCare = security.hasNoHarmCare();
  const {
    admissionNumber,
    admissionDate,
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
    observation,
    intervention,
    prevIntervention,
    existIntervention,
    notesInfo,
    notesInfoDate,
    notesSigns,
    notesSignsDate,
    notesAllergies,
    notesAllergiesDate,
    concilia
  } = prescription;

  const closedStatus = ['a', 'n', 'x'];
  const currentStatus = intervention ? intervention.status : 's';
  const isInterventionClosed = closedStatus.indexOf(currentStatus) !== -1;
  let interventionTooltip = t('patientCard.patientIntervention');

  if (isInterventionClosed) {
    interventionTooltip = t('patientCard.patientInterventionDisabled');
  }

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

  const updatePrescriptionData = useCallback(async () => {
    await api.shouldUpdatePrescription(access_token, prescription.idPrescription);
    fetchScreening(prescription.idPrescription);
  }, [access_token, fetchScreening, prescription.idPrescription]);

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
          <Button type="primary gtm-bt-update-weight" onClick={() => setPatientModalVisible(true)}>
            {action}
          </Button>
        </div>
      </>
    );
  };

  const handleMenuClick = ({ key, domEvent }) => {
    switch (key) {
      case 'edit':
        setPatientModalVisible(true);
        break;
      case 'update':
        updatePrescriptionData();
        break;
      default:
        console.error('Invalid key', key);
    }

    domEvent.stopPropagation();
  };

  const prescriptionOptions = () => {
    return (
      <Menu onClick={handleMenuClick}>
        <Menu.Item key="edit" className="gtm-bt-edit-patient">
          <Icon type="edit" />
          {t('actions.edit')}
        </Menu.Item>
        {/* <Menu.Item key="exams" className="gtm-bt-exams">
          <Icon type="experiment" />
          {t('tableHeader.exams')}
        </Menu.Item>
        <Menu.Item key="clinicalNotes" className="gtm-bt-clinicalNotes">
          <Icon type="book" />
          {t('tableHeader.clinicalNotes')}
        </Menu.Item> */}
        {!concilia && (
          <Menu.Item key="update" className="gtm-bt-update">
            <Icon type="redo" />
            {t('patientCard.recalculate')}
          </Menu.Item>
        )}
      </Menu>
    );
  };

  return (
    <PatientBox t={t}>
      <div className="patient-header">
        <div
          className={`patient-header-name ${intervention &&
            intervention.status === 's' &&
            'has-intervention'}`}
        >
          {namePatient || '-'}
          {dischargeMessage(dischargeFormated, dischargeReason)}
        </div>
        <div className="patient-header-action" ref={wrapperRef}>
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

          <Dropdown overlay={prescriptionOptions()} visible={isMenuVisible} trigger={[]}>
            <Tooltip title="Menu">
              <button
                className="patient-menu gtm-bt-patient-menu"
                onClick={() => setMenuVisibility(true)}
              >
                <Icon type="more" style={{ fontSize: 28 }} />
              </button>
            </Tooltip>
          </Dropdown>
        </div>
      </div>
      <div className="patient-body">
        <Tabs defaultActiveKey="patientData" type="card gtm-tab-patient">
          <Tabs.TabPane tab={t('patientCard.patientData')} key="patientData">
            <div className="patient-data">
              <div className="patient-data-item">
                <div className="patient-data-item-label">{t('patientCard.age')}</div>
                <div className="patient-data-item-value">
                  {age} {isNaN(age) ? '' : 'anos'}
                  <span className="small">
                    {birthdate ? `(${moment(birthdate).format('DD/MM/YYYY')})` : ''}
                  </span>
                </div>
              </div>

              <div className="patient-data-item">
                <div className="patient-data-item-label">{t('patientCard.gender')}</div>
                <div className="patient-data-item-value">
                  {gender ? (gender === 'M' ? t('patientCard.male') : t('patientCard.female')) : ''}
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
                        <Button type="link" onClick={() => setPatientModalVisible(true)}>
                          <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                        </Button>
                      </PopoverWelcome>
                    </>
                  ) : (
                    <Button type="link" onClick={() => setPatientModalVisible(true)}>
                      <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="patient-data-item edit">
                <div className="patient-data-item-label">{t('patientCard.weight')}</div>
                <div className="patient-data-item-value">
                  {weight && (
                    <Tooltip title={weightUser ? t('patientCard.manuallyUpdated') : ''}>
                      <div>
                        {weight} Kg <span className="small">({formatWeightDate(weightDate)})</span>
                        {weightUser && <InfoIcon />}
                      </div>
                    </Tooltip>
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
                        <Button type="link" onClick={() => setPatientModalVisible(true)}>
                          <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                        </Button>
                      </PopoverWelcome>
                    </>
                  ) : (
                    <Button type="link" onClick={() => setPatientModalVisible(true)}>
                      <Icon type="edit" style={{ fontSize: 18, color: '#fff' }} />
                    </Button>
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
                  {observation ? t('actions.showNotes') : '--'}
                  <div className="patient-data-item-edit">
                    <Button type="link" onClick={() => setPatientModalVisible(true)}>
                      <Icon
                        type={observation ? 'search' : 'edit'}
                        style={{ fontSize: 18, color: '#fff' }}
                      />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="patient-data-item full">
                <div className="patient-data-item-value">
                  {hasNoHarmCare && notesInfo && (
                    <Tooltip
                      title={aiDataTooltip(t('patientCard.dataExtractedFrom'), notesInfoDate)}
                    >
                      <div className="tag info" onClick={() => setSeeMore(true)}>
                        {t('patientCard.data')}
                      </div>
                    </Tooltip>
                  )}

                  {hasNoHarmCare && notesSigns && (
                    <Tooltip
                      title={aiDataTooltip(t('patientCard.signalsExtractedFrom'), notesSignsDate)}
                    >
                      <div className="tag signs" onClick={() => setSeeMore(true)}>
                        {t('patientCard.signals')}
                      </div>
                    </Tooltip>
                  )}

                  {hasNoHarmCare && notesAllergies && (
                    <Tooltip
                      title={aiDataTooltip(
                        t('patientCard.allergiesExtractedFrom'),
                        notesAllergiesDate
                      )}
                    >
                      <div className="tag allergy" onClick={() => setSeeMore(true)}>
                        {t('clinicalNotesIndicator.allergy')}
                      </div>
                    </Tooltip>
                  )}
                </div>
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
                  <Tooltip title={department}>{department}</Tooltip>
                </div>
              </div>

              <div className="patient-data-item">
                <div className="patient-data-item-label">{t('patientCard.previousDepartment')}</div>
                <div className="patient-data-item-value">
                  {lastDepartment && department !== lastDepartment ? (
                    <Tooltip title={lastDepartment}>{lastDepartment}</Tooltip>
                  ) : (
                    '--'
                  )}
                </div>
              </div>

              <div className="patient-data-item">
                <div className="patient-data-item-label">{t('patientCard.bed')}</div>
                <div className="patient-data-item-value">{bed}</div>
              </div>

              <div className="patient-data-item">
                <div className="patient-data-item-label">{t('patientCard.segment')}</div>
                <div className="patient-data-item-value">
                  <Tooltip title={segmentName}>{segmentName}</Tooltip>
                </div>
              </div>

              <div className="patient-data-item">
                <div className="patient-data-item-label">{t('patientCard.medicalRecord')}</div>
                <div className="patient-data-item-value">{record}</div>
              </div>

              <div className="patient-data-item">
                <div className="patient-data-item-label">{t('patientCard.prescriber')}</div>
                <div className="patient-data-item-value">
                  <Tooltip title={prescriber}>{prescriber}</Tooltip>
                </div>
              </div>

              <div className="patient-data-item full">
                <div className="patient-data-item-label">&nbsp;</div>
                <div className="patient-data-item-value"></div>
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>

      <FormIntervention
        visible={interventionVisible}
        setVisibility={setInterventionVisibility}
        checkPrescriptionDrug={checkPrescriptionDrug}
      />
    </PatientBox>
  );
}
