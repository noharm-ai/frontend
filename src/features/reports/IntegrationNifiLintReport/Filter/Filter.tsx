import { useTranslation } from "react-i18next";
import { FloatButton, Spin } from "antd";
import { MenuOutlined, DownloadOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { FloatButtonGroup } from "components/FloatButton";
import AdvancedFilter from "components/AdvancedFilter";
import {
  fetchReportData,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "../IntegrationNifiLintReportSlice";
import { getReportData, filterAndExportCSV } from "../transformers";
import { MainFilters } from "./MainFilters";
import useFetchReport from "hooks/useFetchReport";
import { decompressDatasource } from "utils/report";

export default function Filter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isFetching =
    useAppSelector((state) => state.reportsArea.integrationNifiLint.status) ===
    "loading";
  const currentFilters = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.filters
  );
  const datasource = useAppSelector(
    (state) => state.reportsArea.integrationNifiLint.list
  );

  const initialValues = {
    levelList: [],
    schemaList: [],
    keyList: [],
  };

  useFetchReport({
    action: fetchReportData,
    reset,
    onAfterFetch: (body: any) => {
      search(
        {
          ...initialValues,
        },
        body
      );
    },
  });

  const exportCSV = async () => {
    const ds = await decompressDatasource(datasource);
    filterAndExportCSV(ds, currentFilters, t);
  };

  const search = async (params: any, forceDs: boolean) => {
    let ds = [];
    if (!forceDs) {
      ds = await decompressDatasource(datasource);
    }

    dispatch(setFilteredStatus("loading"));
    dispatch(setFilters(params));
    const reportData = getReportData(forceDs || ds, params);
    dispatch(setFilteredResult(reportData));

    setTimeout(() => {
      dispatch(setFilteredStatus("succeeded"));
    }, 500);
  };

  return (
    <>
      <Spin spinning={isFetching}>
        {!isFetching && (
          <>
            <AdvancedFilter
              initialValues={initialValues}
              mainFilters={<MainFilters />}
              secondaryFilters={null}
              onSearch={search}
              loading={isFetching}
              skipFilterList={[]}
              skipMemoryList={{}}
              memoryType={null}
              onChangeValues={null}
            />
          </>
        )}
      </Spin>
      {!isFetching && (
        <FloatButtonGroup
          trigger="click"
          type="primary"
          icon={<MenuOutlined />}
          tooltip="Menu"
          style={{ bottom: 25 }}
        >
          <FloatButton
            icon={<DownloadOutlined />}
            onClick={exportCSV}
            tooltip="Exportar CSV"
          />
        </FloatButtonGroup>
      )}
      <FloatButton.BackTop
        style={{ right: 80, bottom: 25 }}
        tooltip="Voltar ao topo"
      />
    </>
  );
}
