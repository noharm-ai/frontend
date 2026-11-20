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
} from "../PrescriptionHistoryReportSlice";
import {
  getReportData,
  type PrescriptionHistoryEvent,
  type PrescriptionHistoryFilters,
} from "../transformers";
import { exportCSV, onBeforePrint, onAfterPrint } from "utils/report";
import { MainFilters } from "./MainFilters/MainFilters";

type FetchReportDataAction =
  | ReturnType<typeof fetchReportData.fulfilled>
  | ReturnType<typeof fetchReportData.rejected>;

interface FilterProps {
  printRef: RefObject<HTMLDivElement | null>;
  idPrescription: number | string;
}

export function Filter({ printRef, idPrescription }: FilterProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.reportsArea.prescriptionHistory.status) ===
    "loading";
  const datasource = useAppSelector(
    (state) => state.reportsArea.prescriptionHistory.list,
  );
  const filteredList = useAppSelector(
    (state) => state.reportsArea.prescriptionHistory.filtered.result.list,
  );
  // react-to-print 3 renamed onBeforeGetContent to onBeforePrint
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onBeforePrint: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const initialValues: PrescriptionHistoryFilters = {
    responsibleList: [],
  };

  const search = (
    params: PrescriptionHistoryFilters,
    forceDs?: PrescriptionHistoryEvent[],
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
      dispatch(fetchReportData({ idPrescription })).then(
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
