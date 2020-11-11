import React, { useEffect, useState } from 'react';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { Textarea } from '@components/Inputs';
import { Box, EditorBox, ButtonContainer } from '@components/Forms/Form.style';
import Button from '@components/Button';
import Icon from '@components/Icon';

const SIGNATURE_STORE_ID = 'signature';
const SIGNATURE_MEMORY_TYPE = 'config-signature';

export default function Signature({ fetchMemory, saveMemory, memory }) {
  const [signature, setSignature] = useState('');
  const { isFetching, list: memoryData } = memory;

  useEffect(() => {
    fetchMemory(SIGNATURE_STORE_ID, SIGNATURE_MEMORY_TYPE);
  }, [fetchMemory]);

  useEffect(() => {
    setSignature(memoryData[0] ? memoryData[0].value : '');
  }, [memoryData]);

  const save = () => {
    saveMemory(SIGNATURE_STORE_ID, {
      ...memoryData[0],
      id: memoryData[0] ? memoryData[0].key : '',
      type: SIGNATURE_MEMORY_TYPE,
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
          <Button type="primary" onClick={() => save()} disabled={isFetching}>
            Salvar <Icon type="check" />
          </Button>
        </ButtonContainer>
      </Col>
    </Box>
  );
}
