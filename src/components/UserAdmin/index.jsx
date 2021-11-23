import React, { useEffect, useState, useCallback } from 'react';

import Table from '@components/Table';
import { Row } from 'antd';
import Empty from '@components/Empty';
import Button from '@components/Button';
import Icon from '@components/Icon';
import BackTop from '@components/BackTop';
import notification from '@components/notification';
import userColumns from './User/columns';
import { useTranslation } from 'react-i18next';
import LoadBox from '@components/LoadBox';
import { toDataSource } from '@utils';
import FormUserModal from '@containers/Forms/User';

const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum dado encontrado." />
);

function UserAdmin({ error, list, isFetching, fetchUsersList, single, selectUser }) {
  const [userModalVisible, setUserModalVisibility] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: t('alerts.errorMessage'),
        description: t('alerts.errorDescription')
      });
    }
  }, [error, t]);

  const onShowUserModal = data => {
    selectUser(data);
    setUserModalVisibility(true);
  };

  const addUserModal = () => {
    selectUser({
      new: true,
      active: true
    });
    setUserModalVisibility(true);
  };

  const onCancelUserModal = useCallback(() => {
    setUserModalVisibility(false);
  }, [setUserModalVisibility]);

  const dsUsers = toDataSource(list, null, {
    showModal: onShowUserModal,
    idUser: single
  });

  if (isFetching) {
    return <LoadBox />;
  }

  return (
    <>
      <Row type="flex" justify="end" style={{ marginBottom: '20px' }}>
        <Button type="primary gtm-bt-add-user" onClick={addUserModal}>
          <Icon type="plus" /> {t('userAdminForm.addIcon')}
        </Button>
      </Row>
      <Table
        columns={userColumns(false, t)}
        pagination={false}
        loading={isFetching}
        locale={{ emptyText }}
        dataSource={!isFetching ? dsUsers : []}
      />
      <BackTop />

      <FormUserModal
        visible={userModalVisible}
        onCancel={onCancelUserModal}
        okText={t('userAdminForm.btnSave')}
        okType="primary gtm-bt-save-user"
        cancelText={t('userAdminForm.btnCancel')}
        afterSave={onCancelUserModal}
      />
    </>
  );
}

export default UserAdmin;
