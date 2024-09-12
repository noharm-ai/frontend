import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "components/Button";
import Filter from "./Filter/Filter";
import { setRelation, setCurrentPage, fetchRelations } from "./RelationsSlice";
import RelationForm from "./Form/RelationForm";
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

export default function Relation() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.admin.relation.list);
  const status = useSelector((state) => state.admin.relation.status);
  const page = useSelector((state) => state.admin.relation.currentPage);
  const count = useSelector((state) => state.admin.relation.count);
  const filters = useSelector((state) => state.admin.relation.filters);
  const limit = 100;

  const ds = toDataSource(list, null, {});

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));

    const params = { ...filters, limit, offset: (newPage - 1) * limit };

    dispatch(fetchRelations(params));
  };

  const addNew = () => {
    if (filters.idOriginList?.length > 0) {
      dispatch(
        setRelation({
          new: true,
          active: true,
          sctida: filters.idOriginList[0],
        })
      );
    } else {
      dispatch(setRelation({ new: true, active: true }));
    }
  };

  return (
    <>
      <PageHeader>
        <h1 className="page-header-title">
          Curadoria de Relações Medicamentosas
        </h1>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => addNew()}
          >
            Adicionar relação
          </Button>
        </div>
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
          columns={columns(setRelation, dispatch, t)}
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
      <RelationForm />
      <BackTop />
    </>
  );
}
