import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Pagination, Affix } from "antd";
import {
  BorderOutlined,
  ExperimentOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import { uniq } from "utils/lodash";

import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";
import Dropdown from "components/Dropdown";
import { EditSubstanceMultiple } from "./EditSubstanceMultiple/EditSubstanceMultiple";

import { PageCard, PaginationContainer } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

import Filter from "./Filter/Filter";
import columns from "./Table/columns";
import expandedRowRender from "./Table/expandedRowRender";
import {
  setCurrentPage,
  fetchDrugAttributes,
  setDrugForm,
  setSelectedRowsActive,
  setSelectedRows,
  toggleSelectedRows,
} from "./DrugAttributesSlice";
import { DRUG_ATTRIBUTES_MODES, DEFAULT_MODE } from "./drugAttributesConfig";
import { getSubstances } from "features/lists/ListsSlice";
import Actions from "./Actions/Actions";
import DrugReferenceDrawer from "../DrugReferenceDrawer/DrugReferenceDrawer";
import { setDrugUnitConversionOpen } from "features/drugs/DrugUnitConversion/DrugUnitConversionSlice";
import { DrugUnitConversion } from "features/drugs/DrugUnitConversion/DrugUnitConversion";
import { ExpandColumn } from "src/components/ExpandColumn";
import SubstanceForm from "features/admin/Substance/Form/SubstanceForm";

export default function DrugAttributes({ mode = DEFAULT_MODE }) {
  const config = DRUG_ATTRIBUTES_MODES[mode];
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isFetching =
    useSelector((state) => state.admin.drugAttributes.status) === "loading";

  const [expandedRows, setExpandedRows] = useState([]);
  const page = useSelector((state) => state.admin.drugAttributes.currentPage);
  const count = useSelector((state) => state.admin.drugAttributes.count);
  const filters = useSelector((state) => state.admin.drugAttributes.filters);
  const drugList = useSelector((state) => state.admin.drugAttributes.list);
  const selectedRows = useSelector(
    (state) => state.admin.drugAttributes.selectedRows.list,
  );
  const selectedRowsActive = useSelector(
    (state) => state.admin.drugAttributes.selectedRows.active,
  );
  const limit = 50;

  useEffect(() => {
    dispatch(getSubstances({ useCache: true }));
  }, [dispatch]);

  const datasource = drugList.map((d) => ({
    key: `${d.idSegment}-${d.idDrug}`,
    ...d,
  }));

  const isAllSelected = () => {
    if (!selectedRows.length) return false;
    return datasource.every((d) => selectedRows.includes(d.key));
  };

  const selectAllRows = () => {
    const keys = datasource.map((d) => d.key);
    if (isAllSelected()) {
      dispatch(setSelectedRows(selectedRows.filter((k) => !keys.includes(k))));
    } else {
      dispatch(setSelectedRows(uniq([...selectedRows, ...keys])));
    }
  };

  const [defineSubstanceVisible, setDefineSubstanceVisible] = useState(false);

  const toggleMultipleSelection = () => {
    dispatch(setSelectedRowsActive(!selectedRowsActive));
  };

  const selectionActionOptions = {
    items: [
      {
        key: "defineSubstance",
        label: "Definir substância",
        icon: <ExperimentOutlined />,
        disabled: selectedRows.length === 0,
      },
      { type: "divider" },
      {
        key: "reset",
        label: "Remover seleção",
        icon: <BorderOutlined />,
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === "defineSubstance") {
        setDefineSubstanceVisible(true);
      } else if (key === "reset") {
        dispatch(setSelectedRowsActive(false));
      }
    },
  };

  const onPageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));

    const params = { ...filters, limit, offset: (newPage - 1) * limit };
    setExpandedRows([]);
    if (selectedRowsActive) dispatch(setSelectedRows([]));

    dispatch(fetchDrugAttributes(params));
  };

  const reload = () => {
    onPageChange(page);
  };

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.key));
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(
        drugList.map((d) =>
          config.columns.includes("segment")
            ? `${d.idSegment}-${d.idDrug}`
            : `${d.idDrug}`,
        ),
      );
    }
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{config.pageTitle}</h1>
        </div>
        <div className="page-header-actions">
          <Actions reload={reload} />
        </div>
      </PageHeader>
      <Filter limit={limit} config={config} />

      <Affix offsetTop={10}>
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

          <div>
            <Dropdown.Button
              type={selectedRowsActive ? "primary" : "default"}
              onClick={toggleMultipleSelection}
              menu={selectedRowsActive ? selectionActionOptions : { items: [] }}
              icon={<EllipsisOutlined />}
            >
              {selectedRowsActive
                ? `${selectedRows.length} selecionados`
                : "Ativar seleção múltipla"}
            </Dropdown.Button>
          </div>
        </PaginationContainer>
      </Affix>
      <PageCard>
        <ExpandableTable
          columns={columns(t, {
            setDrugForm: (data) => dispatch(setDrugForm(data)),
            openUnitConversion: (idDrug) =>
              dispatch(
                setDrugUnitConversionOpen({
                  open: true,
                  idDrug: String(idDrug),
                }),
              ),
            selectedRows,
            selectedRowsActive,
            isAllSelected: isAllSelected(),
            selectAllRows,
            toggleSelectedRows: (key) => dispatch(toggleSelectedRows(key)),
            config,
            mode,
          })}
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
          {...(config.expandedRow && {
            expandedRowRender,
            expandedRowKeys: expandedRows,
            columnTitle: (
              <ExpandColumn
                expand={!expandedRows.length}
                toggleExpansion={toggleExpansion}
              />
            ),
            onExpand: (expanded, record) => handleRowExpand(record),
          })}
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
      <DrugReferenceDrawer placement="bottom" />
      <DrugUnitConversion onAfterSave={reload} />
      <SubstanceForm />
      <EditSubstanceMultiple
        open={defineSubstanceVisible}
        setOpen={setDefineSubstanceVisible}
      />
    </>
  );
}
