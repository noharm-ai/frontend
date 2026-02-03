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
} from "../PatientObservationReportSlice";
import { getReportData } from "../transformers";
import MainFilters from "./MainFilters";

interface FilterProps {
  admissionNumber: string;
}

interface FilterParams {
  dateRange: any[];
  createdByList: string[];
  textString: string;
}

export default function Filter({ admissionNumber }: FilterProps) {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state: any) => state.reportsArea.patientObservation.status) ===
    "loading";
  const datasource = useSelector(
    (state: any) => state.reportsArea.patientObservation.list,
  );
  const initialValues: FilterParams = {
    dateRange: [],
    createdByList: [],
    textString: "",
  };

  const search = async (params: FilterParams, forceDs?: any[]) => {
    let ds: any[] = [];
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
      dispatch(fetchReportData({ admissionNumber }) as any).then(
        (response: any) => {
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
        },
      );
    };

    console.log("Fetching Patient Observation Report data...");

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
            secondaryFilters={null}
            onSearch={search}
            onChangeValues={() => {}}
            loading={isFetching}
            skipFilterList={["dateRange", "createdByList", "textString"]}
            memoryType=""
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
