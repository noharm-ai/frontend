import { Fragment, useEffect, type RefObject } from "react";
import { FloatButton, Spin } from "antd";
import { MenuOutlined, PrinterOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

import { useAppDispatch, useAppSelector } from "src/store";
import { FloatButtonGroup } from "components/FloatButton";
import AdvancedFilter from "components/AdvancedFilter";
import {
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../AlertListReportSlice";
import { getReportData, type AlertListFilters } from "../transformers";
import { MainFilters } from "./MainFilters/MainFilters";
import { onBeforePrint, onAfterPrint } from "utils/report";

interface FilterProps {
  printRef: RefObject<HTMLDivElement | null>;
}

export function Filter({ printRef }: FilterProps) {
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.reportsArea.alertList.status) === "loading";
  const datasource = useAppSelector(
    (state) => state.reportsArea.alertList.list,
  );
  const initialFilters = useAppSelector(
    (state) => state.reportsArea.alertList.initialFilters,
  );
  // react-to-print 3 renamed onBeforeGetContent to onBeforePrint
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onBeforePrint: onBeforePrint,
    onAfterPrint: onAfterPrint,
  });
  const initialValues: AlertListFilters = {
    levelList: [],
    drugList: [],
    typeList: [],
    ...initialFilters,
  };

  const search = (params: AlertListFilters) => {
    dispatch(setFilteredStatus("loading"));
    dispatch(setFilters(params));
    const reportData = getReportData(datasource, params);
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
    </Fragment>
  );
}
