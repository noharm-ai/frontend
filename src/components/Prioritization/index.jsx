import React, { useEffect, useReducer } from "react";
import isEmpty from "lodash.isempty";
import debounce from "lodash.debounce";
import { useTransition, animated } from "@react-spring/web";
import { Spin, Pagination, Tag, Empty, Alert, Affix } from "antd";
import { useTranslation } from "react-i18next";
import { CaretUpOutlined } from "@ant-design/icons";

import Heading from "components/Heading";
import notification from "components/notification";
import { Select } from "components/Inputs";
import BackTop from "components/BackTop";
import { Input } from "components/Inputs";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import { Row, Col } from "components/Grid";
import InitialPage from "features/preferences/InitialPage/InitialPage";
import FeatureService from "services/features";

import Filter from "./Filter";
import PrioritizationCard from "./Card";
import { reducer, initState } from "./Store";
import {
  sortList,
  filterList,
  getListStats,
  PAGE_SIZE,
  ORDER_OPTIONS,
} from "./Util";
import { PrioritizationPage, FilterCard, ResultActions } from "./index.style";

export default function Prioritization({
  prescriptions,
  fetchPrescriptionsList,
  fetchFrequencies,
  checkScreening,
  prioritizationType,
  siderCollapsed,
  features,
  setJourney,
  currentJourney,
  ...restProps
}) {
  const [state, dispatch] = useReducer(reducer, initState());
  const { isFetching, list, error } = prescriptions;
  const { t } = useTranslation();
  const featureService = FeatureService(features);

  const filteredList = sortList(
    filterList(list, state.filter),
    state.prioritization,
    state.prioritizationOrder
  );

  const patients =
    isFetching || state.loading
      ? []
      : filteredList.slice(
          (state.currentPage - 1) * PAGE_SIZE,
          (state.currentPage - 1) * PAGE_SIZE + PAGE_SIZE
        );

  const transitions = useTransition(patients, {
    from: {
      transform: "translate3d(0, 40px, 0)",
      opacity: 0,
    },
    enter: { transform: "translate3d(0,0px,0)", opacity: 1 },
    trail: 100,
    keys: (item) => `${item.idPrescription}`,
  });

  useEffect(() => {
    const errorMessage = {
      message: t("error.title"),
      description: error?.message || t("error.description"),
    };

    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error, t]);

  useEffect(() => {
    dispatch({
      type: "after_update_list",
      payload: getListStats(list),
    });
  }, [list]);

  useEffect(() => {
    dispatch({
      type: "set_page",
      payload: 1,
    });
  }, [list.length]);

  const stopLoading = () => {
    setTimeout(() => {
      dispatch({
        type: "set_loading",
        payload: false,
      });

      window.scrollTo({ top: 250, behavior: "smooth" });
    }, 150);
  };

  const onChangePage = (page, scroll) => {
    dispatch({ type: "set_page", payload: page });
    if (scroll) {
      window.scrollTo({ top: 250, behavior: "smooth" });
    }
  };

  const onChangeStatus = (value) => {
    dispatch({
      type: "set_filter",
      payload: {
        status: !value || value === "all" ? null : value,
      },
    });

    stopLoading();
  };

  const onChangePrioritization = (value) => {
    dispatch({
      type: "set_prioritization",
      payload: value,
    });

    stopLoading();
  };

  const toggleOrder = () => {
    dispatch({
      type: "set_prioritization_order",
      payload: state.prioritizationOrder === "desc" ? "asc" : "desc",
    });

    stopLoading();
  };

  const onClientSearch = (ev) => {
    ev.persist();

    if (ev.target.value === "") {
      dispatch({
        type: "set_filter_direct",
        payload: {
          searchKey: null,
        },
      });

      return;
    }

    debounce((e) => {
      if (e.target.value !== "" && e.target.value.length > 3) {
        dispatch({
          type: "set_filter_direct",
          payload: {
            searchKey: e.target.value.toLowerCase(),
          },
        });
      } else if (state.filter.searchKey) {
        dispatch({
          type: "set_filter_direct",
          payload: {
            searchKey: null,
          },
        });
      }
    }, 800)(ev);
  };

  return (
    <>
      <Row align="middle">
        <Col span={24} md={10}>
          <header>
            <Heading>Priorização por Pacientes</Heading>
          </header>
        </Col>
        <Col span={24} md={24 - 10} style={{ textAlign: "right" }}>
          <InitialPage />
        </Col>
      </Row>

      <FilterCard>
        <Filter
          {...restProps}
          fetchFrequencies={fetchFrequencies}
          prioritizationType={prioritizationType}
          fetchPrescriptionsList={fetchPrescriptionsList}
          isFetchingPrescription={isFetching}
          featureService={featureService}
        />
      </FilterCard>
      <Spin spinning={isFetching || state.loading}>
        <Affix
          offsetTop={0}
          onChange={(value) =>
            dispatch({
              type: "set_affixed",
              payload: value,
            })
          }
        >
          <ResultActions className={state.affixed ? "affixed" : ""}>
            <div className="filters">
              <div className="filters-item">
                <div className="filters-item-label">Priorizar por:</div>
                <div className="filters-item-value flex">
                  <Select
                    className="prioritization-select"
                    optionFilterProp="children"
                    onChange={onChangePrioritization}
                    onMouseEnter={() =>
                      dispatch({
                        type: "highlight_prioritization",
                        payload: true,
                      })
                    }
                    onMouseLeave={() =>
                      dispatch({
                        type: "highlight_prioritization",
                        payload: false,
                      })
                    }
                    value={state.prioritization}
                    style={{ width: 200 }}
                  >
                    {ORDER_OPTIONS.map((o) => (
                      <Select.Option value={o.key} key={o.key}>
                        {o.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <div>
                    <Tooltip title="Alterar ordem">
                      <Button
                        className={`gtm-btn-change-order ${
                          state.prioritizationOrder === "desc"
                            ? "order-desc"
                            : "order-asc"
                        }`}
                        shape="circle"
                        icon={<CaretUpOutlined />}
                        onClick={toggleOrder}
                        style={{ marginLeft: "5px" }}
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>

              <div className="filters-item">
                <div className="filters-item-label">Situação:</div>
                <div className="filters-item-value">
                  <Select
                    placeholder="Situação"
                    optionFilterProp="children"
                    defaultValue="all"
                    onChange={onChangeStatus}
                    value={state.filter.status || "all"}
                  >
                    <Select.Option value="0" key="pending">
                      Pendentes{" "}
                      <Tag color="orange">{state.listStats.pending}</Tag>
                    </Select.Option>
                    <Select.Option value="s" key="checked">
                      Checadas{" "}
                      <Tag color="green">{state.listStats.checked}</Tag>
                    </Select.Option>
                    <Select.Option value="all" key="all">
                      Todas <Tag>{state.listStats.all}</Tag>
                    </Select.Option>
                  </Select>
                </div>
              </div>

              <div className="filters-item">
                <div className="filters-item-label">
                  Buscar por atendimento/nome:
                </div>
                <div className="filters-item-value">
                  <Input
                    className="search-input"
                    allowClear
                    onChange={onClientSearch}
                  />
                </div>
              </div>
            </div>
            <div className="pagination">
              <Pagination
                current={state.currentPage}
                total={filteredList && filteredList.length}
                hideOnSinglePage={true}
                pageSize={PAGE_SIZE}
                showSizeChanger={false}
                onChange={(page) => onChangePage(page, true)}
              />
            </div>
          </ResultActions>
        </Affix>
        <PrioritizationPage collapsed={siderCollapsed}>
          <>
            {!(isFetching || state.loading) && !filteredList.length && (
              <Empty description="Nenhum registro encontrado" />
            )}
            {filteredList &&
              filteredList.length > 0 &&
              filteredList[0].totalRecords > 500 && (
                <div className="alert-container">
                  <Alert
                    message="A lista foi limitada em 500 registros."
                    description={`Existe um total de ${filteredList[0].totalRecords} registros para a sua consulta. Utilize mais filtros para direcionar a sua análise.`}
                    showIcon
                  />
                </div>
              )}
            {filteredList && filteredList.length > 0 && (
              <div className="grid">
                {transitions((props, item) => (
                  <animated.div style={props}>
                    <PrioritizationCard
                      prescription={item}
                      prioritizationType={prioritizationType}
                      prioritization={ORDER_OPTIONS.find(
                        (i) => i.key === state.prioritization
                      )}
                      highlight={state.highlightPrioritization}
                      featureService={featureService}
                    />
                  </animated.div>
                ))}
              </div>
            )}
          </>
        </PrioritizationPage>
        <ResultActions>
          <div className="filters"></div>
          <div className="pagination">
            <Pagination
              current={state.currentPage}
              total={filteredList && filteredList.length}
              hideOnSinglePage={true}
              pageSize={PAGE_SIZE}
              showSizeChanger={false}
              onChange={(page) => onChangePage(page, true)}
            />
          </div>
        </ResultActions>
      </Spin>
      <BackTop />
    </>
  );
}
