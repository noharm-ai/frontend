import React, { useState } from "react";
import isEmpty from "lodash.isempty";
import { format, parseISO, differenceInHours } from "date-fns";
import { useTranslation } from "react-i18next";

import LoadBox, { LoadContainer } from "components/LoadBox";
import Empty from "components/Empty";
import Collapse from "components/Collapse";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import { sourceToStoreType } from "utils/transformers/prescriptions";
import { filterInterventionByPrescriptionDrug } from "utils/transformers/intervention";

import FormIntervention from "containers/Forms/Intervention";

import {
  GroupPanel,
  PrescriptionPanel,
  PrescriptionHeader,
} from "./PrescriptionDrug.style";
import Table from "./components/Table";
import PanelAction from "./components/PanelAction";
import ChooseInterventionModal from "./components/ChooseInterventionModal";

const isExpired = (date) => {
  if (!date) return false;

  if (parseISO(date).getTime() < Date.now()) {
    return true;
  }

  return false;
};

export const rowClassName = (record, bag) => {
  const classes = [];
  let expiresIn = null;
  const hasExpireInfo = record.cpoe;

  if (hasExpireInfo && !record.suspended) {
    if (bag.headers[record.cpoe].expire) {
      const expirationDate = parseISO(bag.headers[record.cpoe].expire);
      const currentDate = new Date();
      expiresIn = differenceInHours(expirationDate, currentDate);
    }
  }

  if (hasExpireInfo && expiresIn < 0) {
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

  if (record.whiteList && !record.total) {
    classes.push("checked");
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

  return classes.join(" ");
};

export default function PrescriptionDrugList({
  listType,
  isFetching,
  dataSource,
  headers,
  aggregated,
  emptyMessage,
  saveInterventionStatus,
  checkIntervention,
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
  security,
  featureService,
  interventions,
}) {
  const [visible, setVisibility] = useState(false);
  const { t } = useTranslation();

  if (isFetching) {
    return (
      <LoadContainer>
        <LoadBox absolute={true} />
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
    setVisibility(true);
  };

  const onShowModal = (data) => {
    if (!featureService.hasMultipleIntervention()) {
      select(data);
      setVisibility(true);
      return;
    }

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
      });

      modal.update({
        content: (
          <ChooseInterventionModal
            selectIntervention={selectIntervention}
            interventions={intvList}
            completeData={data}
            modalRef={modal}
          />
        ),
      });
    } else {
      select({
        ...data,
        intervention: {},
      });
      setVisibility(true);
    }
  };

  const bag = {
    onShowModal,
    selectPrescriptionDrug,
    check: checkPrescriptionDrug,
    idSegment,
    idHospital,
    admissionNumber,
    saveInterventionStatus,
    checkIntervention,
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
  };

  const table = (ds, showHeader) => (
    <Table
      hasFilter={false}
      filter={null}
      bag={bag}
      isFetching={isFetching}
      emptyMessage={emptyMessage}
      ds={ds}
      listType={listType}
      showHeader={showHeader}
    />
  );

  const panelHeader = (ds) => (
    <PrescriptionHeader className="panel-header">
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
          <strong>{t("prescriptionDrugList.panelIssueDate")}:</strong> &nbsp;
          {format(new Date(headers[ds.key].date), "dd/MM/yyyy HH:mm")}
        </span>
        <span>
          <strong>{t("prescriptionDrugList.panelValidUntil")}:</strong> &nbsp;
          <span
            className={isExpired(headers[ds.key].expire, true) ? "expired" : ""}
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
          <strong>{t("prescriptionDrugList.panelPrescriber")}:</strong> &nbsp;
          {headers[ds.key].prescriber}
        </span>
      </div>
    </PrescriptionHeader>
  );

  const groupHeader = (dt) => (
    <PrescriptionHeader>
      <span style={{ fontSize: "16px" }}>
        <strong>{t("prescriptionDrugList.panelValidUntil")}:</strong> &nbsp;
        <span className={isExpired(`${dt}T23:59:59`) ? "expired" : ""}>
          {format(parseISO(dt), "dd/MM/yyyy")}
        </span>
      </span>
    </PrescriptionHeader>
  );

  const summarySourceToType = (s) => {
    switch (sourceToStoreType(s)) {
      case "prescription":
        return "drugs";

      case "solution":
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
        hasPrescriptionEdit={security.hasPrescriptionEdit()}
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
      const cpoeListByDate = dataSource[0].value.filter(
        (i) => group.indexOf(`${i.cpoe}`) !== -1
      );
      return table({ key: dataSource[0].key, value: cpoeListByDate }, true);
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

    return dataSource.map((ds, index) => (
      <div key={index}>
        {group.indexOf(`${ds.key}`) !== -1 && (
          <Collapse
            bordered
            defaultActiveKey={headers[ds.key].status === "s" ? [] : ["1"]}
          >
            <PrescriptionPanel
              header={panelHeader(ds)}
              key="1"
              className={headers[ds.key].status === "s" ? "checked" : ""}
              extra={prescriptionSummary(
                ds.key,
                headers[ds.key],
                isEmpty(ds.value) ? null : ds.value[0].source
              )}
            >
              {table(ds, true)}
            </PrescriptionPanel>
          </Collapse>
        )}
      </div>
    ));
  };

  if (!aggregated || security.hasCpoe()) {
    return (
      <>
        {table(!isEmpty(dataSource) ? dataSource[0] : [])}
        <FormIntervention
          open={visible}
          setVisibility={setVisibility}
          checkPrescriptionDrug={checkPrescriptionDrug}
        />
      </>
    );
  }

  const aggSummary = (currentData, addData) => {
    const baseData = currentData || {
      alerts: 0,
      alergy: 0,
      interventions: 0,
      np: 0,
      am: 0,
      av: 0,
      controlled: 0,
    };

    if (isEmpty(addData)) {
      return baseData;
    }

    const aggData = {};
    Object.keys(baseData).forEach((k) => {
      aggData[k] = baseData[k] + addData[k];
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
    if (featureService.hasPrimaryCare()) {
      return Object.keys(groups).sort().reverse();
    }

    return Object.keys(groups).sort();
  };

  return (
    <>
      {getGroups(groups).map((g) => (
        <Collapse
          bordered={false}
          key={g}
          defaultActiveKey={groups[g].checked ? [] : ["1"]}
        >
          <GroupPanel
            header={groupHeader(g)}
            key="1"
            className={groups[g].checked ? "checked" : ""}
            extra={groupSummary(groups[g])}
          >
            {list(groups[g].ids)}
          </GroupPanel>
        </Collapse>
      ))}
      <FormIntervention
        open={visible}
        setVisibility={setVisibility}
        checkPrescriptionDrug={checkPrescriptionDrug}
      />
    </>
  );
}
