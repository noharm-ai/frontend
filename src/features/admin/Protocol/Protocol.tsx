import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import columns from "./columns";
import { toDataSource } from "utils/index";
import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import Filter from "./Filter/Filter";
import { fetchProtocol } from "./ProtocolSlice";
import { buildProtocolCopy } from "./Form/copyProtocol";
import { IProtocolEditorLocationState } from "./Form/navigationState";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export function Protocol() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const list = useAppSelector((state) => state.admin.protocol.list);
  const status = useAppSelector((state) => state.admin.protocol.status);
  const currentSchema = useAppSelector(
    (state: any) => state.user.account.schema
  );

  const ds = toDataSource(list, null, {});

  // The listing carries no config, so the source has to be loaded by id.
  // allSchemas is what makes copying from another schema possible.
  const onCopy = (record: any) => {
    setCopyingId(record.id);

    dispatch(fetchProtocol({ id: record.id, allSchemas: true })).then(
      (response: any) => {
        setCopyingId(null);

        if (response.error || !response.payload) {
          notification.error({
            message: response.error
              ? getErrorMessage(response, t)
              : "Protocolo não encontrado.",
          });
          return;
        }

        const state: IProtocolEditorLocationState = {
          protocolCopy: buildProtocolCopy(response.payload, currentSchema),
        };

        navigate("/admin/protocolos/new", { state });
      }
    );
  };

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
            onClick={() => navigate("/admin/protocolos/new")}
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
          columns={columns(navigate, t, { currentSchema, onCopy, copyingId })}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "succeeded" ? ds : []}
        />
      </PageCard>
      <BackTop />
    </>
  );
}
