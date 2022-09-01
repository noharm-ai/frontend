import React, { useEffect, useReducer } from "react";
import isEmpty from "lodash.isempty";
import { useTransition, animated } from "@react-spring/web";
import { Spin, Pagination, Tag } from "antd";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import notification from "components/notification";
import { Select } from "components/Inputs";

import Filter from "./Filter";
import PrioritizationCard from "./Card";
import { PrioritizationPage, FilterCard, ResultActions } from "./index.style";

const PAGE_SIZE = 24;

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
  if (filter.status) {
    return list.filter((i) => i.status === filter.status);
  }

  return list;
};

const initState = () => {
  return { currentPage: 1, filter: {}, listStats: getListStats([]) };
};

const reducer = (state, action) => {
  switch (action.type) {
    case "set_page":
      return { ...state, currentPage: action.payload };
    case "set_filter":
      return {
        ...state,
        currentPage: 1,
        filter: { ...state.filter, ...action.payload },
      };
    case "after_update_list":
      return {
        ...state,
        currentPage: 1,
        filter: {},
        listStats: action.payload,
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
  ...restProps
}) {
  const [state, dispatch] = useReducer(reducer, initState());
  const { isFetching, list, error } = prescriptions;
  const { t } = useTranslation();

  const filteredList = filterList(list, state.filter);
  const patients = isFetching
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

  const onChangePage = (page) => {
    dispatch({ type: "set_page", payload: page });
  };

  const onChangeStatus = (value) => {
    dispatch({
      type: "set_filter",
      payload: {
        status: !value || value === "all" ? null : value,
      },
    });
  };

  return (
    <>
      <Heading>Priorização</Heading>
      <FilterCard>
        <Filter
          {...restProps}
          prioritizationType={prioritizationType}
          fetchPrescriptionsList={fetchPrescriptionsList}
          isFetchingPrescription={isFetching}
          hasPeriodLimit={!security.hasRole("nolimit")}
        />
      </FilterCard>
      <Spin spinning={isFetching}>
        <ResultActions>
          <div className="filter">
            <Select
              placeholder="Situação"
              optionFilterProp="children"
              defaultValue="all"
              onChange={onChangeStatus}
              value={state.filter.status || "all"}
            >
              <Select.Option value="0" key="pending">
                Pendentes <Tag color="orange">{state.listStats.pending}</Tag>
              </Select.Option>
              <Select.Option value="s" key="checked">
                Checadas <Tag color="green">{state.listStats.checked}</Tag>
              </Select.Option>
              <Select.Option value="all" key="all">
                Todas <Tag>{state.listStats.all}</Tag>
              </Select.Option>
            </Select>
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
        <PrioritizationPage>
          <div className="grid">
            {list &&
              transitions((props, item) => (
                <animated.div style={props}>
                  <PrioritizationCard
                    prescription={item}
                    prioritizationType={prioritizationType}
                  />
                </animated.div>
              ))}
          </div>
        </PrioritizationPage>
      </Spin>
    </>
  );
}
