import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";

import AdvancedFilter from "components/AdvancedFilter";
import DefaultModal from "components/Modal";
import {
  fetchExamsRaw,
  resetRaw,
  setRawFilteredStatus,
  setRawFilteredResult,
  setRawFilters,
} from "../../ExamModalSlice";
import { getReportData } from "../transformers";
import { ExamsRawMainFilters } from "./ExamsRawMainFilters";

const initialValues = {
  dateRange: [],
  typesList: [],
  valueString: "",
};

export function ExamsRawFilter({ admissionNumber, idSegment, active }) {
  const dispatch = useDispatch();
  const isFetching = useSelector(
    (state) => state.examsModal.raw.status === "loading",
  );
  const rawStatus = useSelector((state) => state.examsModal.raw.status);
  const datasource = useSelector((state) => state.examsModal.raw.list);

  const search = (params, forceDs) => {
    const ds = forceDs || datasource;

    dispatch(setRawFilteredStatus("loading"));
    dispatch(setRawFilters(params));
    const reportData = getReportData(ds, params);
    dispatch(setRawFilteredResult(reportData));

    setTimeout(() => {
      dispatch(setRawFilteredStatus("succeeded"));
    }, 500);
  };

  useEffect(() => {
    if (!active || rawStatus !== "idle") return;

    const fetchData = () => {
      dispatch(fetchExamsRaw({ admissionNumber, idSegment })).then((response) => {
        if (response.error) {
          DefaultModal.confirm({
            title: "Não foi possível carregar os exames.",
            content: (
              <>
                <p>
                  Por favor, tente novamente.
                  <br />
                  Se o problema persistir, entre em contato com a Ajuda.
                </p>
              </>
            ),
            width: 500,
            okText: "Tentar novamente",
            cancelText: "Fechar",
            onOk: () => fetchData(),
            wrapClassName: "default-modal",
          });
        } else {
          search(
            { ...initialValues, dateRange: [] },
            response.payload.data.data,
          );
        }
      });
    };

    fetchData();

    return () => {
      dispatch(resetRaw());
    };
  }, [active]); // eslint-disable-line

  return (
    <Spin spinning={isFetching}>
      {!isFetching && (
        <AdvancedFilter
          initialValues={initialValues}
          mainFilters={<ExamsRawMainFilters />}
          onSearch={search}
          loading={isFetching}
          skipFilterList={["dateRange", "typesList", "valueString"]}
        />
      )}
    </Spin>
  );
}
