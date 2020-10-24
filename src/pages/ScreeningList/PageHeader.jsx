import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';

import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';
import Switch from '@components/Switch';

export default function PageHeader({ journey, prioritizationType, setJourney }) {
  const { t } = useTranslation();
  const [stateChecked, setStateChecked] = useState(false);
  const title = `screeningList.title-${prioritizationType}`;
  const name = prioritizationType === 'prescription' ? 'prescrição' : 'paciente';
  const msg =
    journey === prioritizationType
      ? 'Priorização padrão'
      : `Definir a priorização por ${name} como tela inicial`;

  const onChangeJourney = checked => {
    if (checked) {
      setJourney(prioritizationType);
      setStateChecked(true);
    }
  };

  return (
    <>
      <Row type="flex" css="margin-bottom: 15px;">
        <Col span={24} md={10}>
          <header style={{ marginBottom: '30px' }}>
            <Heading>{t(title)}</Heading>
          </header>
        </Col>
        <Col span={24} md={24 - 10} style={{ textAlign: 'right' }}>
          {(journey !== prioritizationType || stateChecked) && (
            <Tooltip title={msg}>
              <Switch
                unCheckedChildren="Padrão"
                onChange={onChangeJourney}
                checked={journey === prioritizationType}
                disabled={journey === prioritizationType}
              />
            </Tooltip>
          )}
        </Col>
      </Row>
    </>
  );
}
