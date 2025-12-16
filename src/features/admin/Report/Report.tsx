import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "components/Button";
import notification from "components/notification";
import columns from "./columns";
import { toDataSource } from "utils/index";
import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import { setReport } from "./ReportSlice";
import { ReportForm } from "./Form/ReportForm";
import { fetchReports, reset } from "./ReportSlice";
import { getErrorMessage } from "src/utils/errorHandler";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export function Report() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.admin.report.list);
  const status = useAppSelector((state) => state.admin.report.status);

  const ds = toDataSource(list, null, {});

  useEffect(() => {
    dispatch(fetchReports({})).then((response: any) => {
      if (response.error) {
        notification.error(getErrorMessage(response, t));
      }
    });

    return () => {
      dispatch(reset());
    };
  }, [dispatch, t]);

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Relatórios</h1>
          <div className="page-header-legend">
            Administração dos relatórios customizados
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => dispatch(setReport({ newReport: true }))}
          >
            Adicionar relatório
          </Button>
        </div>
      </PageHeader>

      <PaginationContainer>
        {(ds || []).length} registros encontrados
      </PaginationContainer>
      <PageCard>
        <Table
          columns={columns(setReport, dispatch, t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <ReportForm />
      <BackTop />
    </>
  );
}
