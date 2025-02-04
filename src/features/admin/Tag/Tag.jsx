import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "components/Button";
import columns from "./columns";
import { toDataSource } from "utils";
import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import Filter from "./Filter/Filter";
import { setTag } from "./TagSlice";
import { TagForm } from "./Form/TagForm";

import { PageContainer } from "styles/Utils.style";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export function Tag() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.admin.tag.list);
  const status = useSelector((state) => state.admin.tag.status);

  const ds = toDataSource(list, null, {});

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("menu.tag")}</h1>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => dispatch(setTag({ new: true, active: true }))}
          >
            Adicionar marcador
          </Button>
        </div>
      </PageHeader>
      <Filter />
      <PaginationContainer>
        {(ds || []).length} registros encontrados
      </PaginationContainer>
      <PageCard>
        <Table
          columns={columns(setTag, dispatch, t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <TagForm />
      <BackTop />
    </PageContainer>
  );
}
