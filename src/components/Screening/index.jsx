import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';

import breakpoints from '@styles/breakpoints';
import { useMedia } from '@lib/hooks';
import { toDataSource } from '@utils';
import Table from '@components/Table';
import Empty from '@components/Empty';
import LoadBox from '@components/LoadBox';
import { Row, Col } from '@components/Grid';
import notification from '@components/notification';

import Modal from './Modal';
import Patient from './Patient';
import columnsTable, { defaultAction, desktopAction } from './columns';

// extract idPrescription from slug.
const extractId = slug => slug.match(/([0-9]+)$/)[0];
// empty text for table result.
const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhuma prescrição encontrada." />
);
// error message when fetch has error.
const errorMessage = {
  message: 'Ops! Algo de errado aconteceu.',
  description: 'Aconteceu algo que nos impediu de lhe mostrar os dados, por favor, tente novamente.'
};
// save message when saved intervention.
const saveMessage = {
  message: 'Uhu! Intervenção salva com sucesso! :)'
};
const noop = () => {};
const theTitle = () => 'Deslize para a direita para ver mais conteúdo.';

export default function Screening({
  match,
  prescription,
  segment,
  maybeCreateOrUpdate,
  save,
  reset,
  select,
  fetchScreeningById,
  fetchPrescriptionById
}) {
  const id = extractId(match.params.slug);
  const { isFetching, content, error } = prescription;
  const { prescription: drugList } = content;
  const { isSaving, wasSaved, item } = maybeCreateOrUpdate;

  const [visible, setVisibility] = useState(false);
  const columns = useMedia(
    [`(min-width: ${breakpoints.lg})`],
    [[...columnsTable, desktopAction]],
    [...columnsTable, defaultAction]
  );
  const [title] = useMedia([`(max-width: ${breakpoints.lg})`], [[theTitle]], [noop]);

  const onSave = () => save(item);
  const onCancel = () => {
    select({});
    setVisibility(false);
  };
  const onShowModal = data => {
    select(data);
    setVisibility(true);
  };

  // extra resources to add in table item.
  const bag = {
    onShowModal
  };

  const dataSource = toDataSource(drugList, 'idPrescriptionDrug', bag);

  // fetch data
  useEffect(() => {
    fetchScreeningById(id);
  }, [id, fetchScreeningById]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]);

  // handle after save intervention.
  useEffect(() => {
    if (wasSaved) {
      reset();
      setVisibility(false);
      fetchPrescriptionById(id);

      notification.success(saveMessage);
    }
  }, [wasSaved, id, fetchPrescriptionById, reset]);

  return (
    <>
      <Row type="flex" gutter={24}>
        <Col span={24} md={7}>
          {isFetching ? <LoadBox /> : <Patient {...content} segment={segment} />}
        </Col>
        <Col span={24} md={24 - 7}>
          <Table
            title={title}
            columns={columns}
            pagination={false}
            scroll={{ x: 800 }}
            loading={isFetching}
            locale={{ emptyText }}
            dataSource={!isFetching ? dataSource : []}
          />
        </Col>
      </Row>

      <Modal
        onOk={onSave}
        visible={visible}
        onCancel={onCancel}
        confirmLoading={isSaving}
        okButtonProps={{
          disabled: isSaving || (!isEmpty(item) && !item.intervention.idInterventionReason)
        }}
        cancelButtonProps={{
          disabled: isSaving
        }}
      />
    </>
  );
}
