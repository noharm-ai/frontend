import React, { useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";

import Table from "components/Table";
import Empty from "components/Empty";
import BackTop from "components/BackTop";
import { Input } from "components/Inputs";
import { toDataSource } from "utils";
import { PageCard } from "styles/Utils.style";
import { PageHeader, ExtraFilters } from "styles/PageHeader.style";

import Filter from "containers/PatientList/Filter";
import columns from "./table/columns";

export default function PatientList({ list, isFetching }) {
  const [dataSource, setDataSource] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    order: "descend",
    columnKey: "admissionDate",
  });
  const [filter, setFilter] = useState({
    searchKey: null,
  });
  const { t } = useTranslation();
  const emptyText = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t("screeningList.empty")}
    />
  );
  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
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

  useEffect(() => {
    setDataSource(toDataSource(list, null, {}));
  }, [list]); // eslint-disable-line

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
          columns={columns(sortOrder, filter, t)}
          pagination={{
            pageSize: 50,
            position: "both",
          }}
          loading={isFetching}
          locale={{ emptyText }}
          dataSource={!isFetching ? dataSource : []}
          onChange={handleTableChange}
          showSorterTooltip={false}
          style={{ marginTop: "25px" }}
        />
      </PageCard>

      <BackTop />
    </>
  );
}
