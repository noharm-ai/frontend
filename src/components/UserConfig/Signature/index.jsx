import React from 'react';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { Textarea } from '@components/Inputs';
import { Box, EditorBox, ButtonContainer } from '@components/Forms/Form.style';
import Button from '@components/Button';
import Icon from '@components/Icon';

export default function Signature() {
  const save = () => {
    console.log('save');
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
          <Textarea autoFocus style={{ minHeight: '150px' }} />
        </EditorBox>
        <ButtonContainer>
          <Button type="primary" onClick={() => save()}>
            Salvar <Icon type="check" />
          </Button>
        </ButtonContainer>
      </Col>
    </Box>
  );
}
