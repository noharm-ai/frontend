import React from "react";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { useTranslation } from "react-i18next";

import LoadBox, { LoadContainer } from "components/LoadBox";
import Empty from "components/Empty";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import { sourceToStoreType } from "utils/transformers/prescriptions";
import {
  groupComponents,
  filterPrescriptionDrugs,
} from "utils/transformers/prescriptionDrugs";
import { filterInterventionByPrescriptionDrug } from "utils/transformers/intervention";
import SecurityService from "services/security";
import FeatureService from "services/features";
import PermissionService from "services/PermissionService";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

import {
  PrescriptionCollapse,
  PrescriptionHeader,
  GroupCollapse,
} from "./PrescriptionDrug.style";
import Table from "./components/Table";
import PanelAction from "./components/PanelAction";
import ChooseInterventionModal from "./components/ChooseInterventionModal";
import Filters from "./components/Filters";

const isExpired = (date) => {
  if (!date) return false;

  if (parseISO(date).getTime() < Date.now()) {
    return true;
  }

  return false;
};

/* eslint-disable-next-line react-refresh/only-export-components */
export const rowClassName = (record, bag) => {
  const classes = [];
  let expiresInMinutes = null;
  const hasExpireInfo = record.cpoe;

  if (hasExpireInfo && !record.suspended) {
    if (bag.headers[record.cpoe] && bag.headers[record.cpoe].expire) {
      const expirationDate = parseISO(bag.headers[record.cpoe].expire);
      const currentDate = new Date();
      expiresInMinutes = differenceInMinutes(expirationDate, currentDate);
    }
  }

  if (hasExpireInfo && expiresInMinutes < 0) {
    classes.push("suspended");
  }

  if (record.total) {
    classes.push("summary-row");
  }

  if (record.dividerRow) {
    classes.push("divider-row");
  }

  if (record.suspended) {
    classes.push("suspended");
  }

  if (record.checked && isEmpty(record.prevIntervention)) {
    classes.push("checked");
  }

  if (!record.checked && record.drug) {
    classes.push("new-item");
  }

  if (record.whiteList && !record.total) {
    classes.push("whitelist");
  }

  if (bag.interventions) {
    const intvList = bag.interventions.filter(
      filterInterventionByPrescriptionDrug(record.idPrescriptionDrug)
    );

    if (intvList.length) {
      classes.push("danger");
    }
  }

  if (record.startRow) {
    classes.push("start-row");
  }

  if (record.endRow) {
    classes.push("end-row");
  }

  if (record.groupRow) {
    classes.push("group-row");
  }

  if (record.groupRowLast) {
    classes.push("group-row-last");
  }

  if (record.solutionGroupRow) {
    classes.push("solution-group");
  }

  if (record.source === "solution") {
    classes.push("solution");
  }

  if (bag.selectedRows.indexOf(record.idPrescriptionDrug) !== -1) {
    classes.push("selected");
  }

  return classes.join(" ");
};

