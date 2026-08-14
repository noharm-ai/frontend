import { useState } from "react";
import { useTranslation } from "react-i18next";

import Alert from "components/Alert";
import Button from "components/Button";
import Table from "components/Table";
import Empty from "components/Empty";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { useAppDispatch, useAppSelector } from "src/store";
import { getContactList } from "features/lists/ListsSlice";
import { getErrorMessage } from "utils/errorHandler";

interface Props {
  /** what the user cannot do, e.g. "criar ou alterar exames" */
  action: string;
}

const columns = [
  {
    title: "Nome",
    dataIndex: "name",
    align: "left" as const,
    width: 350,
  },
  {
    title: "Email",
    dataIndex: "email",
    align: "left" as const,
    render: (email: string) => <a href={`mailto:${email}`}>{email}</a>,
  },
];

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum gestor de configurações ativo foi encontrado."
  />
);

/**
 * Alert for users without write permission, with a link to the active
 * CONFIG_MANAGER users they can ask for the change.
 */
export function ConfigManagerContact({ action }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.lists.getContactList.list);
  const status = useAppSelector((state) => state.lists.getContactList.status);
  const [open, setOpen] = useState(false);

  const showManagers = () => {
    setOpen(true);

    // fetched on open, and only once per session
    if (list.length === 0) {
      // @ts-expect-error ts 2554 - ListsSlice is not typed
      dispatch(getContactList({ role: "CONFIG_MANAGER" })).then(
        (response: any) => {
          if (response.error) {
            notification.error({
              message: getErrorMessage(response, t),
            });
          }
        },
      );
    }
  };

  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: "15px" }}
        message={`Você não possui permissão para ${action}`}
        description={
          <>
            Entre em contato com um{" "}
            <Button
              type="link"
              style={{ padding: 0, height: "auto" }}
              onClick={showManagers}
              data-testid="config-manager-link"
            >
              gestor de configurações
            </Button>{" "}
            para solicitar a criação ou alteração de um registro.
          </>
        }
      />

      <DefaultModal
        open={open}
        width={700}
        centered
        destroyOnHidden
        onCancel={() => setOpen(false)}
        okButtonProps={{ style: { display: "none" } }}
        cancelText="Fechar"
      >
        <header>
          <div className="modal-title">Gestores de configurações</div>
        </header>

        <Table
          columns={columns}
          pagination={false}
          loading={status === "loading"}
          locale={{
            emptyText:
              status === "failed"
                ? "Não foi possível carregar a lista."
                : emptyText,
          }}
          dataSource={status === "succeeded" ? list : []}
          rowKey="id"
        />
      </DefaultModal>
    </>
  );
}
