import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col } from "antd";
import isEmpty from "lodash.isempty";
import debounce from "lodash.debounce";

import Heading from "components/Heading";
import { Select, Checkbox, Input, InputNumber } from "components/Inputs";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import LoadBox from "components/LoadBox";
import FieldSubstanceAutocomplete from "features/fields/FieldSubstanceAutocomplete/FieldSubstanceAutocomplete";
import FieldSubstanceClassAutocomplete from "features/fields/FieldSubstanceClassAutocomplete/FieldSubstanceClassAutocomplete";
import { getUniqBy } from "utils/report";

import { Box } from "../Filter.style";

export default function FilterFields({
  featureService,
  prioritizationType,
  setScreeningListFilter,
  fetchFrequencies,
  frequencies,
  filter,
  drugs,
  segments,
  searchDrugs,
}) {
  const { t } = useTranslation();
  const departments = useSelector(
    (state) => state.lists.getSegmentDepartments.list
  );
  const departmentsStatus = useSelector(
    (state) => state.lists.getSegmentDepartments.status
  );

  const loadFrequencies = () => {
    if (isEmpty(frequencies.list)) {
      fetchFrequencies();
    }
  };

  const onDepartmentChange = (idDept) => {
    setScreeningListFilter({ idDepartment: idDept });
  };

  const onIndicatorsChange = (indicators) => {
    setScreeningListFilter({ indicators: indicators });
  };

  const onDrugAttributesChange = (drugAttributes) => {
    setScreeningListFilter({ drugAttributes });
  };

  const onPatientStatusChange = (status) => {
    setScreeningListFilter({ patientStatus: status });
  };

  const onPatientReviewTypeChange = (type) => {
    setScreeningListFilter({ patientReviewType: type });
  };

  const onCurrentDepartmentChange = (e) => {
    setScreeningListFilter({ currentDepartment: e.target.checked ? 1 : 0 });
  };

  const onAllDrugsChange = (e) => {
    setScreeningListFilter({ allDrugs: e.target.checked ? 1 : 0 });
  };

  const onDrugChange = (idDrug) => {
    setScreeningListFilter({ idDrug });
  };

  const onFrequenciesChange = (id) => {
    setScreeningListFilter({ frequencies: id });
  };

  const onPendingChange = (pending) => {
    setScreeningListFilter({ pending: pending ? 1 : 0 });
  };

  const onInsuranceChange = (value) => {
    setScreeningListFilter({ insurance: value });
  };

  const searchDrugsAutocomplete = debounce((value) => {
    if (value.length < 3) return;
    searchDrugs(null, { q: value });
  }, 800);

  const drugAttributesList = [
    "antimicro",
    "mav",
    "controlled",
    "dialyzable",
    "notdefault",
    "elderly",
    "fallRisk",
    "tube",
    "whiteList",
    "chemo",
  ];

  const intervals = [];
  for (let i = 0; i < 25; i++) {
    intervals.push(
      i.toLocaleString("pt-BR", {
        minimumIntegerDigits: 2,
      })
    );
  }
  intervals.push("SN");

  const filterDepartments = (idSegmentList, list) => {
    const deps = list.filter((d) => {
      if (!idSegmentList || idSegmentList.length === 0) {
        return true;
      }

      if (Array.isArray(idSegmentList)) {
        return idSegmentList.indexOf(d.idSegment) !== -1;
      }

      // keep compatibility
      return idSegmentList === d.idSegment;
    });

    return getUniqBy(deps, "idDepartment");
  };

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px" }}>
      <Col md={24} xl={18} xxl={14}>
        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col
                  md={
                    prioritizationType === "patient" ||
                    prioritizationType === "cards"
                      ? 19
                      : 24
                  }
                >
                  <Heading as="label" htmlFor="departments" size="14px">
                    {t("screeningList.labelDepartment")}:
                  </Heading>
                  <Select
                    id="departments"
                    mode="multiple"
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    placeholder={t("screeningList.labelDepartmentPlaceholder")}
                    loading={departmentsStatus === "loading"}
                    value={filter.idDepartment}
                    onChange={onDepartmentChange}
                    autoClearSearchValue={false}
                    allowClear
                  >
                    {filterDepartments(filter.idSegment, departments).map(
                      ({ idDepartment, idSegment, label }) => (
                        <Select.Option
                          key={`${idSegment}-${idDepartment}`}
                          value={idDepartment}
                        >
                          {label}
                        </Select.Option>
                      )
                    )}
                  </Select>
                </Col>
                {prioritizationType === "patient" ||
                  (prioritizationType === "cards" && (
                    <Col md={5}>
                      <Checkbox
                        style={{ marginTop: "17px", marginLeft: "10px" }}
                        checked={filter.currentDepartment}
                        onChange={onCurrentDepartmentChange}
                        id="gtm-currentDepartment-filter"
                      >
                        <Tooltip
                          title={t("screeningList.labelCurrentDepartmentHint")}
                          underline
                        >
                          {t("screeningList.labelCurrentDepartment")}
                        </Tooltip>
                      </Checkbox>
                    </Col>
                  ))}
              </Row>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={19}>
            <Box>
              <Heading as="label" htmlFor="drugs-filter" size="14px">
                {t("screeningList.labelDrug")}:
              </Heading>
              <Select
                id="drugs-filter"
                mode="multiple"
                optionFilterProp="children"
                style={{ width: "100%" }}
                placeholder={t("screeningList.labelDrugPlaceholder")}
                onChange={onDrugChange}
                value={filter.idDrug}
                notFoundContent={drugs.isFetching ? <LoadBox /> : null}
                filterOption={false}
                allowClear
                onSearch={searchDrugsAutocomplete}
              >
                {drugs.list.map(({ idDrug, name }) => (
                  <Select.Option key={idDrug} value={idDrug}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Box>
          </Col>
          <Col md={5}>
            <Checkbox
              style={{ marginTop: "17px", marginLeft: "10px" }}
              checked={filter.allDrugs}
              onChange={onAllDrugsChange}
              id="gtm-allDrugs-filter"
            >
              <Tooltip title={t("screeningList.labelAllDrugsHint")} underline>
                {t("screeningList.labelAllDrugs")}
              </Tooltip>
            </Checkbox>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={19}>
            <Box>
              <Heading as="label" htmlFor="drugs-filter" size="14px">
                {t("labels.substance")}:
              </Heading>
              <FieldSubstanceAutocomplete
                value={filter.substances}
                onChange={(value) =>
                  setScreeningListFilter({ substances: value })
                }
                style={{ width: "100%" }}
              ></FieldSubstanceAutocomplete>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={19}>
            <Box>
              <Heading as="label" htmlFor="drugs-filter" size="14px">
                {t("labels.substanceClass")}:
              </Heading>
              <FieldSubstanceClassAutocomplete
                value={filter.substanceClasses}
                onChange={(value) =>
                  setScreeningListFilter({ substanceClasses: value })
                }
                style={{ width: "100%" }}
              ></FieldSubstanceClassAutocomplete>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col md={19}>
                  <Heading as="label" size="14px">
                    {t("labels.drugAttributes")}:
                  </Heading>
                  <Select
                    mode="multiple"
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    loading={segments.single.isFetching}
                    value={filter.drugAttributes}
                    onChange={onDrugAttributesChange}
                    autoClearSearchValue={false}
                    allowClear
                  >
                    {drugAttributesList.map((a) => (
                      <Select.Option key={a} value={a}>
                        {t(`drugAttributes.${a}`)}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={19}>
            <Box>
              <Heading as="label" htmlFor="drugs-filter" size="14px">
                {t("labels.frequencies")}:
              </Heading>
              <Select
                id="frequencies-filter"
                mode="multiple"
                optionFilterProp="children"
                style={{ width: "100%" }}
                placeholder={t("screeningList.labelFrequenciesPlaceholder")}
                value={filter.frequencies}
                notFoundContent={frequencies.isFetching ? <LoadBox /> : null}
                loading={frequencies.isFetching}
                allowClear
                autoClearSearchValue={false}
                onClick={() => loadFrequencies()}
                onChange={onFrequenciesChange}
              >
                {frequencies.list.map(({ id, description }) => (
                  <Select.Option key={id} value={id}>
                    {description} ({id})
                  </Select.Option>
                ))}
              </Select>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col md={19}>
                  <Heading as="label" htmlFor="intervals" size="14px">
                    Horários:
                  </Heading>
                  <Select
                    id="intervals"
                    mode="multiple"
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    value={filter.intervals}
                    onChange={(value) =>
                      setScreeningListFilter({ intervals: value })
                    }
                    autoClearSearchValue={false}
                    allowClear
                  >
                    {intervals.map((i) => (
                      <Select.Option key={i} value={i}>
                        {i}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col md={19}>
                  <Heading as="label" htmlFor="indicators" size="14px">
                    {t("tableHeader.alerts")}:
                  </Heading>
                  <Select
                    id="indicators"
                    mode="multiple"
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    placeholder={t("screeningList.labelAlertsPlaceholder")}
                    loading={segments.single.isFetching}
                    value={filter.indicators}
                    onChange={onIndicatorsChange}
                    autoClearSearchValue={false}
                    allowClear
                  >
                    <Select.Option key={"allergy"} value={"allergy"}>
                      {t("drugAlertType.allergy")}
                    </Select.Option>
                    <Select.Option key={"maxDose"} value={"maxDose"}>
                      {t("drugAlertType.maxDose")}
                    </Select.Option>
                    <Select.Option key={"maxDosePlus"} value={"maxDosePlus"}>
                      {t("drugAlertType.maxDosePlus")}
                    </Select.Option>
                    <Select.Option key={"dm"} value={"dm"}>
                      {t("drugAlertType.dm")}
                    </Select.Option>
                    <Select.Option key={"dt"} value={"dt"}>
                      {t("drugAlertType.dt")}
                    </Select.Option>
                    <Select.Option key={"liver"} value={"liver"}>
                      {t("drugAlertType.liver")}
                    </Select.Option>
                    <Select.Option key={"iy"} value={"iy"}>
                      {t("drugAlertType.iy")}
                    </Select.Option>
                    <Select.Option key={"it"} value={"it"}>
                      {t("drugAlertType.it")}
                    </Select.Option>
                    <Select.Option key={"ira"} value={"ira"}>
                      {t("drugAlertType.ira")}
                    </Select.Option>
                    <Select.Option key={"sl"} value={"sl"}>
                      {t("drugAlertType.sl")}
                    </Select.Option>
                    <Select.Option key={"elderly"} value={"elderly"}>
                      {t("drugAlertType.elderly")}
                    </Select.Option>
                    <Select.Option key={"kidney"} value={"kidney"}>
                      {t("drugAlertType.kidney")}
                    </Select.Option>
                    <Select.Option key={"platelets"} value={"platelets"}>
                      {t("drugAlertType.platelets")}
                    </Select.Option>
                    <Select.Option key={"rx"} value={"rx"}>
                      {t("drugAlertType.rx")}
                    </Select.Option>
                    <Select.Option key={"tube"} value={"tube"}>
                      {t("drugAlertType.tube")}
                    </Select.Option>
                    <Select.Option key={"maxTime"} value={"maxTime"}>
                      {t("drugAlertType.maxTime")}
                    </Select.Option>
                    <Select.Option key={"fasting"} value={"fasting"}>
                      {t("drugAlertType.fasting")}
                    </Select.Option>
                  </Select>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={19}>
            <Box>
              <Heading as="label" size="14px">
                Convênio:
              </Heading>
              <Input
                style={{ width: "100%" }}
                value={filter.insurance}
                onChange={({ target }) => onInsuranceChange(target.value)}
              ></Input>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col md={19}>
                  <Heading as="label" htmlFor="patientStatus" size="14px">
                    {t("tableHeader.patientStatus")}:
                  </Heading>
                  <Select
                    id="patientStatus"
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    placeholder={t(
                      "screeningList.labelPatientStatusPlaceholder"
                    )}
                    loading={segments.single.isFetching}
                    value={filter.patientStatus}
                    onChange={onPatientStatusChange}
                    autoClearSearchValue={false}
                    allowClear
                  >
                    <Select.Option value="DISCHARGED">
                      Paciente com alta
                    </Select.Option>

                    <Select.Option value="ACTIVE">
                      Paciente internado
                    </Select.Option>
                  </Select>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>

        {featureService.hasPatientRevision() &&
          (prioritizationType === "patient" ||
            prioritizationType === "cards") && (
            <Row gutter={0} style={{ marginTop: "10px" }}>
              <Col md={24}>
                <Box>
                  <Row gutter={0} style={{ width: "100%" }}>
                    <Col md={19}>
                      <Heading
                        as="label"
                        htmlFor="patientReviewType"
                        size="14px"
                      >
                        {t("screeningList.labelPatientReviewType")}:
                      </Heading>
                      <Select
                        id="patientReviewType"
                        optionFilterProp="children"
                        style={{ width: "100%" }}
                        placeholder={t(
                          "screeningList.labelPatientReviewTypePlaceholder"
                        )}
                        loading={segments.single.isFetching}
                        value={filter.patientReviewType}
                        onChange={onPatientReviewTypeChange}
                        autoClearSearchValue={false}
                        allowClear
                      >
                        <Select.Option value={0}>
                          {t("tableHeader.pending")}
                        </Select.Option>

                        <Select.Option value={1}>
                          {t("labels.reviewed")}
                        </Select.Option>
                      </Select>
                    </Col>
                  </Row>
                </Box>
              </Col>
            </Row>
          )}

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col md={19}>
                  <Heading as="label" htmlFor="indicators" size="14px">
                    ID Paciente:
                  </Heading>
                  <Select
                    id="idPatient"
                    mode="tags"
                    placeholder="Digite o ID do paciente e pressione enter"
                    tokenSeparators={[","]}
                    style={{ width: "100%" }}
                    value={filter.idPatient}
                    onChange={(value) =>
                      setScreeningListFilter({ idPatient: value })
                    }
                    notFoundContent="Digite o ID do paciente e pressione enter. Mais de um ID pode ser informado."
                    allowClear
                  ></Select>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>

        {(prioritizationType === "conciliation" ||
          prioritizationType === "prescription") && (
          <Row gutter={0} style={{ marginTop: "10px" }}>
            <Col md={24}>
              <Box>
                <Row gutter={0} style={{ width: "100%" }}>
                  <Col md={19}>
                    <Heading as="label" htmlFor="indicators" size="14px">
                      {prioritizationType === "conciliation"
                        ? t("labels.responsible")
                        : t("labels.prescriber")}
                    </Heading>
                    <Input
                      style={{ width: "100%" }}
                      value={filter.prescriber}
                      onChange={({ target }) =>
                        setScreeningListFilter({ prescriber: target.value })
                      }
                    ></Input>
                  </Col>
                </Row>
              </Box>
            </Col>
          </Row>
        )}

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col md={19}>
                  <Heading as="label" size="14px">
                    Possui diferentes:
                  </Heading>
                  <Select
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    value={filter.diff}
                    onChange={(value) =>
                      setScreeningListFilter({ diff: value })
                    }
                    allowClear
                  >
                    <Select.Option value={0}>{t("labels.no")}</Select.Option>

                    <Select.Option value={1}>{t("labels.yes")}</Select.Option>
                  </Select>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col md={19}>
                  <Heading as="label" size="14px">
                    Possui intervenções pendentes:
                  </Heading>
                  <Select
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    value={filter.pendingInterventions}
                    onChange={(value) =>
                      setScreeningListFilter({ pendingInterventions: value })
                    }
                    allowClear
                  >
                    <Select.Option value={0}>{t("labels.no")}</Select.Option>

                    <Select.Option value={1}>{t("labels.yes")}</Select.Option>
                  </Select>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>

        <Row gutter={0} style={{ marginTop: "10px" }}>
          <Col md={24}>
            <Box>
              <Row gutter={0} style={{ width: "100%" }}>
                <Col md={19}>
                  <Heading as="label" htmlFor="patientReviewType" size="14px">
                    Escore Global:
                  </Heading>
                  <InputNumber
                    style={{ width: "150px" }}
                    value={filter.globalScoreMin}
                    onChange={(value) =>
                      setScreeningListFilter({ globalScoreMin: value })
                    }
                    min={0}
                  ></InputNumber>
                  <span style={{ padding: "0 15px" }}>até</span>
                  <InputNumber
                    style={{ width: "150px" }}
                    value={filter.globalScoreMax}
                    onChange={(value) =>
                      setScreeningListFilter({ globalScoreMax: value })
                    }
                    min={0}
                  ></InputNumber>
                </Col>
              </Row>
            </Box>
          </Col>
        </Row>

        <Row gutter={[20, 0]} style={{ marginTop: "20px" }}>
          <Col>
            <Box flexDirection="row" alignItems="center">
              <Heading
                as="label"
                htmlFor="pending-filter"
                size="14px"
                style={{ minWidth: "230px" }}
              >
                {t("screeningList.labelPendingPrescription")}
              </Heading>

              <Switch
                style={{ marginLeft: "10px" }}
                onChange={onPendingChange}
                checked={filter.pending === 1}
                id="gtm-pending-filter"
              />
            </Box>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
