import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import isEmpty from "lodash.isempty";
import styled from "styled-components/macro";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CheckOutlined,
  BorderOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Affix } from "antd";
import { uniq } from "utils/lodash";

import breakpoints from "styles/breakpoints";
import { useMedia } from "lib/hooks";
import Empty from "components/Empty";
import Table from "components/Table";
import notification from "components/notification";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import { InfoIcon } from "components/Icon";
import BackTop from "components/BackTop";
import { Input } from "components/Inputs";
import InitialPage from "features/preferences/InitialPage/InitialPage";
import Dropdown from "components/Dropdown";
import {
  setSelectedRows,
  setSelectedRowsActive,
  toggleSelectedRows,
  setMultipleCheckList,
} from "features/prescription/PrescriptionSlice";
import MultipleCheck from "features/prescription/MultipleCheck/MultipleCheck";

import { toDataSource } from "utils";

import columnsTable, { expandedRowRender } from "./columns";
import Filter from "../Prioritization/Filter";
import { FilterCard } from "../Prioritization/index.style";
import { PageCard } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

const ScreeningTable = styled(Table)`
  .ant-table-title {
    padding: 0;
  }

  .ant-table-expanded-row > td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  }
`;

const TableInfo = styled.span`
  span {
    margin-left: 10px;
  }

  button span {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }

  button {
    margin-right: 10px;
    margin-bottom: 15px;
    border: 1px solid #d9d9d9;
    background: #fff;
  }

  button.active {
    background-color: #70bdc3;
    border-color: #70bdc3;

    span:not(.ant-tag) {
      color: #fff;
    }
  }

  .ant-input-affix-wrapper {
    margin-right: 10px;

    &.active {
      input {
        border-color: #096dd9;
        background-color: #eee;
      }
    }
  }
`;

const noop = () => {};
const theTitle = () => "Deslize para a direita para ver mais conteúdo.";

