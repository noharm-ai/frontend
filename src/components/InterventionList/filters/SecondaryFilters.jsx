import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { debounce } from "lodash";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select, Input, Radio } from "components/Inputs";
import { searchDrugs } from "features/lists/ListsSlice";
import Tooltip from "components/Tooltip";
import LoadBox from "components/LoadBox";

export default function SecondaryFilters({ segments }) {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const dispatch = useDispatch();
  const drugsList = useSelector((state) => state.lists.searchDrugs.list);
  const drugsListStatus = useSelector(
    (state) => state.lists.searchDrugs.status
  );

  const debounceSearch = debounce((value) => {
    if (value.length < 3) return;
    dispatch(searchDrugs({ idSegment: values.idSegment, q: value }));
  }, 800);

  const yesNoOptionsNullable = [
    { label: "Sim", value: 1 },
    { label: "Não", value: 0 },
    { label: "Todos", value: "" },
  ];

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" htmlFor="date" $size="14px">
          {t("patientCard.segment")}:
        </Heading>
        <Select
          style={{ width: "100%", maxWidth: "500px" }}
          onChange={(idSegment) => setFieldValue({ idSegment })}
          value={values.idSegment}
          allowClear
        >
          {segments.map(({ id, description: text }) => (
            <Select.Option key={id} value={id}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Col>

      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" htmlFor="segments" $size="14px">
          {t("screeningList.labelDrug")}:
        </Heading>
        <Tooltip
          title={
            !values.idSegment
              ? "Selecione o segmento para habilitar o filtro de medicamentos"
              : ""
          }
        >
          <Select
            mode="multiple"
            style={{ width: "100%", maxWidth: "500px" }}
            placeholder="Buscar medicamentos (digite para pesquisar)"
            notFoundContent={drugsListStatus === "loading" ? <LoadBox /> : null}
            loading={drugsListStatus === "loading"}
            onChange={(value) => setFieldValue({ idDrug: value })}
            disabled={!values.idSegment}
            value={values.idDrug}
            allowClear
            showSearch={{
              onSearch: (value) => debounceSearch(value),
              filterOption: false,
              optionFilterProp: ["children"],
              autoClearSearchValue: false,
            }}
          >
            {drugsList.map(({ idDrug, name }) => (
              <Select.Option key={idDrug} value={idDrug}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Tooltip>
      </Col>

      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" htmlFor="date" $size="14px">
          {t("labels.responsible")}:
        </Heading>
        <Input
          style={{ width: "100%", maxWidth: "500px" }}
          onChange={(evt) =>
            setFieldValue({ responsibleName: evt.target.value })
          }
          value={values.responsibleName}
          placeholder="Digite parte do nome que deseja buscar"
          allowClear
        />
      </Col>

      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" htmlFor="date" $size="14px">
          {t("labels.prescriber")}:
        </Heading>
        <Input
          style={{ width: "100%", maxWidth: "500px" }}
          onChange={(evt) =>
            setFieldValue({ prescriberName: evt.target.value })
          }
          value={values.prescriberName}
          placeholder="Digite parte do nome que deseja buscar"
          allowClear
        />
      </Col>

      <Col md={24} xl={16} xxl={14}>
        <Heading as="label" htmlFor="date" $size="14px">
          {t("labels.hasEconomy")}:
        </Heading>
        <Radio.Group
          options={yesNoOptionsNullable}
          optionType="button"
          onChange={({ target: { value } }) =>
            setFieldValue({ hasEconomy: value })
          }
          value={values.hasEconomy}
        />
      </Col>
    </Row>
  );
}
