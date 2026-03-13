import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "lodash";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import {
  CaretUpOutlined,
  CaretDownOutlined,
  SearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import Heading from "components/Heading";
import { Row, Col } from "components/Grid";
import { Select, RangeDatePicker } from "components/Inputs";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import Badge from "components/Badge";
import FilterMemory from "./components/FilterMemory";
import {
  setSelectedRows,
  setSelectedRowsActive,
} from "features/prescription/PrescriptionSlice";
import FilterFields from "./components/FilterFields";
import { datepickerRangeLimit } from "utils/date";
import {
  trackPrescriptionPrioritizationAction,
  TrackedPrescriptionPrioritizationAction,
} from "src/utils/tracker";
import notification from "components/notification";

import { Box } from "./Filter.style";
import { SearchBox, FilterCard } from "components/AdvancedFilter/index.style";
import "./index.css";

export default function Filter({
  fetchPrescriptionsList,
  segments,
  fetchFrequencies,
  updatePrescriptionListStatus,
  filter,
  setScreeningListFilter,
  isFetchingPrescription,
  drugs,
  frequencies,
  searchDrugs,
  prioritizationType,
  fetchMemory,
  saveMemory,
  account,
  privateFilters,
  publicFilters,
  featureService,
}) {
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const [date, setDate] = useState([dayjs(params?.startDate), null]);
  const { t } = useTranslation();

  const getParams = useCallback(
    (forceParams) => {
      const params = {
        idSegment: filter.idSegment,
        idDept: filter.idDepartment,
        idDrug: filter.idDrug,
        pending: filter.pending,
        allDrugs: filter.allDrugs,
        discharged: filter.discharged,
        currentDepartment:
          prioritizationType === "patient" || prioritizationType === "cards"
            ? filter.currentDepartment
            : 0,
        agg:
          prioritizationType === "patient" || prioritizationType === "cards"
            ? 1
            : 0,
        concilia: prioritizationType === "conciliation" ? 1 : 0,
        startDate: date[0] ? date[0].format("YYYY-MM-DD") : "all",
        endDate: date[1] ? date[1].format("YYYY-MM-DD") : "all",
        insurance: filter.insurance,
        medical_record: filter.medical_record,
        bed: filter.bed,
        city: filter.city,
        indicators: filter.indicators,
        drugAttributes: filter.drugAttributes,
        frequencies: filter.frequencies,
        substances: filter.substances,
        substanceClasses: filter.substanceClasses,
        patientStatus: filter.patientStatus,
        patientReviewType: filter.patientReviewType,
        idPatient: filter.idPatient,
        idPatientByNameList: filter.idPatientByNameList,
        idIcdList: filter.idIcdList,
        idIcdGroupList: filter.idIcdGroupList,
        intervals: filter.intervals,
        prescriber:
          prioritizationType === "patient" || prioritizationType === "cards"
            ? null
            : filter.prescriber,
        diff: filter.diff,
        alertLevel: filter.alertLevel,
        globalScoreMin: filter.globalScoreMin,
        globalScoreMax: filter.globalScoreMax,
        ageMin: filter.ageMin,
        ageMax: filter.ageMax,
        pendingInterventions: filter.pendingInterventions,
        tags: filter.tags,
        protocols: filter.protocols,
        bedList: filter.bedList,
        specialtyList: filter.specialtyList,
        hasClinicalNotes: filter.hasClinicalNotes,
        hasConciliation:
          prioritizationType === "patient" || prioritizationType === "cards"
            ? filter.hasConciliation
            : null,
      };
      const mixedParams = { ...params, ...forceParams };
      const finalParams = {};

      for (const key in mixedParams) {
        if (mixedParams[key] !== "all") {
          if (key === "idSegment") {
            finalParams[key] = Array.isArray(mixedParams[key])
              ? mixedParams[key]
              : [mixedParams[key]];
          } else {
            finalParams[key] = mixedParams[key];
          }
        }
      }

      if (finalParams.substances && finalParams.substances.length) {
        finalParams.substances = finalParams.substances.map((s) => s.value);
      }

      if (finalParams.substanceClasses && finalParams.substanceClasses.length) {
        finalParams.substanceClasses = finalParams.substanceClasses.map(
          (s) => s.value,
        );
      }

      return finalParams;
    },
    [
      filter.idSegment,
      filter.idDepartment,
      filter.idDrug,
      filter.pending,
      filter.allDrugs,
      filter.discharged,
      filter.currentDepartment,
      filter.insurance,
      filter.medical_record,
      filter.bed,
      filter.city,
      filter.indicators,
      filter.drugAttributes,
      filter.frequencies,
      filter.patientStatus,
      filter.substances,
      filter.substanceClasses,
      filter.patientReviewType,
      filter.idPatient,
      filter.idPatientByNameList,
      filter.idIcdList,
      filter.idIcdGroupList,
      filter.intervals,
      filter.prescriber,
      filter.diff,
      filter.globalScoreMin,
      filter.globalScoreMax,
      filter.ageMin,
      filter.ageMax,
      filter.pendingInterventions,
      filter.hasConciliation,
      filter.alertLevel,
      filter.tags,
      filter.protocols,
      filter.hasClinicalNotes,
      filter.bedList,
      filter.specialtyList,
      prioritizationType,
      date,
    ],
  );

  // update list status
  const updateStatus = useCallback(() => {
    if (segments.list.length === 0) return;

    updatePrescriptionListStatus(getParams());
  }, [segments, updatePrescriptionListStatus, getParams]);

  useEffect(() => {
    window.addEventListener("focus", updateStatus);

    return () => {
      window.removeEventListener("focus", updateStatus);
    };
  }, [updateStatus]);

  useEffect(() => {
    if (filter.idSegment) {
      fetchPrescriptionsList(getParams());
    }

    if (!isEmpty(filter.idDrug)) {
      searchDrugs(null, { idDrug: filter.idDrug, group: 0 });
    }

    dispatch(setSelectedRows([]));
    dispatch(setSelectedRowsActive(false));
  }, [location.pathname]); // eslint-disable-line

  const loadFilter = (filterData) => {
    if (filterData.bed) {
      notification.warning({
        message:
          "O filtro de 'Leito' foi atualizado e agora permite selecionar múltiplos itens. Como este filtro salvo utiliza o formato antigo, por favor, remova-o e configure-o novamente para utilizar a nova Lista de Leitos.",
        duration: 15,
      });
    }

    fetchPrescriptionsList(
      getParams({ ...filterData, idDept: filterData.idDepartment }),
    );
    if (!isEmpty(filterData.idDrug)) {
      searchDrugs(null, { idDrug: filterData.idDrug, group: 0 });
    }
    setOpen(false);

    trackPrescriptionPrioritizationAction(
      TrackedPrescriptionPrioritizationAction.APPLY_FILTER,
    );
  };

  const onDateChange = (dt) => {
    setDate(dt);
  };

  const search = () => {
    fetchPrescriptionsList(getParams());
    setOpen(false);
    dispatch(setSelectedRows([]));
    dispatch(setSelectedRowsActive(false));

    trackPrescriptionPrioritizationAction(
      TrackedPrescriptionPrioritizationAction.CLICK_SEARCH,
    );
  };

  const reset = () => {
    setScreeningListFilter({
      idSegment: [],
      idDepartment: [],
      idDrug: [],
      insurance: null,
      city: null,
      medical_record: null,
      bed: null,
      pending: 0,
      allDrugs: 0,
      discharged: 0,
      indicators: [],
      drugAttributes: [],
      frequencies: [],
      substances: [],
      substanceClasses: [],
      patientStatus: null,
      patientReviewType: null,
      idPatient: [],
      idPatientByNameList: [],
      idIcdList: [],
      idIcdGroupList: [],
      intervals: [],
      prescriber: null,
      diff: null,
      globalScoreMin: null,
      globalScoreMax: null,
      ageMin: null,
      ageMax: null,
      pendingInterventions: null,
      hasConciliation: null,
      alertLevel: null,
      tags: [],
      protocols: [],
      hasClinicalNotes: null,
      bedList: [],
      specialtyList: [],
    });
    setDate([dayjs(), null]);

    trackPrescriptionPrioritizationAction(
      TrackedPrescriptionPrioritizationAction.CLICK_RESET,
    );
  };

  const countHiddenFilters = (filters) => {
    const skip = ["idSegment", "agg"];
    let count = 0;

    Object.keys(filters).forEach((key) => {
      if (skip.indexOf(key) !== -1) return;

      if (!isEmpty(filter[key]) || filter[key] === true || filter[key] > 0) {
        count++;
      }
    });

    return count;
  };

  const clickSeeMore = () => {
    setOpen(!open);

    if (!open) {
      trackPrescriptionPrioritizationAction(
        TrackedPrescriptionPrioritizationAction.CLICK_SEE_MORE,
      );
    }
  };

  const hiddenFieldCount = countHiddenFilters(filter);
  return (
    <FilterCard>
      <SearchBox className={open ? "open" : ""}>
        <Row gutter={[16, 24]} type="flex">
          <Col xs={24} md={8}>
            <Box>
              <Heading as="label" htmlFor="segments" $size="14px">
                {t("screeningList.segment")}:
              </Heading>
              <Select
                id="segments"
                style={{ width: "100%" }}
                loading={segments.isFetching}
                onChange={(idSegment) =>
                  setScreeningListFilter({ idSegment, idDepartment: [] })
                }
                value={filter.idSegment}
                mode="multiple"
                allowClear
                maxTagCount="responsive"
                showSearch={{
                  optionFilterProp: ["children"],
                }}
              >
                {prioritizationType === "prescription" ? (
                  <>
                    {segments.list
                      .filter((s) => !s.cpoe)
                      .map(({ id, description: text }) => (
                        <Select.Option key={id} value={id}>
                          {text}
                        </Select.Option>
                      ))}
                  </>
                ) : (
                  <>
                    {segments.list.map(({ id, description: text }) => (
                      <Select.Option key={id} value={id}>
                        {text}
                      </Select.Option>
                    ))}
                  </>
                )}
              </Select>
            </Box>
          </Col>
          <Col md={7} lg={7} xxl={5}>
            <Box>
              <Heading as="label" htmlFor="date" $size="14px">
                {t("screeningList.date")}:
              </Heading>
              <RangeDatePicker
                format="DD/MM/YYYY"
                value={date}
                onChange={onDateChange}
                allowClear={false}
                disabledDate={datepickerRangeLimit(120)}
              />
            </Box>
          </Col>
          <Col md={4}>
            <div style={{ display: "flex" }}>
              <Tooltip
                title={
                  hiddenFieldCount > 0 ? "Existem mais filtros aplicados" : ""
                }
              >
                <Button
                  type="link"
                  className="gtm-btn-adv-search"
                  onClick={() => clickSeeMore()}
                  style={{ marginTop: "14px", paddingLeft: 0 }}
                >
                  <Badge count={hiddenFieldCount}>
                    {t("screeningList.seeMore")}
                  </Badge>
                  {open ? <CaretUpOutlined /> : <CaretDownOutlined />}
                </Button>
              </Tooltip>

              <Tooltip title={t("screeningList.search")}>
                <Button
                  type="secondary"
                  shape="circle"
                  icon={<SearchOutlined />}
                  onClick={search}
                  size="large"
                  className="gtm-btn-search"
                  style={{ marginTop: "7px" }}
                  loading={isFetchingPrescription}
                />
              </Tooltip>
              <Tooltip title={t("screeningList.resetFilter")}>
                <Button
                  className="gtm-btn-reset"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={reset}
                  style={{ marginTop: "11px", marginLeft: "5px" }}
                  loading={isFetchingPrescription}
                />
              </Tooltip>
              <FilterMemory
                fetchMemory={fetchMemory}
                account={account}
                publicFilters={publicFilters}
                privateFilters={privateFilters}
                saveMemory={saveMemory}
                filter={filter}
                setScreeningListFilter={setScreeningListFilter}
                loadFilter={loadFilter}
              />
            </div>
          </Col>
        </Row>

        <div className="filters">
          <FilterFields
            featureService={featureService}
            prioritizationType={prioritizationType}
            setScreeningListFilter={setScreeningListFilter}
            fetchFrequencies={fetchFrequencies}
            frequencies={frequencies}
            filter={filter}
            drugs={drugs}
            segments={segments}
            searchDrugs={searchDrugs}
            open={open}
          />
        </div>
      </SearchBox>
    </FilterCard>
  );
}
