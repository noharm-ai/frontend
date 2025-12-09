import { useState } from "react";
import type { Key } from "react";
import { Pagination, Flex, Empty } from "antd";
import { PieChartOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "src/store";
import { ExpandableTable } from "components/Table";
import Filter from "./Filter/Filter";
import columns from "./Table/columns";
import expandedRowRender from "./Table/expandedRowRender";
import {
  setCurrentPage,
  fetchReport,
  setSummaryVisibility,
} from "./IndicatorsPanelReportSlice";
import { Summary } from "./Summary/Summary";
import Button from "components/Button";

import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

export default function IndicatorsPanelReport() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.status
  );

  const [expandedRows, setExpandedRows] = useState<Key[]>([]);
  const page = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.currentPage
  );
  const count = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.count
  );
  const filters = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.filters
  );
  const order = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.order
  );
  const datasource = useAppSelector(
    (state) => state.regulation.indicatorsPanelReport.list
  );

  const limit = 100;

  const onPageChange = (newPage: any) => {
    dispatch(setCurrentPage(newPage));

    const params = { ...filters, limit, offset: (newPage - 1) * limit, order };
    setExpandedRows([]);

    dispatch(fetchReport(params));
  };

  const ExpandColumn = ({ expand }: any) => {
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
      setExpandedRows(datasource.map((d: any) => d.id));
    }
  };

  const updateExpandedRows = (list: Key[], key: Key): Key[] => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record: any) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.id));
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Juntos pela Saúde: Indicadores</h1>
          <div className="page-header-legend ">
            Acompanhamento de indicadores
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="default"
            icon={<UnorderedListOutlined />}
            onClick={() => navigate("/relatorios")}
          >
            Ver todos relatórios
          </Button>
          <Button
            onClick={() => dispatch(setSummaryVisibility(true))}
            type="primary"
            icon={<PieChartOutlined />}
          >
            Resumo de Indicadores
          </Button>
        </div>
      </PageHeader>
      <Filter limit={limit} />

      <Flex justify="space-between" align="center">
        <div style={{ flex: 1 }}></div>
        <div>
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
        </div>
      </Flex>

      <PageCard>
        <ExpandableTable<any>
          columns={columns(filters.indicator)}
          pagination={false}
          loading={status === "loading"}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhum registro encontrado."
              />
            ),
          }}
          rowKey="id"
          dataSource={status !== "loading" ? datasource : []}
          showSorterTooltip={false}
          expandedRowRender={expandedRowRender}
          expandedRowKeys={expandedRows}
          columnTitle={<ExpandColumn expand={!expandedRows.length} />}
          onExpand={(_: any, record: any) => handleRowExpand(record)}
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
      <Summary />
    </>
  );
}
