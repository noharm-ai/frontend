import { Fragment, useEffect } from "react";
import { FloatButton, Spin } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import AdvancedFilter from "components/AdvancedFilter";
import DefaultModal from "components/Modal";
import {
  fetchReportData,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../ExamsRawSearchReportSlice";
import {
  getReportData,
  type ExamsRawSearchFilters,
  type RawExam,
} from "../transformers";
import { MainFilters } from "./MainFilters";

type FetchReportDataAction =
  | ReturnType<typeof fetchReportData.fulfilled>
  | ReturnType<typeof fetchReportData.rejected>;

interface FilterProps {
  idPatient: number;
}

export function Filter({ idPatient }: FilterProps) {
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.reportsArea.examsRawSearch.status) ===
    "loading";
  const datasource = useAppSelector(
    (state) => state.reportsArea.examsRawSearch.list,
  );
  const initialValues: ExamsRawSearchFilters = {
    dateRange: [],
    typesList: [],
    valueString: "",
  };

  const search = async (params: ExamsRawSearchFilters, forceDs?: RawExam[]) => {
    let ds: RawExam[] = [];
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
      dispatch(fetchReportData({ idPatient })).then(
        (response: FetchReportDataAction) => {
          if (fetchReportData.rejected.match(response)) {
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

    fetchData();

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  return (
    <Fragment>
      <Spin spinning={isFetching}>
        {!isFetching && (
          <AdvancedFilter
            initialValues={initialValues}
            mainFilters={<MainFilters />}
            secondaryFilters={undefined}
            onSearch={search}
            onChangeValues={undefined}
            loading={isFetching}
            skipFilterList={["dateRange", "typesList", "valueString"]}
            memoryType={undefined}
          />
        )}
      </Spin>
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </Fragment>
  );
}
