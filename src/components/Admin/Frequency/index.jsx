import React, { useEffect } from "react";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import notification from "components/notification";
import columns from "./columns";
import { useTranslation } from "react-i18next";
import LoadBox from "components/LoadBox";
import { toDataSource } from "utils";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

function Frequency({ fetchList, error, list, isFetching }) {
  const { t } = useTranslation();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: t("userAdminForm.errorMessage"),
        description: t("userAdminForm.errorDescription"),
      });
    }
  }, [error, t]);

  const ds = toDataSource(list, null, {});

  if (isFetching) {
    return <LoadBox />;
  }

  return (
    <>
      <Table
        columns={columns(false, t)}
        pagination={false}
        loading={isFetching}
        locale={{ emptyText }}
        dataSource={!isFetching ? ds : []}
      />
      <BackTop />
    </>
  );
}

export default Frequency;
