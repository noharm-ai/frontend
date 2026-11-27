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
} from "../CultureReportSlice";
import {
  getReportData,
  type CultureReportItem,
  type CultureReportFilters,
} from "../transformers";
import { exportCSV, onBeforePrint, onAfterPrint } from "utils/report";
import { MainFilters } from "./MainFilters/MainFilters";

type FetchReportDataAction =
  | ReturnType<typeof fetchReportData.fulfilled>
  | ReturnType<typeof fetchReportData.rejected>;

// a CSV row: a collection flattened with one of its antibiogram drugs
type CultureCsvRow = Omit<
  CultureReportItem,
  "cultures" | "predictions" | "id" | "idExamItem" | "key"
> &
  Partial<CultureReportItem["cultures"][number]>;

interface FilterProps {
  printRef: RefObject<HTMLDivElement | null>;
  idPatient: number | string;
}

export function Filter({ printRef, idPatient }: FilterProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.reportsArea.culture.status) === "loading";
  const datasource = useAppSelector((state) => state.reportsArea.culture.list);
  const filteredList = useAppSelector(
    (state) => state.reportsArea.culture.filtered.result.list,
  );
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    // react-to-print 3 renamed onBeforeGetContent to onBeforePrint
    onBeforePrint: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const initialValues: CultureReportFilters = {
    dateRange: [],
    examNameList: [],
    examMaterialNameList: [],
    microorganismList: [],
  };

  const search = (
    params: CultureReportFilters,
    forceDs?: CultureReportItem[],
  ) => {
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

  const exportList = () => {
    const results: CultureCsvRow[] = [];

    filteredList.forEach((i) => {
      // the CSV leaves out the drug and prediction lists and the internal
      // ids, which have no column name
      const {
        cultures: _cultures,
        predictions: _predictions,
        id: _id,
        idExamItem: _idExamItem,
        key: _key,
        ...item
      } = i;

      if (i.cultures.length) {
        i.cultures.forEach((c) => {
          results.push({
            ...item,
            ...c,
          });
        });
      } else {
        results.push({ ...item });
      }
    });

    exportCSV(results, t, "reportcsvCulture");
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
