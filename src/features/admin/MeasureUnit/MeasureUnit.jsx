import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import columns from "./columns";
import { useTranslation } from "react-i18next";
import { toDataSource } from "utils";
import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import Filter from "./Filter/Filter";
import { setMeasureUnit } from "./MeasureUnitSlice";
import { MeasureUnitForm } from "./Form/MeasureUnitForm";

import { PageContainer } from "styles/Utils.style";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export function MeasureUnit() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.admin.measureUnit.list);
  const status = useSelector((state) => state.admin.measureUnit.status);

  const ds = toDataSource(list, null, {});

  return (
    <PageContainer>
      <PageHeader>
        <h1 className="page-header-title">Unidades de Medida</h1>
      </PageHeader>
      <Filter />
      <PaginationContainer>
        {(ds || []).length} registros encontrados
      </PaginationContainer>
      <PageCard>
        <Table
          columns={columns(setMeasureUnit, dispatch, t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <MeasureUnitForm />
      <BackTop />
    </PageContainer>
  );
}