export default function ScreeningList({
  prescriptions,
  fetchPrescriptionsList,
  fetchFrequencies,
  checkScreening,
  prioritizationType,
  featureService,
  ...restProps
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedRows = useSelector(
    (state) => state.prescriptionv2.selectedRows.list
  );
  const selectedRowsActive = useSelector(
    (state) => state.prescriptionv2.selectedRows.active
  );
  const [multipleCheckModal, setMultipleCheckModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    order: null,
    columnKey: null,
  });
  const [filter, setFilter] = useState({
    status: null,
    searchKey: null,
  });
  const { isFetching, list, error, check } = prescriptions;
  const pageTitle = t(`screeningList.title-${prioritizationType}`);

  const [title] = useMedia(
    [`(max-width: ${breakpoints.lg})`],
    [[theTitle]],
    [noop]
  );
  const listCount = {
    all: list ? list.length : 0,
    pending: 0,
    checked: 0,
  };

  const selectAllRows = () => {
    let rows = list || [];

    if (filter.status) {
      rows = rows.filter((i) => i.status === filter.status[0]);
    }

    rows = rows
      .filter((i) => /^[0-9]*$/g.test(i.idPrescription))
      .map((i) => i.idPrescription);

    if (rows.length > 0) {
      if (isAllSelected()) {
        dispatch(
          setSelectedRows(selectedRows.filter((s) => rows.indexOf(s) === -1))
        );
      } else {
        const allRows = [...selectedRows, ...rows];
        dispatch(setSelectedRows(uniq(allRows)));
      }
    }
  };

  const isAllSelected = () => {
    if (!selectedRows.length) return false;

    let selected = true;
    let rows = list || [];

    if (filter.status) {
      rows = rows.filter((i) => i.status === filter.status[0]);
    }

    rows = rows
      .filter((i) => /^[0-9]*$/g.test(i.idPrescription))
      .map((i) => i.idPrescription);

    rows.forEach((r) => {
      if (selectedRows.indexOf(r) === -1) {
        selected = false;
      }
    });

    return selected;
  };

  const actionOptions = () => {
    const items = [
      {
        key: "checkPrescription",
        label: "Checar paciente",
        icon: <CheckOutlined style={{ fontSize: "16px" }} />,
        disabled: selectedRows.length === 0,
      },
      {
        key: "openPrescription",
        label: "Abrir prescrições",
        icon: <SearchOutlined style={{ fontSize: "16px" }} />,
        disabled: selectedRows.length === 0,
      },
      {
        type: "divider",
      },
      {
        key: "reset",
        label: "Remover seleção",
        icon: <BorderOutlined style={{ fontSize: "16px" }} />,
        disabled: !selectedRowsActive,
      },
    ];

    return {
      items,
      onClick: handleActionClick,
    };
  };

  const handleActionClick = ({ key }) => {
    switch (key) {
      case "reset":
        dispatch(setSelectedRowsActive(false));
        break;
      case "checkPrescription":
        const cheklist = list.filter(
          (item) => selectedRows.indexOf(item.idPrescription) !== -1
        );
        dispatch(setMultipleCheckList(cheklist));
        setMultipleCheckModal(true);
        break;
      case "openPrescription":
        let showWarning = false;

        list.forEach((item) => {
          if (selectedRows.indexOf(item.idPrescription) !== -1) {
            const wind = window.open(
              `/prescricao/${item.idPrescription}`,
              "_blank"
            );

            if (!wind) {
              showWarning = true;
            }
          }
        });

        if (showWarning) {
          notification.warning({
            message:
              "Desbloqueie as popups do seu navegador para abrir mais de uma prescrição ao mesmo tempo",
            duration: 0,
          });
        }

        break;
      default:
        console.error(key);
    }
  };

  const bag = {
    checkScreening,
    check,
    prioritizationType,
    dispatch,
    selectedRows,
    toggleSelectedRows,
    selectedRowsActive,
    selectAllRows,
    isAllSelected: isAllSelected(),
  };
  const dataSource = toDataSource(list, null, bag);

  // error message when fetch has error.
  const errorMessage = {
    message: t("error.title"),
    description: t("error.description"),
  };

  // empty text for table result.
  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t("screeningList.empty")}
    />
  );

  if (list) {
    list.forEach((item) => {
      if (item.status === "s") {
        listCount.checked += 1;
      } else {
        listCount.pending += 1;
      }
    });
  }

  // show message if has error

  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error(errorMessage);
    }
  }, [error]); // eslint-disable-line

  useEffect(() => {
    setFilter({ ...filter, searchKey: null });
  }, [isFetching]); //eslint-disable-line

  useEffect(() => {
    const getNextSibling = (elm) => {
      if (!elm.nextElementSibling) {
        return elm;
      }

      if (elm.nextElementSibling.classList.contains("ant-table-expanded-row")) {
        return getNextSibling(elm.nextElementSibling);
      }

      return elm.nextElementSibling;
    };

    const getPreviousSibling = (elm) => {
      if (!elm.previousElementSibling) {
        return elm;
      }

      if (
        elm.previousElementSibling.classList.contains("ant-table-expanded-row")
      ) {
        return getPreviousSibling(elm.previousElementSibling);
      }

      return elm.previousElementSibling;
    };

    const handleArrowNav = (e) => {
      const keyCode = e.keyCode || e.which;
      const actionKey = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space: 32,
        enter: 13,
      };

      if (e.ctrlKey) {
        let activeRow = document.querySelectorAll(
          ".ant-table-tbody tr.highlight"
        )[0];
        if (!activeRow) {
          activeRow = document.querySelectorAll(".ant-table-tbody tr")[0];
          activeRow.classList.add("highlight");
        }

        switch (keyCode) {
          case actionKey.up:
            activeRow.classList.remove("highlight");
            getPreviousSibling(activeRow).classList.add("highlight");

            break;
          case actionKey.down:
            activeRow.classList.remove("highlight");
            getNextSibling(activeRow).classList.add("highlight");

            break;
          case actionKey.space:
            activeRow.querySelector(".ant-table-row-expand-icon").click();

            break;
          case actionKey.enter:
            activeRow.querySelector(".gtm-bt-detail").click();

            break;
          default:
            console.debug("keyCode", keyCode);
        }
      }
    };

    window.addEventListener("keydown", handleArrowNav);
    return () => {
      window.removeEventListener("keydown", handleArrowNav);
    };
  }, []);

  const updateExpandedRows = (list, key) => {
    if (list.includes(key)) {
      return list.filter((i) => i !== key);
    }

    return [...list, key];
  };

  const handleRowExpand = (record) => {
    setExpandedRows(updateExpandedRows(expandedRows, record.key));
  };

  const handleFilter = (e, status) => {
    dispatch(setSelectedRows([]));
    dispatch(setSelectedRowsActive(false));

    if (status) {
      setFilter({ status: status === "all" ? null : [status] });
      return;
    }

    if (filter.status == null) {
      setFilter({ status: ["s"] });
    } else if (filter.status[0] === "s") {
      setFilter({ status: ["0"] });
    } else {
      setFilter({ status: null });
    }
  };

  const onClientSearch = (ev) => {
    ev.persist();

    if (ev.target.value === "") {
      setFilter({ ...filter, searchKey: null });
      return;
    }

    debounce((e) => {
      if (e.target.value !== "" && e.target.value.length > 3) {
        setFilter({ ...filter, searchKey: [e.target.value.toLowerCase()] });
      } else if (filter.searchKey) {
        setFilter({ ...filter, searchKey: null });
      }
    }, 800)(ev);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  const toggleExpansion = () => {
    if (expandedRows.length) {
      setExpandedRows([]);
    } else {
      setExpandedRows(dataSource.map((i) => i.key));
    }
  };

  const isFilterActive = (status) => {
    if (filter.status) {
      return filter.status[0] === status;
    }

    return filter.status == null && status == null;
  };

  const ExpandColumn = ({ expand }) => {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          className={`ant-table-row-expand-icon ${
            expand ? "ant-table-row-expand-icon-collapsed" : ""
          }`}
          onClick={toggleExpansion}
        ></button>
      </div>
    );
  };

  const info = (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <TableInfo>
        <Input
          placeholder={t("screeningList.iptSearchPlaceholder")}
          style={{ width: 300 }}
          allowClear
          onChange={onClientSearch}
          className={filter.searchKey ? "active" : ""}
        />
        <Tooltip title={t("screeningList.pendingHint-" + prioritizationType)}>
          <Button
            type="gtm-lnk-filter-presc-pendente ant-btn-link-hover"
            className={isFilterActive("0") ? "active" : ""}
            onClick={(e) => handleFilter(e, "0")}
          >
            {t("screeningList.pending-" + prioritizationType)}
            <Tag color="orange">{listCount.pending}</Tag>
          </Button>
        </Tooltip>

        <Tooltip title={t("screeningList.checkedHint-" + prioritizationType)}>
          <Button
            type="gtm-lnk-filter-presc-checada ant-btn-link-hover"
            className={isFilterActive("s") ? "active" : ""}
            onClick={(e) => handleFilter(e, "s")}
          >
            {t("screeningList.checked-" + prioritizationType)}{" "}
            <Tag color="green">{listCount.checked}</Tag>
          </Button>
        </Tooltip>

        <Tooltip
          title={
            listCount.all === 500
              ? t("screeningList.allHintLimit")
              : t("screeningList.allHint-" + prioritizationType)
          }
        >
          <Button
            type="gtm-lnk-filter-presc-todas ant-btn-link-hover"
            className={isFilterActive(null) ? "active" : ""}
            onClick={(e) => handleFilter(e, "all")}
          >
            {t("screeningList.all-" + prioritizationType)}{" "}
            {listCount.all === 500 ? <InfoIcon /> : ""}
            <Tag>{listCount.all}</Tag>
          </Button>
        </Tooltip>
      </TableInfo>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {prioritizationType === "prescription" && (
          <div>
            <Button
              onClick={(e) => orderByDate()}
              type={sortOrder.columnKey === "date" ? "primary" : "default"}
              icon={
                sortOrder.columnKey === "date" ? (
                  sortOrder.order === "ascend" ? (
                    <CaretUpOutlined />
                  ) : (
                    <CaretDownOutlined />
                  )
                ) : null
              }
              style={{ marginLeft: "10px" }}
            >
              Priorizar por data
            </Button>
          </div>
        )}
        {prioritizationType === "patient" && (
          <div>
            <Dropdown.Button
              style={{ marginLeft: "10px" }}
              menu={actionOptions()}
              type={selectedRowsActive ? "primary" : "default"}
              onClick={() =>
                !selectedRowsActive
                  ? dispatch(setSelectedRowsActive(true))
                  : false
              }
            >
              {selectedRowsActive
                ? `${selectedRows.length} selecionados`
                : "Ativar seleção múltipla"}
            </Dropdown.Button>
          </div>
        )}
      </div>
    </div>
  );

  const orderByDate = () => {
    if (sortOrder.columnKey === "date" && sortOrder.order === "ascend") {
      setSortOrder({ columnKey: "date", order: "descend" });
    } else if (
      sortOrder.columnKey === "date" &&
      sortOrder.order === "descend"
    ) {
      setSortOrder({ order: undefined });
    } else if (sortOrder.columnKey !== "date") {
      setSortOrder({ columnKey: "date", order: "ascend" });
    }
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{pageTitle}</h1>
        </div>
        <div className="page-header-actions">
          <InitialPage />
        </div>
      </PageHeader>
      <FilterCard>
        <Filter
          {...restProps}
          prioritizationType={prioritizationType}
          fetchFrequencies={fetchFrequencies}
          fetchPrescriptionsList={fetchPrescriptionsList}
          isFetchingPrescription={isFetching}
          featureService={featureService}
        />
      </FilterCard>
      {!isFetching && <Affix offsetTop={10}>{info}</Affix>}
      <PageCard>
        <ScreeningTable
          title={title}
          columns={columnsTable(sortOrder, filter, t, bag)}
          pagination={{
            pageSize: 50,
            position: ["topRight", "bottomRight"],
            showSizeChanger: false,
          }}
          loading={isFetching}
          locale={{ emptyText }}
          expandedRowRender={expandedRowRender(t)}
          dataSource={!isFetching ? dataSource : []}
          onChange={handleTableChange}
          showSorterTooltip={false}
          columnTitle={<ExpandColumn expand={!expandedRows.length} />}
          expandedRowKeys={expandedRows}
          onExpand={(expanded, record) => handleRowExpand(record)}
        />
      </PageCard>

      <BackTop />
      <MultipleCheck
        open={multipleCheckModal}
        setOpen={setMultipleCheckModal}
      />
    </>
  );
}
