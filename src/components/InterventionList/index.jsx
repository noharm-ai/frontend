import React, { useEffect, useState } from "react";
import isEmpty from "lodash.isempty";
import styled from "styled-components/macro";
import { useTranslation } from "react-i18next";

import Empty from "components/Empty";
import notification from "components/notification";
import { ExpandableTable } from "components/Table";
import interventionColumns, {
  expandedInterventionRowRender,
} from "components/Screening/Intervention/columns";
import FormIntervention from "containers/Forms/Intervention";
import Tag from "components/Tag";
import BackTop from "components/BackTop";
import { Select } from "components/Inputs";
import { uniqBy, intersection } from "utils/lodash";
import { toDataSource } from "utils";
import LoadBox from "components/LoadBox";

import Filter from "./filters/Filter";

import { PageCard } from "styles/Utils.style";
import { PageHeader } from "styles/PageHeader.style";

const TableInfo = styled.div`
  .filter-field {
    display: inline-block;
    margin-right: 10px;

    label {
      display: block;
      margin-bottom: 2px;
      color: #2e3c5a;
    }
  }

  .obs {
    padding-top: 5px;
    font-size: 13px;
  }
`;

export default function InterventionList({
  searchList,
  save,
  select,
  updateList,
  futurePrescription,
  fetchFuturePrescription,
  isFetching,
  list,
  error,
  isSaving,
  fetchReasonsList,
  reasons,
  segments,
}) {
  const { t } = useTranslation();
  const [visible, setVisibility] = useState(false);
  const [prescriberList, setPrescriberList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [filter, setFilter] = useState({
    status: null,
    responsible: [],
    prescriber: [],
    department: [],
    reason: [],
  });

  const resetLocalFilters = () => {
    setFilter({
      status: null,
      responsible: [],
      prescriber: [],
      department: [],
      reason: [],
    });
  };

  const onShowModal = (data) => {
    select({
      idPrescription: data.idPrescription,
      idPrescriptionDrug: data.idPrescriptionDrug,
      dosage: `${data.dose} ${data.measureUnit.value}`,
      frequency: data.frequency,
      measureUnit: data.measureUnit,
      drug: data.drugName,
      route: data.route,
      intervention: data,
      idSegment: data.idSegment,
      idDrug: data.idDrug,
      dose: data.dose,
    });
    setVisibility(true);
  };

  useEffect(() => {
    fetchReasonsList();
  }, [fetchReasonsList]);

  useEffect(() => {
    setPrescriberList(
      uniqBy(list, "prescriber")
        .map((i) => i.prescriber)
        .sort()
    );

    setDepartmentList(
      uniqBy(list, "department")
        .map((i) => i.department)
        .sort()
    );
  }, [list]);

  // show message if has error
  useEffect(() => {
    if (!isEmpty(error)) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [error, t]);

  const afterSaveIntervention = (data) => {
    updateList(data);
  };

  const getResponsibleList = () => {
    if (!list) return [];

    return uniqBy(list, "user")
      .map((i) => i.user)
      .sort();
  };

  const handleResponsibleChange = (responsible) => {
    setFilter({ ...filter, responsible });
  };

  const handlePrescriberChange = (prescriber) => {
    setFilter({ ...filter, prescriber });
  };

  const handleDepartmentChange = (department) => {
    setFilter({ ...filter, department });
  };

  const handleReasonChange = (reason) => {
    setFilter({ ...filter, reason });
  };

  const handleStatusChange = (status) => {
    setFilter({
      ...filter,
      status: !status || status === "all" ? null : [status],
    });
  };

  const filterList = (filter) => {
    if (!list) return [];

    return list.filter((i) => {
      let show = true;

      if (filter.prescriber.length) {
        show = show && filter.prescriber.indexOf(i.prescriber) !== -1;
      }

      if (filter.department.length) {
        show = show && filter.department.indexOf(i.department) !== -1;
      }

      if (filter.reason.length) {
        show =
          show &&
          intersection(filter.reason, i.idInterventionReason).length > 0;
      }

      return show;
    });
  };

  const saveIntervention = (data) => {
    save(data)
      .then((response) => {
        updateList(response.data[0]);
        notification.success({
          message: t("success.generic"),
        });
      })
      .catch(() => {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  const dsInterventions = toDataSource(filterList(filter), null, {
    isSaving,
    saveIntervention,
    onShowModal,
    futurePrescription,
    fetchFuturePrescription,
  });
  const listCount = {
    all: list ? list.length : 0,
    pending: 0,
    accepted: 0,
    notAccepted: 0,
    notAcceptedJustified: 0,
    notApplicable: 0,
  };

  if (list) {
    list.forEach((item) => {
      switch (item.status) {
        case "a":
          listCount.accepted += 1;
          break;
        case "n":
          listCount.notAccepted += 1;
          break;
        case "j":
          listCount.notAcceptedJustified += 1;
          break;
        case "x":
          listCount.notApplicable += 1;
          break;
        default:
          listCount.pending += 1;
      }
    });
  }

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("menu.interventions")}</h1>
          <div className="page-header-legend">
            Lista de intervenções registradas.
          </div>
        </div>
      </PageHeader>
      <Filter
        isFetching={isFetching}
        error={error}
        searchList={searchList}
        resetLocalFilters={resetLocalFilters}
        segments={segments}
      />
      <TableInfo>
        {isFetching ? (
          <div style={{ minHeight: "100px", position: "relative" }}>
            <LoadBox absolute />
          </div>
        ) : (
          <>
            <div className="filter-field">
              <label>Situação</label>
              <Select
                id="intervFilterStatus"
                onChange={handleStatusChange}
                placeholder="Filtrar por situação"
                allowClear
                style={{ minWidth: "200px" }}
                optionFilterProp="children"
                defaultValue="all"
                loading={isFetching}
              >
                <Select.Option value="s" key="s">
                  Pendentes <Tag color="orange">{listCount.pending}</Tag>
                </Select.Option>
                <Select.Option value="a" key="a">
                  Aceitas <Tag color="green">{listCount.accepted}</Tag>
                </Select.Option>
                <Select.Option value="n" key="n">
                  Não aceitas <Tag color="red">{listCount.notAccepted}</Tag>
                </Select.Option>
                <Select.Option value="j" key="j">
                  Não aceitas (Justificadas){" "}
                  <Tag color="red">{listCount.notAcceptedJustified}</Tag>
                </Select.Option>
                <Select.Option value="x" key="x">
                  Não se aplica <Tag>{listCount.notApplicable}</Tag>
                </Select.Option>
                <Select.Option value="all" key="all">
                  Todas <Tag>{listCount.all}</Tag>
                </Select.Option>
              </Select>
            </div>
            <div className="filter-field">
              <label>Responsável</label>
              <Select
                id="intervFilterUser"
                onChange={handleResponsibleChange}
                placeholder="Filtrar por responsável"
                allowClear
                style={{ minWidth: "250px" }}
                mode="multiple"
                optionFilterProp="children"
              >
                {getResponsibleList().map((p, i) => (
                  <Select.Option value={p} key={i}>
                    {p}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="filter-field">
              <label>Prescritor</label>
              <Select
                id="intervFilterPrescriber"
                onChange={handlePrescriberChange}
                placeholder="Filtrar por prescritor"
                allowClear
                style={{ minWidth: "250px" }}
                mode="multiple"
                optionFilterProp="children"
              >
                {prescriberList.map((p, i) => (
                  <Select.Option value={p} key={i}>
                    {p}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="filter-field">
              <label>Setor</label>
              <Select
                id="intervFilterDept"
                onChange={handleDepartmentChange}
                placeholder="Filtrar por setor"
                allowClear
                style={{ minWidth: "200px" }}
                mode="multiple"
                optionFilterProp="children"
              >
                {departmentList.map((p, i) => (
                  <Select.Option value={p} key={i}>
                    {p}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="filter-field">
              <label>Motivo</label>
              <Select
                id="intervFilterOutcome"
                onChange={handleReasonChange}
                placeholder="Filtrar por motivo"
                allowClear
                style={{ minWidth: "200px" }}
                mode="multiple"
                optionFilterProp="children"
              >
                {reasons &&
                  reasons.map(({ id, parentName, name }) => (
                    <Select.Option key={id} value={id}>
                      {parentName ? `${parentName} - ${name}` : name}
                    </Select.Option>
                  ))}
              </Select>
            </div>
            <div className="obs">
              A consulta de intervenções é limitada em 1500 registros.
            </div>
          </>
        )}
      </TableInfo>

      <BackTop />

      <PageCard>
        <ExpandableTable
          columns={interventionColumns(filter, true, t)}
          pagination={{
            pageSize: 50,
            position: ["topRight", "bottomRight"],
            showSizeChanger: false,
          }}
          loading={isFetching}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhuma intervenção encontrada."
              />
            ),
          }}
          dataSource={!isFetching ? dsInterventions : []}
          expandedRowRender={expandedInterventionRowRender}
          showSorterTooltip={false}
        />
      </PageCard>
      <FormIntervention
        open={visible}
        setVisibility={setVisibility}
        afterSaveIntervention={afterSaveIntervention}
        disableUndoIntervention
      />
    </>
  );
}
