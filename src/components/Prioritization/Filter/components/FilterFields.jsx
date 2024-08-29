import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col, Card } from "antd";
import isEmpty from "lodash.isempty";
import debounce from "lodash.debounce";

import { Select, Checkbox, Input, InputNumber, Radio } from "components/Inputs";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import LoadBox from "components/LoadBox";
import FieldSubstanceAutocomplete from "features/fields/FieldSubstanceAutocomplete/FieldSubstanceAutocomplete";
import FieldSubstanceClassAutocomplete from "features/fields/FieldSubstanceClassAutocomplete/FieldSubstanceClassAutocomplete";
import { getUniqBy } from "utils/report";

import { Form } from "styles/Form.style";

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

  const yesNoOptionsNullable = [
    { label: "Sim", value: 1 },
    { label: "Não", value: 0 },
    { label: "Todos", value: null },
  ];

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      <Col md={12}>
        <Card
          title="Prescrição"
          bordered
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>{t("screeningList.labelDepartment")}:</label>
              </div>
              <div className="form-input">
                <Select
                  id="departments"
                  mode="multiple"
                  optionFilterProp="children"
                  placeholder={t("screeningList.labelDepartmentPlaceholder")}
                  loading={departmentsStatus === "loading"}
                  value={filter.idDepartment}
                  onChange={onDepartmentChange}
                  autoClearSearchValue={false}
                  className={filter.idDepartment?.length ? "warning" : null}
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
                {(prioritizationType === "patient" ||
                  prioritizationType === "cards") && (
                  <div className="form-input">
                    <Checkbox
                      style={{ marginTop: "5px", fontWeight: 400 }}
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
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>{t("tableHeader.alerts")}:</label>
                </div>
                <div className="form-input">
                  <Select
                    id="indicators"
                    mode="multiple"
                    optionFilterProp="children"
                    className={filter.indicators?.length ? "warning" : null}
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
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Convênio:</label>
                </div>
                <div className="form-input">
                  <Input
                    className={filter.insurance ? "warning" : null}
                    value={filter.insurance}
                    onChange={({ target }) => onInsuranceChange(target.value)}
                  ></Input>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Possui diferentes:</label>
                </div>
                <div className="form-input">
                  <Radio.Group
                    options={yesNoOptionsNullable}
                    optionType="button"
                    onChange={({ target: { value } }) =>
                      setScreeningListFilter({ diff: value })
                    }
                    value={filter.diff}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Possui intervenções pendentes:</label>
                </div>
                <div className="form-input">
                  <Radio.Group
                    options={yesNoOptionsNullable}
                    optionType="button"
                    onChange={({ target: { value } }) =>
                      setScreeningListFilter({ pendingInterventions: value })
                    }
                    value={filter.pendingInterventions}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Escore global:</label>
                </div>
                <div className="form-input">
                  <InputNumber
                    style={{ width: "150px" }}
                    className={filter.globalScoreMin ? "warning" : null}
                    value={filter.globalScoreMin}
                    onChange={(value) =>
                      setScreeningListFilter({ globalScoreMin: value })
                    }
                    min={0}
                  ></InputNumber>
                  <span style={{ padding: "0 15px" }}>até</span>
                  <InputNumber
                    style={{ width: "150px" }}
                    className={filter.globalScoreMax ? "warning" : null}
                    value={filter.globalScoreMax}
                    onChange={(value) =>
                      setScreeningListFilter({ globalScoreMax: value })
                    }
                    min={0}
                  ></InputNumber>
                </div>
              </div>
            </div>

            {(prioritizationType === "conciliation" ||
              prioritizationType === "prescription") && (
              <div className="form-row">
                <div className="form-row">
                  <div className="form-label">
                    <label>
                      {prioritizationType === "conciliation"
                        ? t("labels.responsible")
                        : t("labels.prescriber")}
                      :
                    </label>
                  </div>
                  <div className="form-input">
                    <Input
                      className={filter.prescriber ? "warning" : null}
                      value={filter.prescriber}
                      onChange={({ target }) =>
                        setScreeningListFilter({ prescriber: target.value })
                      }
                    ></Input>
                  </div>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>{t("screeningList.labelPendingPrescription")}</label>
                </div>
                <div className="form-input">
                  <Switch
                    onChange={onPendingChange}
                    checked={filter.pending === 1}
                    id="gtm-pending-filter"
                  />
                </div>
              </div>
            </div>
          </Form>
        </Card>
      </Col>

      <Col md={12}>
        <Card
          title="Medicamentos"
          bordered
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>{t("screeningList.labelDrug")}:</label>
              </div>
              <div className="form-input">
                <Select
                  id="drugs-filter"
                  mode="multiple"
                  optionFilterProp="children"
                  className={filter.idDrug?.length ? "warning" : null}
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
              </div>
              <div className="form-input">
                <Checkbox
                  style={{ marginTop: "5px" }}
                  checked={filter.allDrugs}
                  onChange={onAllDrugsChange}
                  id="gtm-allDrugs-filter"
                >
                  <Tooltip
                    title={t("screeningList.labelAllDrugsHint")}
                    underline
                  >
                    {t("screeningList.labelAllDrugs")}
                  </Tooltip>
                </Checkbox>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label> {t("labels.drugAttributes")}:</label>
                </div>
                <div className="form-input">
                  <Select
                    mode="multiple"
                    optionFilterProp="children"
                    className={filter.drugAttributes?.length ? "warning" : null}
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
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>{t("labels.frequencies")}:</label>
                </div>
                <div className="form-input">
                  <Select
                    id="frequencies-filter"
                    mode="multiple"
                    optionFilterProp="children"
                    className={filter.frequencies?.length ? "warning" : null}
                    placeholder={t("screeningList.labelFrequenciesPlaceholder")}
                    value={filter.frequencies}
                    notFoundContent={
                      frequencies.isFetching ? <LoadBox /> : null
                    }
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
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Horários:</label>
                </div>
                <div className="form-input">
                  <Select
                    id="intervals"
                    mode="multiple"
                    optionFilterProp="children"
                    className={filter.intervals?.length ? "warning" : null}
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
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>{t("labels.substance")}:</label>
                </div>
                <div className="form-input">
                  <FieldSubstanceAutocomplete
                    value={filter.substances}
                    onChange={(value) =>
                      setScreeningListFilter({ substances: value })
                    }
                    className={filter.substances?.length ? "warning" : null}
                  ></FieldSubstanceAutocomplete>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>{t("labels.substanceClass")}:</label>
                </div>
                <div className="form-input">
                  <FieldSubstanceClassAutocomplete
                    value={filter.substanceClasses}
                    onChange={(value) =>
                      setScreeningListFilter({ substanceClasses: value })
                    }
                    className={
                      filter.substanceClasses?.length ? "warning" : null
                    }
                  ></FieldSubstanceClassAutocomplete>
                </div>
              </div>
            </div>
          </Form>
        </Card>
      </Col>

      <Col md={12}>
        <Card
          title="Paciente"
          bordered
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            {featureService.hasPatientRevision() &&
              (prioritizationType === "patient" ||
                prioritizationType === "cards") && (
                <div className="form-row">
                  <div className="form-row">
                    <div className="form-label">
                      <label>
                        {t("screeningList.labelPatientReviewType")}:
                      </label>
                    </div>
                    <div className="form-input">
                      <Select
                        id="patientReviewType"
                        optionFilterProp="children"
                        className={
                          filter.patientReviewType !== null &&
                          filter.patientReviewType !== undefined
                            ? "warning"
                            : null
                        }
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
                    </div>
                  </div>
                </div>
              )}

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>{t("tableHeader.patientStatus")}:</label>
                </div>
                <div className="form-input">
                  <Select
                    id="patientStatus"
                    optionFilterProp="children"
                    className={filter.patientStatus ? "warning" : null}
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
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>ID Paciente:</label>
                </div>
                <div className="form-input">
                  <Select
                    id="idPatient"
                    mode="tags"
                    placeholder="Digite o ID do paciente e pressione enter"
                    tokenSeparators={[","]}
                    className={filter.idPatient?.length ? "warning" : null}
                    value={filter.idPatient}
                    onChange={(value) =>
                      setScreeningListFilter({ idPatient: value })
                    }
                    notFoundContent="Digite o ID do paciente e pressione enter. Mais de um ID pode ser informado."
                    allowClear
                  ></Select>
                </div>
              </div>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
