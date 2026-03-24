import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Tag } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import Table from "components/Table";
import Button from "components/Button";
import BackTop from "components/BackTop";
import notification from "components/notification";
import { PageCard } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import { fetchCustomForms, reset } from "./CustomFormsSlice";

function MemoryCustomForms() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch() as any;
  const navigate = useNavigate();
  const forms: any[] = useAppSelector(
    (state: any) => state.memoryCustomForms.forms,
  );
  const status = useAppSelector((state: any) => state.memoryCustomForms.status);

  useEffect(() => {
    dispatch(fetchCustomForms());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (status === "failed") {
    notification.error({
      message: t("error.title"),
      description: t("error.description"),
    });
  }

  const basePath = "/configuracoes/forms-personalizados";

  const columns = [
    {
      title: "Nome",
      dataIndex: "name",
    },
    {
      title: "Ativo",
      align: "center" as const,
      width: 90,
      render: (_: any, record: any) =>
        record.active !== false ? (
          <Tag color="green">Sim</Tag>
        ) : (
          <Tag color="red">Não</Tag>
        ),
    },
    {
      title: "Grupos",
      align: "center" as const,
      width: 100,
      render: (_: any, record: any) => record.data?.length ?? 0,
    },
    {
      title: "Questões",
      align: "center" as const,
      width: 100,
      render: (_: any, record: any) =>
        (record.data ?? []).reduce(
          (acc: number, g: any) => acc + (g.questions?.length ?? 0),
          0,
        ),
    },
    {
      title: "Ações",
      key: "operations",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`${basePath}/${record.key}`)}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Formulários de evolução</h1>
          <div className="page-header-legend">
            Crie e edite formulários de evolução
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${basePath}/new`)}
          >
            Adicionar formulário
          </Button>
        </div>
      </PageHeader>

      <PageCard>
        <Table
          columns={columns}
          dataSource={[...forms]
            .sort((a: any, b: any) =>
              (a.value?.name ?? "").localeCompare(b.value?.name ?? ""),
            )
            .map((f: any) => ({
              ...f.value,
              key: f.key,
            }))}
          loading={status === "loading"}
          pagination={false}
          locale={{ emptyText: "Nenhum formulário cadastrado" }}
        />
      </PageCard>

      <BackTop />
    </>
  );
}

export default MemoryCustomForms;
