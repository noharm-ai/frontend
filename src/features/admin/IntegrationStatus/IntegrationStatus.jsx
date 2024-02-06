import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Spin, Space } from "antd";
import dayjs from "dayjs";

import notification from "components/notification";
import Empty from "components/Empty";
import Tag from "components/Tag";
import { getErrorMessage } from "utils/errorHandler";

import { fetchStatus, reset } from "./IntegrationStatusSlice";
import { PageHeader } from "styles/PageHeader.style";
import { DataList } from "./IntegrationStatus.style";
import { PageContainer } from "styles/Utils.style";

function IntegrationStatus() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.admin.integrationStatus.status);
  const data = useSelector((state) => state.admin.integrationStatus.data);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchStatus()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });

    return () => {
      dispatch(reset());
    };
  }, [dispatch, t]);

  let memory = {};
  if (data.memory && data.memory.length) {
    data.memory.forEach((m) => {
      memory[m.kind] = m.value;
    });
  }

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Implantação</h1>
          <div className="page-header-legend">
            Status das etapas de implantação
          </div>
        </div>
      </PageHeader>

      <PageContainer>
        <Spin spinning={status === "loading"}>
          <Space direction="vertical" style={{ width: "100%" }} size={"large"}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card title="Configurações" type="inner">
                  <DataList>
                    <li>
                      <div>GETNAME Único</div>
                      <div>
                        <Tag
                          color={memory["getnameurl"]?.value ? "green" : "red"}
                        >
                          {memory["getnameurl"]?.value
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>

                    <li>
                      <div>GETNAME Múltiplo</div>
                      <div>
                        <Tag
                          color={
                            memory["getnameurl"]?.multiple ? "green" : "red"
                          }
                        >
                          {memory["getnameurl"]?.multiple
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>

                    <li>
                      <div>Features</div>
                      <div>
                        <Tag
                          color={memory["features"]?.length ? "green" : "red"}
                        >
                          {memory["features"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>

                    <li>
                      <div>Vias (map-routes)</div>
                      <div>
                        <Tag
                          color={memory["map-routes"]?.length ? "green" : "red"}
                        >
                          {memory["map-routes"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                  </DataList>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Origens" type="inner">
                  <DataList>
                    <li>
                      <div>Medicamentos</div>
                      <div>
                        <Tag
                          color={
                            memory["map-origin-drug"]?.length ? "green" : "red"
                          }
                        >
                          {memory["map-origin-drug"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Soluções</div>
                      <div>
                        <Tag
                          color={
                            memory["map-origin-solution"]?.length
                              ? "green"
                              : "red"
                          }
                        >
                          {memory["map-origin-solution"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Procedimentos/Exames</div>
                      <div>
                        <Tag
                          color={
                            memory["map-origin-procedure"]?.length
                              ? "green"
                              : "red"
                          }
                        >
                          {memory["map-origin-procedure"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Dietas</div>
                      <div>
                        <Tag
                          color={
                            memory["map-origin-diet"]?.length ? "green" : "red"
                          }
                        >
                          {memory["map-origin-diet"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Customizado</div>
                      <div>
                        <Tag
                          color={
                            memory["map-origin-custom"]?.length
                              ? "green"
                              : "red"
                          }
                        >
                          {memory["map-origin-custom"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                  </DataList>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Segmentos" type="inner">
                  {data.segments && data.segments.length > 0 ? (
                    <DataList>
                      {data.segments.map((i) => (
                        <li key={i.idSegment}>
                          <div>{i.name}</div>
                          <div>
                            <Tag color={i.departments > 0 ? "green" : "red"}>
                              {i.departments} setores
                            </Tag>
                          </div>
                        </li>
                      ))}
                    </DataList>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhum segmento encontrado"
                    />
                  )}
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Escores" type="inner">
                  {data.outliers && data.outliers.length > 0 ? (
                    <DataList>
                      {data.outliers.map((i) => (
                        <li key={i.idSegment}>
                          <div>{i.name}</div>
                          <div>
                            <Tag color={i.outliers > 0 ? "green" : "red"}>
                              {i.lastUpdate
                                ? `Gerado em ${dayjs(i.lastUpdate).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}`
                                : "Pendente"}
                            </Tag>
                          </div>
                        </li>
                      ))}
                    </DataList>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhum registro encontrado"
                    />
                  )}
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Curadoria" type="inner">
                  <DataList>
                    <li>
                      <div>Frequências</div>
                      <div>
                        <Tag
                          color={data?.pendingFrequencies > 0 ? "red" : "green"}
                        >
                          {data?.pendingFrequencies > 0
                            ? `${data?.pendingFrequencies} pendentes`
                            : "Configurado"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Substâncias</div>
                      <div>
                        <Tag
                          color={data?.pendingSubstances > 0 ? "red" : "green"}
                        >
                          {data?.pendingSubstances > 0
                            ? `${data?.pendingSubstances} pendentes`
                            : "Configurado"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Dose máxima</div>
                      <div>
                        <Tag color={data?.maxDose === 0 ? "red" : "green"}>
                          {data?.maxDose} configurados
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Motivos de intervenção</div>
                      <div>
                        <Tag
                          color={
                            data?.interventionReason === 0 ? "red" : "green"
                          }
                        >
                          {data?.interventionReason} configurados
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Vias: Sonda</div>
                      <div>
                        <Tag
                          color={memory["map-tube"]?.length ? "green" : "red"}
                        >
                          {memory["map-tube"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Vias: Intravenosa</div>
                      <div>
                        <Tag color={memory["map-iv"]?.length ? "green" : "red"}>
                          {memory["map-iv"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Conversão de Unidades</div>
                      <div>
                        <Tag
                          color={
                            data?.conversions?.pendingConversions === 0
                              ? "green"
                              : "red"
                          }
                        >
                          {data?.conversions?.pendingConversions > 0
                            ? `${data?.conversions?.pendingConversions} pendentes`
                            : "Configurado"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Conversão de Unidades de Custo</div>
                      <div>
                        <Tag
                          color={
                            data?.conversions?.pendingPriceConversions === 0
                              ? "green"
                              : "red"
                          }
                        >
                          {data?.conversions?.pendingPriceConversions > 0
                            ? `${data?.conversions?.pendingPriceConversions} pendentes`
                            : "Configurado"}
                        </Tag>
                      </div>
                    </li>
                  </DataList>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Exames" type="inner">
                  {data.exams && data.exams.length > 0 ? (
                    <DataList>
                      {data.exams.map((i) => (
                        <li key={i.idSegment}>
                          <div>{i.name}</div>
                          <div>
                            <Tag color={i.count > 0 ? "green" : "red"}>
                              {i.count} configurados
                            </Tag>
                          </div>
                        </li>
                      ))}
                    </DataList>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhum segmento encontrado"
                    />
                  )}
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Relatórios" type="inner">
                  <DataList>
                    <li>
                      <div>Aplicação</div>
                      <div>
                        <Tag
                          color={
                            memory["reports-internal"]?.length ? "green" : "red"
                          }
                        >
                          {memory["reports-internal"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Externo</div>
                      <div>
                        <Tag
                          color={memory["reports"]?.length ? "green" : "red"}
                        >
                          {memory["reports"]?.length
                            ? "Configurado"
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                  </DataList>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Usuários" type="inner">
                  <DataList>
                    <li>
                      <div>Ativos</div>
                      <div>
                        <Tag color={data?.users?.active > 0 ? "green" : "red"}>
                          {data?.users?.active > 0
                            ? `${data?.users.active} configurados`
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>CPOE</div>
                      <div>
                        <Tag
                          color={data?.users?.activeCPOE > 0 ? "green" : "red"}
                        >
                          {data?.users?.activeCPOE > 0
                            ? `${data?.users.activeCPOE} configurados`
                            : "Não configurado"}
                        </Tag>
                      </div>
                    </li>
                    <li>
                      <div>Administração de usuários</div>
                      <div>
                        <Tag
                          color={
                            data?.users?.activeUserAdmin > 0 ? "green" : "red"
                          }
                        >
                          {data?.users?.activeUserAdmin > 0
                            ? `${data?.users.activeUserAdmin} configurados`
                            : "Pendente"}
                        </Tag>
                      </div>
                    </li>
                  </DataList>
                </Card>
              </Col>
            </Row>
          </Space>
        </Spin>
      </PageContainer>
    </>
  );
}

export default IntegrationStatus;
