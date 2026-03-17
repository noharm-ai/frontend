import { useTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "components/Button";
import columns from "./columns";
import { toDataSource } from "utils/index";
import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import Filter from "./Filter/Filter";
import { setKnowledgeBase } from "./KnowledgeBaseSlice";
import { KnowledgeBaseForm } from "./Form/KnowledgeBaseForm";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export function KnowledgeBase() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.admin.knowledgeBase.list);
  const status = useAppSelector((state) => state.admin.knowledgeBase.status);

  const ds = toDataSource(list, null, {});

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Base de Conhecimento</h1>
          <div className="page-header-legend">
            Administração dos registros da base de conhecimento
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              dispatch(setKnowledgeBase({ newKnowledgeBase: true }))
            }
          >
            Adicionar registro
          </Button>
        </div>
      </PageHeader>
      <Filter />
      <PaginationContainer>
        {(ds || []).length} registros encontrados
      </PaginationContainer>
      <PageCard>
        <Table
          columns={columns(setKnowledgeBase, dispatch, t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <KnowledgeBaseForm />
      <BackTop />
    </>
  );
}
