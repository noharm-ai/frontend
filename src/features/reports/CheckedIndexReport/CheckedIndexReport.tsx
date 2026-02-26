import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Descriptions, Spin, Tag } from "antd";

import { PageHeader } from "styles/PageHeader.style";
import CheckedIndexList from "./CheckedIndexList/CheckedIndexList";
import { formatDateTime } from "utils/date";
import DefaultModal from "components/Modal";
import {
  fetchReportData,
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
} from "./CheckedIndexReportSlice";
import { getReportData } from "./transformers";
import { translateFrequencyDay } from "utils/index";

interface CheckedIndexReportProps {
  idPrescriptionDrug: string;
  data: any;
}

export function CheckedIndexReport({
  idPrescriptionDrug,
  data,
}: CheckedIndexReportProps) {
  const dispatch = useDispatch();
  const status = useSelector(
    (state: any) => state.reportsArea.checkedIndex.status,
  );
  const filteredStatus = useSelector(
    (state: any) => state.reportsArea.checkedIndex.filtered.status,
  );
  const datasource = useSelector(
    (state: any) => state.reportsArea.checkedIndex.list,
  );
  const auditData = useSelector(
    (state: any) => state.reportsArea.checkedIndex.auditData,
  );
  const current = useSelector(
    (state: any) => state.reportsArea.checkedIndex.current,
  );
  const isLoading = status === "loading" || filteredStatus === "loading";

  const initialValues = { dateRange: [], createdByList: [] };

  const search = (params: typeof initialValues, forceDs?: any[]) => {
    const ds = forceDs ?? datasource;
    dispatch(setFilteredStatus("loading"));
    dispatch(setFilters(params));
    const reportData = getReportData(ds, params);
    dispatch(setFilteredResult(reportData));
    setTimeout(() => {
      dispatch(setFilteredStatus("succeeded"));
    }, 500);
  };

  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchReportData({ idPrescriptionDrug }) as any).then(
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
              { ...initialValues, dateRange: [] },
              response.payload.data.records,
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
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Histórico de Checagem</h1>
        </div>
      </PageHeader>

      <Card
        size="small"
        style={{ marginBottom: 16 }}
        title={`Registro atual: ${data?.drug}`}
        type="inner"
      >
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="Checado anteriormente">
            <Tag
              color={
                auditData.config?.checado_anteriormente ? "green" : "default"
              }
            >
              {auditData.config?.checado_anteriormente ? "Sim" : "Não"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Dose">{current.dose}</Descriptions.Item>
          <Descriptions.Item label="Frequência/dia">
            {translateFrequencyDay(current.frequencyDay)}
          </Descriptions.Item>
          <Descriptions.Item label="Via">{current.route}</Descriptions.Item>
          <Descriptions.Item label="Horário">
            {current.interval}
          </Descriptions.Item>
          <Descriptions.Item label="Recebido em">
            {formatDateTime(auditData.createdAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card size="small" title={`Histórico de checagens`} type="inner">
        <Spin spinning={isLoading}>
          <CheckedIndexList />
        </Spin>
      </Card>

      <div
        style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "12px",
          opacity: 0.7,
        }}
      >
        *Histórico limitado em 100 registros
      </div>
    </>
  );
}
