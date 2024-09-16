import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";

import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import Filter from "./Filter/Filter";
import columns from "./Table/columns";
import expandedRowRender from "./Table/expandedRowRender";
import { setCurrentPage, fetchDrugAttributes } from "./DrugAttributesSlice";
import { getSubstances } from "features/lists/ListsSlice";
import Actions from "./Actions/Actions";
import DrugReferenceDrawer from "../DrugReferenceDrawer/DrugReferenceDrawer";

export default function DrugAttributes() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isFetching =
    useSelector((state) => state.admin.drugAttributes.status) === "loading";

  const [expandedRows, setExpandedRows] = useState([]);
  const page = useSelector((state) => state.admin.drugAttributes.currentPage);
  const count = useSelector((state) => state.admin.drugAttributes.count);
  const filters = useSelector((state) => state.admin.drugAttributes.filters);
  const drugList = useSelector((state) => state.admin.drugAttributes.list);
  const limit = 30;

  useEffect(() => {
    dispatch(getSubstances({ useCache: true }));
  }, [dispatch]);

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));

    const params = { ...filters, limit, offset: (newPage - 1) * limit };
    setExpandedRows([]);

    dispatch(fetchDrugAttributes(params));
  };

  const reload = () => {
    onPageChange(1);
  };

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
      setExpandedRows(drugList.map((d) => `${d.idSegment}-${d.idDrug}`));
    }
  };

  const datasource = drugList.map((d) => ({
    key: `${d.idSegment}-${d.idDrug}`,
    ...d,
  }));

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Curadoria de Medicamentos</h1>
        </div>
        <div className="page-header-actions">
          <Actions reload={reload} />
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
        <ExpandableTable
          columns={columns(t)}
          pagination={false}
          loading={isFetching}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhum medicamento encontrado."
              />
            ),
          }}
          dataSource={!isFetching ? datasource : []}
          showSorterTooltip={false}
          expandedRowRender={expandedRowRender}
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
          pageSize={limit}
          showSizeChanger={false}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} de ${total} itens`
          }
        />
      </PaginationContainer>
      <DrugReferenceDrawer />
    </>
  );
}
