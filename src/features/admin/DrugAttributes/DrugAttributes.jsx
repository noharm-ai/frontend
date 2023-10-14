import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";
import { getErrorMessage } from "utils/errorHandler";

import Filter from "./Filter/Filter";
import columns from "./Table/columns";
import {
  setCurrentPage,
  fetchDrugAttributes,
  addDefaultUnits,
} from "./DrugAttributesSlice";

export default function DrugAttributes() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isFetching =
    useSelector((state) => state.admin.drugAttributes.status) === "loading";
  const isAddingDefaultUnits =
    useSelector(
      (state) => state.admin.drugAttributes.addDefaultUnits.status
    ) === "loading";
  const page = useSelector((state) => state.admin.drugAttributes.currentPage);
  const count = useSelector((state) => state.admin.drugAttributes.count);
  const filters = useSelector((state) => state.admin.drugAttributes.filters);
  const drugList = useSelector((state) => state.admin.drugAttributes.list);
  const limit = 50;

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));

    const params = { ...filters, limit, offset: (newPage - 1) * limit };

    dispatch(fetchDrugAttributes(params));
  };

  const showDefaultUnitDialog = () => {
    DefaultModal.confirm({
      title: "Confirma a atualização de unidade padrão?",
      content: (
        <>
          <p>
            Esta operação atualizará a <strong>Unidade Padrão</strong> de todos
            medicamentos sem unidade padrão definida e que tiverem somente uma
            unidade de medida no histórico de prescrição (prescricaoagg).
          </p>
          <p>
            Os medicamentos que não forem atualizados posssuem mais de uma
            unidade de medida no histórico de prescrição ou nunca foram
            prescritos.
          </p>
        </>
      ),
      onOk: executeAddDefaultUnits,
      okText: "Confirmar",
      cancelText: "Cancelar",
      width: 500,
    });
  };

  const executeAddDefaultUnits = () => {
    dispatch(addDefaultUnits()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Unidades Padrão Atualizadas!",
          description: `${response.payload.data.data} medicamentos atualizados`,
        });

        onPageChange(1);
      }
    });
  };

  const datasource = drugList.map((d) => ({
    key: `${d.idSegment}-${d.idDrug}`,
    ...d,
  }));

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Curadoria de Medicamentos</h1>
        </div>
        <div className="page-header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={isAddingDefaultUnits}
            onClick={() => showDefaultUnitDialog()}
          >
            Atualizar Unidade Padrão
          </Button>
        </div>
      </PageHeader>
      <Filter limit={limit} />

      <PaginationContainer>
        <Pagination
          onChange={onPageChange}
          current={page}
          total={count}
          showSizeChanger={false}
          pageSize={limit}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} de ${total} itens`
          }
        />
      </PaginationContainer>
      <PageCard>
        <ExpandableTable
          columns={columns(t)}
          pagination={false}
          loading={isFetching}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhum medicamento encontrado."
              />
            ),
          }}
          dataSource={!isFetching ? datasource : []}
          showSorterTooltip={false}
        />
      </PageCard>
      <PaginationContainer>
        <Pagination
          onChange={onPageChange}
          current={page}
          total={count}
          pageSize={limit}
          showSizeChanger={false}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} de ${total} itens`
          }
        />
      </PaginationContainer>
    </>
  );
}
