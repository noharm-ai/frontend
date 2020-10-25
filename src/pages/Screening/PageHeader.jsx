import styled from 'styled-components/macro';

import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';

import Icon, { InfoIcon } from '@components/Icon';
import Heading from '@components/Heading';
import Button from '@components/Button';
import { Row, Col } from '@components/Grid';
import notification from '@components/notification';
import Tooltip from '@components/Tooltip';
import moment from 'moment';

import FormClinicalNotes from '@containers/Forms/ClinicalNotes';
import FormClinicalAlert from '@containers/Forms/ClinicalAlert';

// extract idPrescription from slug.
const extractId = slug => slug.match(/([0-9]+)$/)[0];
// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};

const close = () => {
  window.close();
};

const UnstyledButton = styled.button`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;

  &:hover {
    text-decoration: underline;
  }
`;

export default function PageHeader({ match, pageTitle, prescription, checkScreening, security }) {
  const id = parseInt(extractId(match.params.slug));
  const { isChecking, error } = prescription.check;
  const [isClinicalNotesVisible, setClinicalNotesVisibility] = useState(false);
  const [isClinicalAlertVisible, setClinicalAlertVisibility] = useState(false);

  const onCancelClinicalNotes = () => {
    setClinicalNotesVisibility(false);
  };

  const afterSaveClinicalNotes = () => {
    setClinicalNotesVisibility(false);
  };

  const onCancelClinicalAlert = () => {
    setClinicalAlertVisibility(false);
  };

  const afterSaveClinicalAlert = () => {
    setClinicalAlertVisibility(false);
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    notification.success({ message: 'Número da prescrição copiado!' });
  };

  const now = moment();
  const createDate = moment(prescription.content.date);
  const expireDate = moment(prescription.content.expire);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  if (!prescription.content.idPrescription) {
    return null;
  }

  return (
    <>
      <Row type="flex" css="margin-bottom: 15px;">
        <Col span={24} md={10}>
          <Heading>
            {!prescription.content.agg && (
              <>
                {pageTitle} nº{' '}
                <Tooltip title="Clique para copiar o número da prescrição">
                  <UnstyledButton
                    onClick={() => copyToClipboard(prescription.content.idPrescription)}
                  >
                    {prescription.content.idPrescription}
                  </UnstyledButton>
                </Tooltip>
                <span className={expireDate.diff(now, 'minute') < 0 ? 'legend red' : 'legend'}>
                  Liberada em {prescription.content.dateFormated}
                  {prescription.content.expire && (
                    <>, válida até {prescription.content.expireFormated}</>
                  )}
                  {prescription.content.expire && expireDate.diff(createDate, 'hour') < 23 && (
                    <Tooltip title="Intercorrência">
                      {' '}
                      <InfoIcon />
                    </Tooltip>
                  )}
                </span>
              </>
            )}
            {prescription.content.agg && (
              <>
                Atendimento nº{' '}
                <Tooltip title="Clique para copiar o número do atendimento">
                  <UnstyledButton
                    onClick={() => copyToClipboard(prescription.content.admissionNumber)}
                  >
                    {prescription.content.admissionNumber}
                  </UnstyledButton>
                </Tooltip>
                <span className="legend">
                  Prescrições Agregadas de {prescription.content.dateOnlyFormated}
                </span>
              </>
            )}
          </Heading>
        </Col>
        <Col
          span={24}
          md={24 - 10}
          css="
          text-align: right;

          @media(max-width: 992px) {
            text-align: left;
          }
        "
        >
          {prescription.content.status === '0' && (
            <Button
              type="primary gtm-bt-check"
              ghost
              onClick={() => checkScreening(id, 's')}
              loading={isChecking}
              style={{ marginRight: '5px' }}
            >
              <Icon type="check" />
              Checar
            </Button>
          )}
          {prescription.content.status === 's' && (
            <>
              <span style={{ marginRight: '10px' }}>
                <Icon type="check" /> Prescrição checada
              </span>
              <Tooltip title="Desfazer checagem">
                <Button
                  type="danger gtm-bt-undo-check"
                  onClick={() => checkScreening(id, '0')}
                  loading={isChecking}
                  style={{ marginRight: '5px' }}
                >
                  <Icon type="rollback" style={{ fontSize: 16 }} />
                </Button>
              </Tooltip>
            </>
          )}
          <Button
            type="primary gtm-bt-clinical-notes"
            onClick={() => setClinicalNotesVisibility(true)}
            style={{ marginRight: '5px' }}
            ghost={!prescription.content.notes}
          >
            <Icon type="file-add" />
            Evolução
          </Button>
          <Button
            type="primary gtm-bt-alert"
            onClick={() => setClinicalAlertVisibility(true)}
            style={{ marginRight: '5px' }}
            ghost={!prescription.content.alert}
          >
            <Icon type="alert" />
            Alerta
          </Button>
          <Button type="default gtm-bt-close" onClick={close}>
            Fechar
          </Button>
        </Col>
      </Row>
      <FormClinicalNotes
        visible={isClinicalNotesVisible}
        onCancel={onCancelClinicalNotes}
        okText="Salvar"
        okType="primary"
        cancelText="Cancelar"
        afterSave={afterSaveClinicalNotes}
      />
      <FormClinicalAlert
        visible={isClinicalAlertVisible}
        onCancel={onCancelClinicalAlert}
        okText="Salvar"
        okType="primary"
        cancelText="Cancelar"
        afterSave={afterSaveClinicalAlert}
      />
    </>
  );
}
