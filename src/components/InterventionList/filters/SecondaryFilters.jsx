import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import debounce from "lodash.debounce";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select } from "components/Inputs";
import { searchDrugs } from "features/lists/ListsSlice";
import Tooltip from "components/Tooltip";
import LoadBox from "components/LoadBox";

export default function SecondaryFilters() {
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

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xl={16} xxl={8}>
        <Heading as="label" htmlFor="segments" size="14px">
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
            optionFilterProp="children"
            style={{ width: "100%" }}
            placeholder="Buscar medicamentos (digite para pesquisar)"
            notFoundContent={drugsListStatus === "loading" ? <LoadBox /> : null}
            filterOption={false}
            loading={drugsListStatus === "loading"}
            onSearch={debounceSearch}
            onChange={(value) => setFieldValue({ idDrug: value })}
            disabled={!values.idSegment}
            value={values.idDrug}
            allowClear
          >
            {drugsList.map(({ idDrug, name }) => (
              <Select.Option key={idDrug} value={idDrug}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Tooltip>
      </Col>
    </Row>
  );
}
