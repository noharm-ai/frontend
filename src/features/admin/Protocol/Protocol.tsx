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
import { setProtocol } from "./ProtocolSlice";
import { ProtocolForm } from "./Form/ProtocolForm";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export function Protocol() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.admin.protocol.list);
  const status = useAppSelector((state) => state.admin.protocol.status);

  const ds = toDataSource(list, null, {});

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Protocolos</h1>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => dispatch(setProtocol({ new: true, active: true }))}
          >
            Adicionar protocolo
          </Button>
        </div>
      </PageHeader>
      <Filter />
      <PaginationContainer>
        {(ds || []).length} registros encontrados
      </PaginationContainer>
      <PageCard>
        <Table
          columns={columns(setProtocol, dispatch, t)}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <ProtocolForm />
      <BackTop />
    </>
  );
}
