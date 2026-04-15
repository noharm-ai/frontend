import { useState, useEffect, type ChangeEvent } from "react";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import { Input } from "components/Inputs";
import { toDataSource } from "utils/index";
import { PageCard } from "styles/Utils.style";
import { PageHeader, ExtraFilters } from "styles/PageHeader.style";

import { fetchPatientNames } from "./OutpatientPrioritizationSlice";
import { Filter } from "./Filter/Filter";
import { columns } from "./Table/columns";

export function OutpatientPrioritization() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const list = useSelector((state: any) => state.outpatient.list);
  const status = useSelector((state: any) => state.outpatient.status);

  const [sortOrder, setSortOrder] = useState({
    order: "descend",
    columnKey: "admissionDate",
  });
  const [filter, setFilter] = useState<{ searchKey: string[] | null }>({
    searchKey: null,
  });

  useEffect(() => {
    if (status === "succeeded") {
      dispatch(fetchPatientNames() as any);
    }
  }, [dispatch, status]);

  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t("screeningList.empty")}
    />
  );

  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    setSortOrder(sorter);
  };

  const onClientSearch = (ev: ChangeEvent<HTMLInputElement>) => {
    ev.persist();

    if (ev.target.value === "") {
      setFilter({ ...filter, searchKey: null });
      return;
    }

    debounce((e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value !== "" && e.target.value.length > 3) {
        setFilter({ ...filter, searchKey: [e.target.value.toLowerCase()] });
      } else if (filter.searchKey) {
        setFilter({ ...filter, searchKey: null });
      }
    }, 800)(ev);
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("menu.patients")}</h1>
          <div className="page-header-legend">Lista de pacientes.</div>
        </div>
      </PageHeader>
      <Filter />
      <ExtraFilters>
        <div className="filter-field">
          <Input
            placeholder={t("screeningList.iptSearchPlaceholder")}
            style={{ width: 300 }}
            allowClear
            onChange={onClientSearch}
            className={filter.searchKey ? "active" : ""}
          />
        </div>
      </ExtraFilters>
      <PageCard>
        <Table
          columns={columns(sortOrder, filter, t) as any}
          pagination={{
            pageSize: 50,
            position: ["bottomRight", "topRight"] as any,
          }}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status !== "loading" ? toDataSource(list, null, {}) : []}
          onChange={handleTableChange}
          showSorterTooltip={false}
          style={{ marginTop: "25px" }}
        />
      </PageCard>

      <BackTop />
    </>
  );
}