export default function PrescriptionDrugList({
  listType,
  isFetching,
  dataSource,
  headers,
  aggregated,
  emptyMessage,
  isSavingIntervention,
  periodObject,
  fetchPeriod,
  weight,
  admissionNumber,
  checkPrescriptionDrug,
  savePrescriptionDrugForm,
  idPrescription,
  idSegment,
  idHospital,
  formTemplate,
  select,
  selectPrescriptionDrug,
  uniqueDrugs,
  checkScreening,
  isCheckingPrescription,
  roles,
  features,
  permissions,
  interventions,
  infusion,
}) {
  const security = SecurityService(roles);
  const featureService = FeatureService(features);
  const permissionService = PermissionService(permissions);
  const prescriptionListType = useSelector(
    (state) => state.preferences.prescription.listType
  );
  const prescriptionListOrder = useSelector(
    (state) => state.preferences.prescription.listOrder
  );
  const prescriptionDrugOrder = useSelector(
    (state) => state.preferences.prescription.drugOrder
  );
  const filters = useSelector((state) => state.prescriptionv2.filters);
  const { t } = useTranslation();

  if (isFetching) {
    return (
      <LoadContainer>
        <LoadBox $absolute={true} />
      </LoadContainer>
    );
  }

  const selectIntervention = (int, data) => {
    select({
      ...data,
      intervention: {
        ...int,
      },
    });
  };

  const onShowModal = (data) => {
    const intvList = interventions.filter(
      filterInterventionByPrescriptionDrug(data.idPrescriptionDrug)
    );

    if (intvList.length > 0) {
      const modal = DefaultModal.info({
        title: "Intervenções",
        content: null,
        icon: null,
        width: 500,
        okText: "Fechar",
        okButtonProps: { type: "default" },
        wrapClassName: "default-modal",
      });

      modal.update({
        content: (
          <ChooseInterventionModal
            selectIntervention={selectIntervention}
            interventions={intvList}
            completeData={data}
            modalRef={modal}
            translate={t}
          />
        ),
      });
    } else {
      select({
        ...data,
        intervention: {
          nonce: Math.random(),
        },
      });
    }
  };

  const addMultipleIntervention = (selectedRows) => {
    select({
      intervention: {},
      idPrescriptionDrugList: selectedRows,
      admissionNumber,
      uniqueDrugList: uniqueDrugs,
    });
  };

  const bag = {
    onShowModal,
    selectPrescriptionDrug,
    check: checkPrescriptionDrug,
    idSegment,
    idHospital,
    admissionNumber,
    isSavingIntervention,
    periodObject,
    fetchPeriod,
    weight,
    uniqueDrugList: uniqueDrugs,
    headers,
    security,
    t,
    featureService,
    savePrescriptionDrugForm,
    formTemplate,
    interventions,
    condensed: prescriptionListType === "condensed",
    permissionService,
  };

  const table = (ds, showHeader) => {
    return (
      <Table
        hasFilter={false}
        filter={null}
        bag={bag}
        isFetching={isFetching}
        emptyMessage={emptyMessage}
        ds={{
          value: groupComponents(
            filterPrescriptionDrugs(ds.value, headers, filters),
            infusion,
            prescriptionDrugOrder
          ),
        }}
        listType={listType}
        showHeader={showHeader}
      />
    );
  };

  const panelHeader = (ds) => {
    const isChecked = headers[ds.key].status === "s";
    const source = isEmpty(ds.value) ? null : ds.value[0].source;
    let summary = null;
    if (headers[ds.key] && headers[ds.key][summarySourceToType(source)]) {
      summary = headers[ds.key][summarySourceToType(source)];
    }

    return (
      <PrescriptionHeader className="panel-header">
        <div className="panel-header-icon">
          {!isChecked && summary && summary.alerts > 0 && (
            <DrugAlertLevelTag
              levels={[summary.alertLevel]}
              count={summary.alerts}
              allergy={summary.allergy}
            />
          )}
        </div>
        <div className="panel-header-description">
          <div className="title">
            <strong className="p-number">
              {t("prescriptionDrugList.panelPrescription")} &nbsp;
              <a
                href={`/prescricao/${ds.key}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                # {ds.key}
              </a>
            </strong>
          </div>
          <div className="subtitle">
            <span style={{ paddingLeft: 0 }}>
              <strong>{t("prescriptionDrugList.panelIssueDate")}:</strong>{" "}
              &nbsp;
              {format(new Date(headers[ds.key].date), "dd/MM/yyyy HH:mm")}
            </span>
            <span>
              <strong>{t("prescriptionDrugList.panelValidUntil")}:</strong>{" "}
              &nbsp;
              <span
                className={
                  isExpired(headers[ds.key].expire, true) ? "expired" : ""
                }
              >
                {headers[ds.key].expire
                  ? format(new Date(headers[ds.key].expire), "dd/MM/yyyy HH:mm")
                  : " - "}
              </span>
            </span>
            <span>
              <strong>{t("prescriptionDrugList.panelBed")}:</strong> &nbsp;
              <Tooltip title={headers[ds.key].department} underline>
                {headers[ds.key].bed}
              </Tooltip>
            </span>
            <span>
              <strong>{t("prescriptionDrugList.panelPrescriber")}:</strong>{" "}
              &nbsp;
              {headers[ds.key].prescriber}
            </span>
          </div>
        </div>
      </PrescriptionHeader>
    );
  };

  const groupHeader = (dt, headerSummary) => {
    return (
      <PrescriptionHeader>
        {!headerSummary.checked &&
          headerSummary &&
          headerSummary.summary.alerts > 0 && (
            <DrugAlertLevelTag
              levels={headerSummary.summary.alertLevel}
              count={headerSummary.summary.alerts}
              allergy={headerSummary.summary.allergy}
            />
          )}
        <span style={{ fontSize: "16px", marginLeft: "10px" }}>
          <strong>{t("prescriptionDrugList.panelValidUntil")}:</strong> &nbsp;
          <span className={isExpired(`${dt}T23:59:59`) ? "expired" : ""}>
            {format(parseISO(dt), "dd/MM/yyyy")}
          </span>
        </span>
      </PrescriptionHeader>
    );
  };

  const summarySourceToType = (s) => {
    switch (sourceToStoreType(s)) {
      case "prescription":
        return "drugs";

      case "solution":
        if (featureService.hasDisableSolutionTab()) {
          return "drugs";
        }

        return "solutions";
      case "procedure":
        return "procedures";

      case "diet":
        return "diet";

      default:
        console.error("invalid source", s);
        return null;
    }
  };

  const prescriptionSummary = (id, header, source) => {
    return (
      <PanelAction
        id={id}
        aggId={aggregated ? idPrescription : null}
        header={header}
        source={source}
        checkScreening={checkScreening}
        isChecking={isCheckingPrescription}
        selectPrescriptionDrug={selectPrescriptionDrug}
        hasPrescriptionEdit={featureService.hasPrimaryCare()}
      />
    );
  };

  const groupSummary = (groupData) => {
    return <PanelAction groupData={groupData} />;
  };

  const list = (group) => {
    const msg = "Nenhuma prescrição encontrada.";

    if (isEmpty(dataSource)) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={msg} />;
    }

    if (security.hasCpoe()) {
      return <strong>error</strong>;
    }

    let hasPrescription = false;
    dataSource.forEach((ds) => {
      if (group.indexOf(`${ds.key}`) !== -1) {
        hasPrescription = true;
      }
    });

    if (!hasPrescription) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={msg} />;
    }

    const getCollapsePrescriptionItems = (ds) => [
      {
        key: "1",
        label: panelHeader(ds),
        extra: prescriptionSummary(
          ds.key,
          headers[ds.key],
          isEmpty(ds.value) ? null : ds.value[0].source
        ),
        className: headers[ds.key].status === "s" ? "checked" : "",
        children: table(ds, true),
      },
    ];

    if (prescriptionListType === "condensed") {
      const allItems = [];

      dataSource.forEach((i) => {
        if (group.indexOf(`${i.key}`) !== -1) {
          allItems.push(...i.value);
        }
      });

      return table(
        {
          value: allItems,
        },
        true
      );
    }

    const sortDs = (order) => {
      if (order === "desc") {
        return (a, b) =>
          `${headers[b.key].date}`.localeCompare(`${headers[a.key].date}`);
      }

      return (a, b) =>
        `${headers[a.key].date}`.localeCompare(`${headers[b.key].date}`);
    };

    const togglePrescriptionGroup = () => {
      trackPrescriptionAction(TrackedPrescriptionAction.EXPAND_PRESCRIPTION);
    };

    return dataSource
      .sort(sortDs(prescriptionListOrder))
      .map((ds, index) => (
        <div key={index}>
          {group.indexOf(`${ds.key}`) !== -1 && (
            <PrescriptionCollapse
              bordered
              defaultActiveKey={headers[ds.key].status === "s" ? [] : ["1"]}
              items={getCollapsePrescriptionItems(ds)}
              onChange={togglePrescriptionGroup}
            ></PrescriptionCollapse>
          )}
        </div>
      ));
  };

  if (!aggregated || security.hasCpoe()) {
    return (
      <>
        <Filters
          showPrescriptionOrder={false}
          addMultipleIntervention={addMultipleIntervention}
          showDiff={false}
        />

        {table(!isEmpty(dataSource) ? dataSource[0] : [])}
      </>
    );
  }

  const aggSummary = (currentData, addData) => {
    const baseData = currentData || {
      alerts: 0,
      allergy: 0,
      interventions: 0,
      np: 0,
      am: 0,
      av: 0,
      controlled: 0,
      alertLevel: [],
    };

    if (isEmpty(addData)) {
      return baseData;
    }

    const aggData = {};
    Object.keys(baseData).forEach((k) => {
      if (k === "alertLevel") {
        aggData[k] = [...baseData[k], addData[k]];
      } else {
        aggData[k] = baseData[k] + addData[k];
      }
    });

    return aggData;
  };

  const groups = {};
  const headerKeys = Object.keys(headers);

  headerKeys.forEach((k) => {
    const dt = headers[k].expire
      ? headers[k].expire.substr(0, 10)
      : headers[k].date.substr(0, 10);

    if (groups[dt]) {
      groups[dt].ids.push(k);
      groups[dt].summary = aggSummary(
        groups[dt].summary,
        headers[k][summarySourceToType(listType)]
      );
      if (headers[k].status !== "s") {
        groups[dt].checked = false;
      }
    } else {
      groups[dt] = {
        checked: headers[k].status === "s",
        ids: [k],
        summary: aggSummary(null, headers[k][summarySourceToType(listType)]),
      };
    }
  });

  const getGroups = (groups) => {
    if (prescriptionListOrder === "desc") {
      return Object.keys(groups).sort().reverse();
    }

    return Object.keys(groups).sort();
  };

  const getCollapseItems = (g) => [
    {
      key: "1",
      label: groupHeader(g, groups[g]),
      extra: groupSummary(groups[g]),
      className: groups[g].checked ? "checked" : "",
      children: list(groups[g].ids),
    },
  ];

  const toggleGroup = () => {
    trackPrescriptionAction(TrackedPrescriptionAction.EXPAND_DATE_GROUP);
  };

  return (
    <>
      <Filters
        showPrescriptionOrder
        addMultipleIntervention={addMultipleIntervention}
        showDiff={true}
      />

      {getGroups(groups).map((g) => (
        <GroupCollapse
          bordered={false}
          key={g}
          defaultActiveKey={groups[g].checked ? [] : ["1"]}
          items={getCollapseItems(g)}
          onChange={toggleGroup}
        ></GroupCollapse>
      ))}
    </>
  );
}
