import 'styled-components/macro';
import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';

import Icon from '@components/Icon';
import Heading from '@components/Heading';
import Button from '@components/Button';
import { Row, Col } from '@components/Grid';
import notification from '@components/notification';
import Tooltip from '@components/Tooltip';

import FormClinicalNotes from '@containers/Forms/ClinicalNotes';

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

export default function PageHeader({ match, pageTitle, prescription, checkScreening, security }) {
  const id = parseInt(extractId(match.params.slug));
  const { isChecking, error } = prescription.check;
  const [isClinicalNotesVisible, setClinicalNotesVisibility] = useState(false);

  const onCancelClinicalNotes = () => {
    setClinicalNotesVisibility(false);
  };

  const afterSaveClinicalNotes = () => {
    setClinicalNotesVisibility(false);
  };

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  return (
    <>
      <Row type="flex" css="margin-bottom: 30px;">
        <Col span={24} md={16}>
          <Heading>
            {pageTitle} nº {prescription.content.idPrescription} -{' '}
            {prescription.content.dateFormated}
          </Heading>
        </Col>
        <Col
          span={24}
          md={24 - 16}
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
                  ghost
                  onClick={() => checkScreening(id, '0')}
                  loading={isChecking}
                  style={{ marginRight: '5px' }}
                >
                  <Icon type="rollback" style={{ fontSize: 16 }} />
                </Button>
              </Tooltip>
            </>
          )}
          {security.isAdmin() && (
            <Button
              type="primary gtm-bt-check"
              onClick={() => setClinicalNotesVisibility(true)}
              style={{ marginRight: '5px' }}
              ghost={!prescription.content.notes}
            >
              <Icon type="file-add" />
              Evolução
            </Button>
          )}
          <Button type="default gtm-bt-close" onClick={close}>
            Fechar
          </Button>
        </Col>
      </Row>
      <FormClinicalNotes
        visible={isClinicalNotesVisible}
        onCancel={onCancelClinicalNotes}
        okText="Salvar"
        okType="primary gtm-bt-save-evolucao"
        cancelText="Cancelar"
        afterSave={afterSaveClinicalNotes}
      />
    </>
  );
}
