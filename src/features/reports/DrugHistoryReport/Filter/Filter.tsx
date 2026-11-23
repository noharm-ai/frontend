import { Fragment, useEffect, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { FloatButton, Spin } from "antd";
import {
  MenuOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

import { useAppDispatch, useAppSelector } from "src/store";
import { FloatButtonGroup } from "components/FloatButton";
import AdvancedFilter from "components/AdvancedFilter";
import DefaultModal from "components/Modal";
import {
  fetchReportData,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../DrugHistoryReportSlice";
import {
  getReportData,
  type DrugHistoryItem,
  type DrugHistoryFilters,
} from "../transformers";
import { exportCSV, onBeforePrint, onAfterPrint } from "utils/report";
import { MainFilters } from "./MainFilters/MainFilters";

type FetchReportDataAction =
  | ReturnType<typeof fetchReportData.fulfilled>
  | ReturnType<typeof fetchReportData.rejected>;

interface FilterProps {
  printRef: RefObject<HTMLDivElement | null>;
  admissionNumber: number | string;
  attribute: string;
}

export function Filter({ printRef, admissionNumber, attribute }: FilterProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.reportsArea.drugHistory.status) ===
    "loading";
  const datasource = useAppSelector(
    (state) => state.reportsArea.drugHistory.list,
  );
  const filteredList = useAppSelector(
    (state) => state.reportsArea.drugHistory.filtered.result.list,
  );
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    // react-to-print 3 renamed onBeforeGetContent to onBeforePrint
    onBeforePrint: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const initialValues: DrugHistoryFilters = {
    dateRange: [],
    drugList: [],
    substanceList: [],
  };

  const search = (params: DrugHistoryFilters, forceDs?: DrugHistoryItem[]) => {
    dispatch(setFilteredStatus("loading"));
    dispatch(setFilters(params));
    const reportData = getReportData(forceDs ?? datasource, params);
    dispatch(setFilteredResult(reportData));

    setTimeout(() => {
      dispatch(setFilteredStatus("succeeded"));
    }, 500);
  };

  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchReportData({ admissionNumber, attribute })).then(
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

  const exportList = () => {
    exportCSV(filteredList, t, "reportcsv");
  };

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
            skipFilterList={["dateRange", "segmentList", "departmentList"]}
            memoryType={undefined}
          />
        )}
      </Spin>
      {!isFetching && (
        <FloatButtonGroup
          trigger="click"
          type="primary"
          icon={<MenuOutlined />}
          tooltip={{
            title: "Menu",
            placement: "left",
          }}
          style={{ bottom: 25 }}
        >
          <FloatButton
            icon={<DownloadOutlined />}
            onClick={exportList}
            tooltip={{
              title: "Exportar CSV",
              placement: "left",
            }}
          />
          <FloatButton
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            tooltip={{
              title: "Imprimir",
              placement: "left",
            }}
          />
        </FloatButtonGroup>
      )}
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </Fragment>
  );
}
