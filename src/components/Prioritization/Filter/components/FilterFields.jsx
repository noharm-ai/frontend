import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col, Card, Spin } from "antd";
import { isEmpty } from "lodash";
import { debounce } from "lodash";

import {
  Select,
  SelectCustom,
  Checkbox,
  Input,
  InputNumber,
  Radio,
} from "components/Inputs";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import LoadBox from "components/LoadBox";
import FieldSubstanceAutocomplete from "features/fields/FieldSubstanceAutocomplete/FieldSubstanceAutocomplete";
import FieldSubstanceClassAutocomplete from "features/fields/FieldSubstanceClassAutocomplete/FieldSubstanceClassAutocomplete";
import { FieldProtocol } from "features/fields/FieldProtocol/FieldProtocol";
import { FieldTag } from "features/fields/FieldTag/FieldTag";
import { getSegmentDepartments } from "features/lists/ListsSlice";
import { getUniqBy } from "utils/report";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import { TagTypeEnum } from "models/TagTypeEnum";
import { ProtocolTypeEnum } from "models/ProtocolTypeEnum";
import FieldNameAutocomplete from "features/fields/FieldNameAutocomplete/FieldNameAutocomplete";
import { FieldIcd } from "src/features/fields/FieldIcd/FieldIcd";

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
  open,
}) {
  //eslint-disable-next-line
  const dispatch = useDispatch();
  //eslint disabled because of incorrect error msg
  //eslint-disable-next-line
  const { t } = useTranslation();
  //eslint-disable-next-line
  const departments = useSelector(
    (state) => state.lists.getSegmentDepartments.list
  );
  //eslint-disable-next-line
  const departmentsStatus = useSelector(
    (state) => state.lists.getSegmentDepartments.status
  );

  //eslint-disable-next-line
  useEffect(() => {
    if (open && isEmpty(departments)) {
      dispatch(getSegmentDepartments());
    }
  }, [dispatch, open, departments]);

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
    searchDrugs(null, { q: value, group: 0 });
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

  const alertLevelsOptions = [
    { label: "Baixo", value: "low" },
    { label: "Médio", value: "medium" },
    { label: "Alto", value: "high" },
    { label: "Todos", value: null },
  ];

  const icdGroups = [
    {
      value: "ONCO",
      label: "Oncológico",
    },
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
                <Spin spinning={departmentsStatus === "loading"}>
                  <SelectCustom
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
                    maxTagCount="responsive"
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
                  </SelectCustom>
                </Spin>
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
                    {DrugAlertTypeEnum.getAlertTypes(t).map((a) => (
                      <Select.Option key={a.id} value={a.id}>
                        {a.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>
                    <Tooltip title="Maior nível de alerta presente" underline>
                      Nível do alerta:
                    </Tooltip>
                  </label>
                </div>
                <div className="form-input">
                  <Radio.Group
                    options={alertLevelsOptions}
                    optionType="button"
                    onChange={({ target: { value } }) =>
                      setScreeningListFilter({ alertLevel: value })
                    }
                    value={filter.alertLevel}
                  />
                </div>
              </div>
            </div>

            {featureService.hasProtocolAlerts() && (
              <div className="form-row">
                <div className="form-row">
                  <div className="form-label">
                    <label>{t("labels.protocolAlerts")}:</label>
                  </div>
                  <div className="form-input">
                    <FieldProtocol
                      protocolType={[
                        ProtocolTypeEnum.PRESCRIPTION_AGG,
                        ProtocolTypeEnum.PRESCRIPTION_INDIVIDUAL,
                        ProtocolTypeEnum.PRESCRIPTION_ALL,
                      ]}
                      value={filter.protocols}
                      onChange={(value) =>
                        setScreeningListFilter({ protocols: value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

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
                  <label>Possui evolução:</label>
                </div>
                <div className="form-input">
                  <Radio.Group
                    options={yesNoOptionsNullable}
                    optionType="button"
                    onChange={({ target: { value } }) =>
                      setScreeningListFilter({ hasClinicalNotes: value })
                    }
                    value={filter.hasClinicalNotes}
                  />
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

            {featureService.hasPEC() && (
              <>
                <div className="form-row">
                  <div className="form-row">
                    <div className="form-label">
                      <label>Nome Paciente:</label>
                    </div>
                    <div className="form-input">
                      <FieldNameAutocomplete
                        onChange={(val) =>
                          setScreeningListFilter({ idPatientByNameList: val })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-label">
                    <label>CID:</label>
                  </div>
                  <div className="form-input">
                    <FieldIcd
                      value={filter.idIcdList}
                      onChange={(val) =>
                        setScreeningListFilter({ idIcdList: val })
                      }
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-label">
                    <label>Grupos de CID:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      style={{ width: "100%" }}
                      value={filter.idIcdGroupList}
                      onChange={(val) =>
                        setScreeningListFilter({ idIcdGroupList: val })
                      }
                      showSearch
                      optionFilterProp="children"
                      allowClear
                      maxTagCount="responsive"
                      mode="multiple"
                      options={icdGroups}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Marcadores:</label>
                </div>
                <div className="form-input">
                  <FieldTag
                    tagType={TagTypeEnum.PATIENT}
                    value={filter.tags}
                    onChange={(value) =>
                      setScreeningListFilter({ tags: value })
                    }
                  ></FieldTag>
                </div>
              </div>
            </div>

            {featureService.hasConciliation() &&
              (prioritizationType === "patient" ||
                prioritizationType === "cards") && (
                <div className="form-row">
                  <div className="form-row">
                    <div className="form-label">
                      <label>Possui conciliação:</label>
                    </div>
                    <div className="form-input">
                      <Radio.Group
                        options={yesNoOptionsNullable}
                        optionType="button"
                        onChange={({ target: { value } }) =>
                          setScreeningListFilter({ hasConciliation: value })
                        }
                        value={filter.hasConciliation}
                      />
                    </div>
                  </div>
                </div>
              )}

            <div className="form-row">
              <div className="form-row">
                <div className="form-label">
                  <label>Idade:</label>
                </div>
                <div className="form-input">
                  <InputNumber
                    style={{ width: "150px" }}
                    className={filter.ageMin ? "warning" : null}
                    value={filter.ageMin}
                    onChange={(value) =>
                      setScreeningListFilter({ ageMin: value })
                    }
                    min={0}
                  ></InputNumber>
                  <span style={{ padding: "0 15px" }}>até</span>
                  <InputNumber
                    style={{ width: "150px" }}
                    className={filter.ageMax ? "warning" : null}
                    value={filter.ageMax}
                    onChange={(value) =>
                      setScreeningListFilter({ ageMax: value })
                    }
                    min={0}
                  ></InputNumber>
                </div>
              </div>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
