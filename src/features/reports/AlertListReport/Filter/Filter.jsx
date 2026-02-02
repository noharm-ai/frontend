import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FloatButton, Spin } from "antd";
import { MenuOutlined, PrinterOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

import { FloatButtonGroup } from "components/FloatButton";
import AdvancedFilter from "components/AdvancedFilter";
import {
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../AlertListReportSlice";
import { getReportData } from "../transformers";
import MainFilters from "./MainFilters";
import { onBeforePrint, onAfterPrint } from "utils/report";

export default function Filter({ printRef }) {
  const dispatch = useDispatch();
  const isFetching =
    useSelector((state) => state.reportsArea.alertList.status) === "loading";
  const datasource = useSelector((state) => state.reportsArea.alertList.list);
  const initialFilters = useSelector(
    (state) => state.reportsArea.alertList.initialFilters,
  );
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onBeforeGetContent: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const initialValues = {
    levelList: [],
    drugList: [],
    typeList: [],
    ...initialFilters,
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
    search({
      ...initialValues,
    });
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
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            tooltip={{ title: "Imprimir", placement: "left" }}
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
