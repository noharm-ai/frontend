import React, { useEffect, useReducer } from "react";
import isEmpty from "lodash.isempty";
import debounce from "lodash.debounce";
import { useTransition, animated } from "@react-spring/web";
import { Spin, Pagination, Tag, Empty } from "antd";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import notification from "components/notification";
import { Select } from "components/Inputs";
import BackTop from "components/BackTop";
import { Input } from "components/Inputs";

import Filter from "./Filter";
import PrioritizationCard from "./Card";
import { PrioritizationPage, FilterCard, ResultActions } from "./index.style";

const PAGE_SIZE = 24;
const ORDER_OPTIONS = [
  {
    label: "Escore global",
    key: "globalScore",
    formattedKey: "globalScore",
    type: "number",
  },
  {
    label: "Idade",
    key: "birthdays",
    formattedKey: "age",
    type: "number",
  },
  {
    label: "Exames alterados",
    key: "alertExams",
    formattedKey: "alertExams",
    type: "number",
  },
  {
    label: "Alertas na prescrição",
    key: "alerts",
    formattedKey: "alerts",
    type: "number",
  },
  // TODO: only for noharmcare
  {
    label: "Eventos adversos",
    key: "complication",
    formattedKey: "complication",
    type: "number",
  },
  {
    label: "Antimicrobianos",
    key: "am",
    formattedKey: "am",
    type: "number",
  },
  {
    label: "Alta vigilância",
    key: "av",
    formattedKey: "av",
    type: "number",
  },
  {
    label: "Controlados",
    key: "controlled",
    formattedKey: "controlled",
    type: "number",
  },
  {
    label: "Não padronizados",
    key: "np",
    formattedKey: "np",
    type: "number",
  },
  {
    label: "Alerta de sonda",
    key: "tube",
    formattedKey: "tube",
    type: "number",
  },
  {
    label: "Diferentes",
    key: "diff",
    formattedKey: "diff",
    type: "number",
  },
  {
    label: "Intervenções pendente",
    key: "interventions",
    formattedKey: "interventions",
    type: "number",
  },
  {
    label: "Escore prescrição",
    key: "prescriptionScore",
    formattedKey: "prescriptionScore",
    type: "number",
  },
].sort((a, b) => a.label.localeCompare(b.label));

const getListStats = (list) => {
  const listStats = {
    checked: 0,
    pending: 0,
    all: list.length,
  };

  list.forEach((item) => {
    if (item.status === "s") {
      listStats.checked += 1;
    } else {
      listStats.pending += 1;
    }
  });

  return listStats;
};

const filterList = (list, filter) => {
  let newList = [...list];
  if (filter.status) {
    newList = newList.filter((i) => i.status === filter.status);
  }

  if (filter.searchKey) {
    newList = newList.filter(
      (i) =>
        i.namePatient.toLowerCase().includes(filter.searchKey) ||
        `${i.admissionNumber}`.includes(filter.searchKey)
    );
  }

  return newList;
};

const sortList = (list, orderBy) => {
  return list.sort((a, b) => b[orderBy] - a[orderBy]);
};

const initState = () => {
  return {
    loading: false,
    currentPage: 1,
    filter: {},
    prioritization: "globalScore",
    highlightPrioritization: false,
    listStats: getListStats([]),
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case "set_loading":
      return { ...state, loading: action.payload };
    case "set_page":
      return { ...state, currentPage: action.payload };
    case "set_filter":
      return {
        ...state,
        loading: true,
        currentPage: 1,
        filter: { ...state.filter, ...action.payload },
      };
    case "set_filter_direct":
      return {
        ...state,
        currentPage: 1,
        filter: { ...state.filter, ...action.payload },
      };
    case "set_prioritization":
      return {
        ...state,
        loading: true,
        currentPage: 1,
        prioritization: action.payload,
      };
    case "after_update_list":
      return {
        ...state,
        filter: {},
        listStats: action.payload,
      };
    case "highlight_prioritization":
      return {
        ...state,
        highlightPrioritization: action.payload,
      };
    case "reset":
      return initState(action.payload);
    default:
      throw new Error();
  }
};

export default function Prioritization({
  prescriptions,
  fetchSegmentsList,
  fetchPrescriptionsList,
  checkScreening,
  prioritizationType,
  security,
  siderCollapsed,
  ...restProps
}) {
  const [state, dispatch] = useReducer(reducer, initState());
  const { isFetching, list, error } = prescriptions;
  const { t } = useTranslation();

  const filteredList = sortList(
    filterList(list, state.filter),
    state.prioritization
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
      description: t("error.description"),
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
    }, 150);
  };

  const onChangePage = (page) => {
    dispatch({ type: "set_page", payload: page });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <Heading>Priorização por Pacientes (Beta)</Heading>
      <FilterCard>
        <Filter
          {...restProps}
          prioritizationType={prioritizationType}
          fetchPrescriptionsList={fetchPrescriptionsList}
          isFetchingPrescription={isFetching}
          hasPeriodLimit={!security.hasRole("nolimit")}
        />
      </FilterCard>
      <Spin spinning={isFetching || state.loading}>
        <ResultActions>
          <div className="filters">
            <div className="filters-item">
              <div className="filters-item-label">Priorizar por:</div>
              <div className="filters-item-value">
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
                >
                  {ORDER_OPTIONS.map((o) => (
                    <Select.Option value={o.key} key={o.key}>
                      {o.label}
                    </Select.Option>
                  ))}
                </Select>
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
                    Checadas <Tag color="green">{state.listStats.checked}</Tag>
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
                  style={{ width: 300 }}
                  allowClear
                  onChange={onClientSearch}
                  // className={filter.searchKey ? "active" : ""}
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
              onChange={(page) => onChangePage(page)}
            />
          </div>
        </ResultActions>
        <PrioritizationPage collapsed={siderCollapsed}>
          <>
            {!(isFetching || state.loading) && !filteredList.length && (
              <Empty description="Nenhum registro encontrado" />
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
              onChange={(page) => onChangePage(page)}
            />
          </div>
        </ResultActions>
      </Spin>
      <BackTop />
    </>
  );
}
