import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";

import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import Filter from "./Filter/Filter";
import columns from "./Table/columns";
import { setCurrentPage, fetchDrugAttributes } from "./DrugAttributesSlice";
import Actions from "./Actions/Actions";

export default function DrugAttributes() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isFetching =
    useSelector((state) => state.admin.drugAttributes.status) === "loading";

  const page = useSelector((state) => state.admin.drugAttributes.currentPage);
  const count = useSelector((state) => state.admin.drugAttributes.count);
  const filters = useSelector((state) => state.admin.drugAttributes.filters);
  const drugList = useSelector((state) => state.admin.drugAttributes.list);
  const limit = 50;

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));

    const params = { ...filters, limit, offset: (newPage - 1) * limit };

    dispatch(fetchDrugAttributes(params));
  };

  const reload = () => {
    onPageChange(1);
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
    </>
  );
}
