import React, { useEffect, useRef } from 'react';
import isEmpty from 'lodash.isempty';

import { Col } from '@components/Grid';
import { Textarea } from '@components/Inputs';
import Heading from '@components/Heading';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import notification from '@components/notification';
import stripHtml from '@utils/stripHtml';

import { EditorBox } from '@components/Forms/Form.style';

export default function Observations({
  content,
  setFieldValue,
  memory,
  fetchMemory,
  saveMemory,
  currentReason
}) {
  const text = useRef(content || '');
  const isMemoryDisabled = currentReason == null || currentReason.length !== 1;

  useEffect(() => {
    if (!isMemoryDisabled) {
      fetchMemory(`reasonsDefaultText-${currentReason[0]}`);
    }
  }, [fetchMemory, currentReason, isMemoryDisabled]);

  useEffect(() => {
    if (memory.save.success) {
      notification.success({ message: 'Uhu! Observação modelo salva com sucesso!' });
    }
  }, [memory.save.success]);

  useEffect(() => {
    text.current = content ? stripHtml(content) : '';
  }, []); // eslint-disable-line

  const saveDefaultText = () => {
    const payload = {
      type: `reasonsDefaultText-${currentReason[0]}`,
      value: { text: content }
    };

    if (!isEmpty(memory.list)) {
      payload.id = memory.list[0].key;
    }
    saveMemory(payload);
  };

  const loadDefaultText = () => {
    setFieldValue('observation', memory.list[0].value.text);
    text.current = memory.list[0].value.text;
    notification.success({ message: 'Observação modelo aplicada com sucesso!' });
  };

  const onEdit = observation => {
    setFieldValue('observation', observation);
    text.current = observation;
  };

  const getMemoryTooltip = () => {
    const config = { save: 'Salvar observação modelo', apply: 'Aplicar observação modelo' };

    if (currentReason && currentReason.length > 1) {
      const msg =
        'Modelos: Esta funcionalidade é desabilitada quando múltiplos motivos são selecionados';
      return {
        save: msg,
        apply: msg
      };
    }

    if (isMemoryDisabled) {
      const msg = 'Modelos: Selecione um motivo para liberar esta funcionalidade';
      return {
        save: msg,
        apply: msg
      };
    }

    if (isEmpty(memory.list) || !content) {
      return {
        save: content ? config.save : 'Preencha o texto para salvar como modelo',
        apply: !isEmpty(memory.list) ? config.apply : 'Este motivo ainda não possui um modelo salvo'
      };
    }

    return config;
  };

  const memoryTooltip = getMemoryTooltip();

  return (
    <>
      <Col xs={20} style={{ padding: '0 8px' }}>
        <Heading as="h4" htmlFor="reason" size="14px">
          Observações:
        </Heading>
      </Col>
      <Col xs={4} style={{ paddingTop: '4px', paddingBottom: '0' }}>
        <div style={{ textAlign: 'right' }}>
          <Tooltip title={memoryTooltip.save}>
            <Button
              shape="circle"
              icon="save"
              loading={memory.isFetching || memory.save.isSaving}
              onClick={saveDefaultText}
              disabled={isMemoryDisabled || !content}
              style={{ marginRight: '5px' }}
              type="nda gtm-bt-interv-mem-save"
            />
          </Tooltip>
          <Tooltip title={memoryTooltip.apply}>
            <Button
              shape="circle"
              icon="download"
              loading={memory.isFetching || memory.save.isSaving}
              onClick={loadDefaultText}
              disabled={isMemoryDisabled || isEmpty(memory.list)}
              type={!isEmpty(memory.list) ? 'primary gtm-bt-interv-mem-apply' : ''}
            />
          </Tooltip>
        </div>
      </Col>
      <Col xs={24} style={{ padding: '7px 8px' }}>
        <EditorBox>
          <Textarea
            autoFocus
            value={text.current || ''}
            onChange={({ target }) => onEdit(target.value)}
            style={{ minHeight: '200px' }}
          />
        </EditorBox>
      </Col>
    </>
  );
}
