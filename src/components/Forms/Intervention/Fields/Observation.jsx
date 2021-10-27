import React, { useEffect } from 'react';
import isEmpty from 'lodash.isempty';
import { useTranslation } from 'react-i18next';

import { Col } from '@components/Grid';
import { Textarea } from '@components/Inputs';
import Heading from '@components/Heading';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import notification from '@components/notification';

import { EditorBox } from '@components/Forms/Form.style';

export default function Observations({
  content,
  setFieldValue,
  memory,
  fetchMemory,
  saveMemory,
  currentReason
}) {
  const { t } = useTranslation();
  const isMemoryDisabled = currentReason == null || currentReason.length !== 1;

  useEffect(() => {
    if (!isMemoryDisabled) {
      fetchMemory(`reasonsDefaultText-${currentReason[0]}`);
    }
  }, [fetchMemory, currentReason, isMemoryDisabled]);

  useEffect(() => {
    if (memory.save.success) {
      notification.success({ message: t('success.defaultObservation') });
    }
  }, [memory.save.success, t]);

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
    notification.success({ message: t('success.applyDefaultObservation') });
  };

  const onEdit = observation => {
    setFieldValue('observation', observation);
  };

  const getMemoryTooltip = () => {
    const config = {
      save: t('interventionForm.btnModelSave'),
      apply: t('interventionForm.btnModelApply')
    };

    if (currentReason && currentReason.length > 1) {
      const msg = t('interventionForm.btnModelInvalid');
      return {
        save: msg,
        apply: msg
      };
    }

    if (isMemoryDisabled) {
      const msg = t('interventionForm.btnModelDisabled');
      return {
        save: msg,
        apply: msg
      };
    }

    if (isEmpty(memory.list) || !content) {
      return {
        save: content ? config.save : t('interventionForm.btnModelSaveHint'),
        apply: !isEmpty(memory.list) ? config.apply : t('interventionForm.btnModelEmpty')
      };
    }

    return config;
  };

  const memoryTooltip = getMemoryTooltip();

  return (
    <>
      <Col xs={20} style={{ padding: '0 8px', alignSelf: 'flex-end' }}>
        <Heading as="h4" htmlFor="reason" size="14px">
          {t('interventionForm.labelObservations')}:
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
            value={content || ''}
            onChange={({ target }) => onEdit(target.value)}
            style={{ minHeight: '200px' }}
          />
        </EditorBox>
      </Col>
    </>
  );
}
