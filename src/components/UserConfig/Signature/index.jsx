import React, { useEffect, useState } from 'react';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { Textarea } from '@components/Inputs';
import { Box, EditorBox, ButtonContainer } from '@components/Forms/Form.style';
import Button from '@components/Button';
import Icon from '@components/Icon';
import notification from '@components/notification';

import { SIGNATURE_STORE_ID, SIGNATURE_MEMORY_TYPE } from '@utils/memory';

export default function Signature({ fetchMemory, saveMemory, memory, userId }) {
  const [signature, setSignature] = useState('');
  const { isFetching, list: memoryData } = memory;
  const { isSaving, success, error } = memory.save;
  const memoryType = `${SIGNATURE_MEMORY_TYPE}_${userId}`;

  useEffect(() => {
    fetchMemory(SIGNATURE_STORE_ID, memoryType);
  }, [fetchMemory]); //eslint-disable-line

  useEffect(() => {
    setSignature(memoryData[0] ? memoryData[0].value : '');
  }, [memoryData]);

  useEffect(() => {
    if (success) {
      notification.success({ message: 'Uhu! Assinatura salva com sucesso! :)' });
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Ops! Algo de errado aconteceu.',
        description:
          'Aconteceu algo que nos impediu de salvar os dados desta assinatura. Por favor, tente novamente.'
      });
    }
  }, [error]);

  const save = () => {
    saveMemory(SIGNATURE_STORE_ID, {
      ...memoryData[0],
      id: memoryData[0] ? memoryData[0].key : '',
      type: memoryType,
      value: signature
    });
  };

  return (
    <Box flexDirection="column">
      <Col xs={24} style={{ paddingBottom: '0' }}>
        <Heading as="label" size="14px">
          Assinatura:
        </Heading>
      </Col>
      <Col xs={12} style={{ alignSelf: 'flex-start' }}>
        <EditorBox>
          <Textarea
            autoFocus
            style={{ minHeight: '150px' }}
            disabled={isFetching}
            value={signature}
            onChange={({ target }) => setSignature(target.value)}
          />
        </EditorBox>
        <ButtonContainer>
          <Button
            type="primary gtm-btn-save-signature"
            onClick={() => save()}
            disabled={isFetching || isSaving}
            loading={isSaving}
          >
            Salvar <Icon type="check" />
          </Button>
        </ButtonContainer>
      </Col>
    </Box>
  );
}
