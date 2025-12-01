import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Pagination, Row, Col, Spin } from "antd";

import Empty from "components/Empty";

import { PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import Filter from "./Filter/Filter";
import { setCurrentPage } from "./UnitConversionSlice";
import UnitCard from "./UnitCard/UnitCard";
import Actions from "./Actions/Actions";
import DrugReferenceDrawer from "../DrugReferenceDrawer/DrugReferenceDrawer";

export default function UnitConversion() {
  const dispatch = useDispatch();

  const isFetching =
    useSelector((state) => state.admin.unitConversion.status) === "loading";
  const page = useSelector((state) => state.admin.unitConversion.currentPage);
  const datasource = useSelector(
    (state) => state.admin.unitConversion.filteredList
  );
  const drugRef = useSelector((state) => state.admin.drugReferenceDrawer.sctid);
  const filters = useSelector((state) => state.admin.unitConversion.filters);
  const limit = 16;

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const count = datasource.length;

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Curadoria de Unidades</h1>
        </div>
        <div className="page-header-actions">
          <Actions />
        </div>
      </PageHeader>
      <Filter limit={limit} />

      <Spin spinning={isFetching}>
        <div
          style={{
            width: drugRef ? "75%" : "100%",
            transition: "all 0.3s linear",
          }}
        >
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
          <div style={{ margin: "20px 0" }}>
            <Row gutter={[24, 24]}>
              {datasource.length ? (
                datasource
                  .slice((page - 1) * limit, (page - 1) * limit + limit)
                  .map((i) => (
                    <Col
                      xs={12}
                      md={drugRef ? 12 : 8}
                      xxl={drugRef ? 8 : 6}
                      key={i.idDrug}
                    >
                      <UnitCard {...i} />
                    </Col>
                  ))
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      filters.idSegment
                        ? "Nenhuma conversão encontrada."
                        : "Selecione os segmento referência para visualizar as conversões. Esta lista pode demorar alguns minutos para ser gerada."
                    }
                  />
                </div>
              )}
            </Row>
          </div>
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
        </div>
      </Spin>

      <DrugReferenceDrawer />
    </>
  );
}
