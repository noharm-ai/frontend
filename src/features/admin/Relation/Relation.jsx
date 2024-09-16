import React, { useState } from "react";
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
import columns from "./Table/columns";
import expandedRowRender from "./Table/expandedRowRender";

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
  const [expandedRows, setExpandedRows] = useState([]);
  const limit = 100;

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.key));
  };

  const ExpandColumn = ({ expand }) => {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className={`expand-all ant-table-row-expand-icon ${
            expand ? "ant-table-row-expand-icon-collapsed" : ""
          }`}
          onClick={toggleExpansion}
        ></button>
      </div>
    );
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(list.map((d) => `${d.sctida}-${d.sctidb}-${d.kind}`));
    }
  };

  const ds = list.map((r) => ({
    key: `${r.sctida}-${r.sctidb}-${r.kind}`,
    ...r,
  }));

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
          expandedRowRender={expandedRowRender(t)}
          expandedRowKeys={expandedRows}
          columnTitle={<ExpandColumn expand={!expandedRows.length} />}
          onExpand={(expanded, record) => handleRowExpand(record)}
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
