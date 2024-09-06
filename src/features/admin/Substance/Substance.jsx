import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Filter from "./Filter/Filter";
import {
  setSubstance,
  setCurrentPage,
  fetchSubstances,
} from "./SubstanceSlice";
import SubstanceForm from "./Form/SubstanceForm";
import { toDataSource } from "utils";
import columns from "./columns";

import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export default function Substance() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.admin.substance.list);
  const status = useSelector((state) => state.admin.substance.status);
  const page = useSelector((state) => state.admin.substance.currentPage);
  const count = useSelector((state) => state.admin.substance.count);
  const filters = useSelector((state) => state.admin.substance.filters);
  const limit = 100;

  const ds = toDataSource(list, null, {});

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));

    const params = { ...filters, limit, offset: (newPage - 1) * limit };

    dispatch(fetchSubstances(params));
  };

  return (
    <>
      <PageHeader>
        <h1 className="page-header-title">Curadoria de Substâncias</h1>
      </PageHeader>
      <Filter limit={limit} />
      <PaginationContainer>
        <Pagination
          onChange={onPageChange}
          current={page}
          total={count}
          showSizeChanger={false}
          pageSize={limit}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} de ${total} itens`
          }
        />
      </PaginationContainer>
      <PageCard>
        <Table
          columns={columns(setSubstance, dispatch, t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <PaginationContainer>
        <Pagination
          onChange={onPageChange}
          current={page}
          total={count}
          showSizeChanger={false}
          pageSize={limit}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} de ${total} itens`
          }
        />
      </PaginationContainer>
      <SubstanceForm />
      <BackTop />
    </>
  );
}
