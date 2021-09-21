import React, { useEffect } from 'react';

import Table from '@components/Table';
import Empty from '@components/Empty';
import BackTop from '@components/BackTop';
import notification from '@components/notification';
import userColumns from './User/columns';
import './index.css';
import LoadBox from '@components/LoadBox';

const emptyText = (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum dado encontrado." />
);

function UserAdmin({ error, list, isFetching, fetchUsersList }) {
  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: 'Ops! Algo de errado aconteceu.',
        description:
          'Aconteceu algo que nos impediu de salvar os usuários editados. Por favor, tente novamente.'
      });
    }
  }, [error]);

  if (isFetching) {
    return <LoadBox />;
  }

  return (
    <>
      <Table
        columns={userColumns(false)}
        pagination={false}
        loading={isFetching}
        locale={{ emptyText }}
        dataSource={!isFetching ? list : []}
      />
      <BackTop />
    </>
  );
}

export default UserAdmin;
