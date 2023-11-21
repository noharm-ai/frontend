import React from "react";
import { useSelector } from "react-redux";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import columns from "./columns";
import { useTranslation } from "react-i18next";
import { toDataSource } from "utils";
import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import Filter from "./Filter/Filter";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

function Frequency() {
  const { t } = useTranslation();
  const list = useSelector((state) => state.admin.frequency.list);
  const status = useSelector((state) => state.admin.frequency.status);

  const ds = toDataSource(list, null, {});

  return (
    <>
      <PageHeader>
        <h1 className="page-header-title">{t("menu.frequency")}</h1>
      </PageHeader>
      <Filter />
      <PaginationContainer>
        {(ds || []).length} registros encontrados
      </PaginationContainer>
      <PageCard>
        <Table
          columns={columns(false, t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <BackTop />
    </>
  );
}

export default Frequency;
