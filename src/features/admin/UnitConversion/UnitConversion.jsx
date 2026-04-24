import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Pagination, Row, Col, Spin } from "antd";

import Empty from "components/Empty";
import Progress from "components/Progress";

import { PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import { ProgressContainer, KeyboardHintBar } from "./UnitConversion.style";

import Filter from "./Filter/Filter";
import { setCurrentPage } from "./UnitConversionSlice";
import { isValidConversion } from "./transformer";
import UnitCard from "./UnitCard/UnitCard";
import Actions from "./Actions/Actions";
import DrugReferenceDrawer from "../DrugReferenceDrawer/DrugReferenceDrawer";
import SubstanceForm from "features/admin/Substance/Form/SubstanceForm";

export default function UnitConversion() {
  const dispatch = useDispatch();

  const isFetching =
    useSelector((state) => state.admin.unitConversion.status) === "loading";
  const page = useSelector((state) => state.admin.unitConversion.currentPage);
  const datasource = useSelector(
    (state) => state.admin.unitConversion.filteredList,
  );
  const drugRef = useSelector((state) => state.admin.drugReferenceDrawer.sctid);
  const filters = useSelector((state) => state.admin.unitConversion.filters);
  const limit = 16;

  const [focusedDrugId, setFocusedDrugId] = useState(null);
  const cardRefs = useRef([]);

  // Derive index from ID so filter/reload resets focus automatically (no effect needed)
  const focusedIndex =
    focusedDrugId !== null
      ? datasource.findIndex((d) => d.idDrug === focusedDrugId)
      : -1;

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const navigateTo = (newIndex) => {
      const targetPage = Math.floor(newIndex / limit) + 1;
      if (targetPage !== page) {
        dispatch(setCurrentPage(targetPage));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setFocusedDrugId(datasource[newIndex]?.idDrug ?? null);
    };

    const handleKeyDown = (e) => {
      if (document.querySelector(".ant-modal-mask")) return;
      if (datasource.length === 0) return;

      const isInInput =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === "s") {
        e.preventDefault();
        if (focusedIndex >= 0) {
          const slot = focusedIndex - (page - 1) * limit;
          cardRefs.current[slot]?.save();
        }
        return;
      }

      if (isMod && e.key === "i") {
        e.preventDefault();
        if (focusedIndex >= 0) {
          const slot = focusedIndex - (page - 1) * limit;
          cardRefs.current[slot]?.applyPredictions();
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (isInInput) {
          document.activeElement.blur();
        } else {
          setFocusedDrugId(null);
        }
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex >= 0) {
          const slot = focusedIndex - (page - 1) * limit;
          if (isInInput) {
            cardRefs.current[slot]?.save();
            document.activeElement.blur();
          } else {
            cardRefs.current[slot]?.focusFirstInput();
          }
        }
        return;
      }

      if (isInInput) return;

      if (e.key === "r") {
        e.preventDefault();
        if (focusedIndex >= 0) {
          const slot = focusedIndex - (page - 1) * limit;
          cardRefs.current[slot]?.showRef();
        }
      } else if (e.key === "Home" || e.key === "g") {
        e.preventDefault();
        navigateTo(0);
      } else if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        navigateTo(
          focusedIndex < 0
            ? 0
            : Math.min(focusedIndex + 1, datasource.length - 1),
        );
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        if (focusedIndex >= 0) navigateTo(Math.max(focusedIndex - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, focusedDrugId, datasource, page, limit, dispatch]);

  const count = datasource.length;
  const completedCount = datasource.filter((drug) =>
    isValidConversion(drug.data),
  ).length;
  const percentage = count > 0 ? Math.round((completedCount / count) * 100) : 0;

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
          <PaginationContainer style={{ justifyContent: "space-between" }}>
            <div>
              {count > 0 && (
                <ProgressContainer>
                  <div className="progress-header">
                    <span>Conversões preenchidas</span>
                    <span className="progress-count">
                      {completedCount} de {count} medicamentos
                    </span>
                  </div>
                  <Progress
                    percent={percentage}
                    strokeColor={{
                      "0%": "rgb(112, 189, 196)",
                      "100%": "rgb(126, 190, 154)",
                    }}
                  />
                </ProgressContainer>
              )}
            </div>
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
                  .map((i, slotIndex) => {
                    return (
                      <Col
                        xs={12}
                        md={drugRef ? 12 : 8}
                        xxl={drugRef ? 8 : 6}
                        key={i.idDrug}
                      >
                        <UnitCard
                          {...i}
                          showPredictions={filters.showPredictions}
                          isFocused={i.idDrug === focusedDrugId}
                          ref={(el) => {
                            cardRefs.current[slotIndex] = el;
                          }}
                        />
                      </Col>
                    );
                  })
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
                    description="Nenhuma conversão encontrada."
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
          <KeyboardHintBar>
            <span className="hint-item">
              <kbd>Home</kbd>
              <kbd>g</kbd> primeiro
            </span>
            <span className="hint-item">
              <kbd>↓</kbd>
              <kbd>j</kbd> próximo
            </span>
            <span className="hint-item">
              <kbd>↑</kbd>
              <kbd>k</kbd> anterior
            </span>
            <span className="hint-item">
              <kbd>Enter</kbd> editar / salvar
            </span>
            <span className="hint-item">
              <kbd>Ctrl</kbd>+<kbd>I</kbd> inferir
            </span>
            <span className="hint-item">
              <kbd>r</kbd> referência
            </span>
            <span className="hint-item">
              <kbd>Esc</kbd> sair
            </span>
          </KeyboardHintBar>
        </div>
      </Spin>

      <DrugReferenceDrawer placement="right" />
      <SubstanceForm />
    </>
  );
}
