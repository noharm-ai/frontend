import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { FloatButton, Spin } from "antd";
import {
  MenuOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

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
import { getReportData } from "../transformers";
import { exportCSV } from "utils/report";
import MainFilters from "./MainFilters";
import { onBeforePrint, onAfterPrint } from "utils/report";

export default function Filter({ printRef, idPatient }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.culture.status) === "loading";
  const datasource = useSelector((state) => state.reportsArea.culture.list);
  const filteredList = useSelector(
    (state) => state.reportsArea.culture.filtered.result.list,
  );
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onBeforeGetContent: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const initialValues = {
    dateRange: [],
    examNameList: [],
    examMaterialNameList: [],
    microorganismList: [],
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

  const exportList = async () => {
    const results = [];

    filteredList.forEach((i) => {
      const item = { ...i };
      delete item.cultures;
      delete item.id;
      delete item.idExamItem;

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
    <React.Fragment>
      <Spin spinning={isFetching}>
        {!isFetching && (
          <AdvancedFilter
            initialValues={initialValues}
            mainFilters={<MainFilters />}
            // secondaryFilters={<SecondaryFilters />}
            onSearch={search}
            loading={isFetching}
            skipFilterList={["dateRange", "segmentList", "departmentList"]}
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
    </React.Fragment>
  );
}
