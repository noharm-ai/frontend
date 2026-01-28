import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FloatButton, Spin } from "antd";
import AdvancedFilter from "components/AdvancedFilter";
import DefaultModal from "components/Modal";
import {
  fetchReportData,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../ExamsRawSearchReportSlice";
import { getReportData } from "../transformers";
import MainFilters from "./MainFilters";

export default function Filter({ idPatient }) {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.examsRawSearch.status) ===
    "loading";
  const datasource = useSelector(
    (state) => state.reportsArea.examsRawSearch.list,
  );
  const initialValues = {
    dateRange: [],
    typesList: [],
    valueString: "",
  };

  const search = async (params, forceDs) => {
    let ds = [];
    if (!forceDs) {
      ds = datasource;
    }

    dispatch(setFilteredStatus("loading"));
    dispatch(setFilters(params));
    const reportData = getReportData(forceDs || ds, params);
    dispatch(setFilteredResult(reportData));

    setTimeout(() => {
      dispatch(setFilteredStatus("succeeded"));
    }, 500);
  };

  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchReportData({ idPatient })).then((response) => {
        if (response.error) {
          DefaultModal.confirm({
            title: "Não foi possível exibir este relatório.",
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
            {
              ...initialValues,
              dateRange: [],
            },
            response.payload.data,
          );
        }
      });
    };

    fetchData();

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  return (
    <React.Fragment>
      <Spin spinning={isFetching}>
        {!isFetching && (
          <AdvancedFilter
            initialValues={initialValues}
            mainFilters={<MainFilters />}
            onSearch={search}
            loading={isFetching}
            skipFilterList={["dateRange", "typesList", "valueString"]}
          />
        )}
      </Spin>
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </React.Fragment>
  );
}
