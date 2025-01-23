import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select, Radio } from "components/Inputs";
import { fetchSubstanceClasses } from "features/lists/ListsSlice";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import { SubstanceTagEnum } from "models/SubstanceTagEnum";

export default function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext);
  const dispatch = useDispatch();
  const substanceClasses = useSelector(
    (state) => state.lists.substanceClasses.list
  );
  const substanceClassesStatus = useSelector(
    (state) => state.lists.substanceClasses.status
  );

  useEffect(() => {
    if (substanceClasses.length === 0) {
      dispatch(fetchSubstanceClasses());
    }
  }, []); //eslint-disable-line

  return (
    <Col xs={24} md={14}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" size="14px">
            Classe:
          </Heading>

          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.idClassList}
            onChange={(value, option) => setFieldValue({ idClassList: value })}
            loading={substanceClassesStatus === "loading"}
            mode="multiple"
            maxTagCount="responsive"
            allowClear
          >
            {substanceClasses.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" htmlFor="date" size="14px">
            Manejo:
          </Heading>

          <Select
            id="idclass"
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.handlingTypeList}
            onChange={(value, option) =>
              setFieldValue({ handlingTypeList: value })
            }
            mode="multiple"
            maxTagCount="responsive"
            allowClear
          >
            {DrugAlertTypeEnum.getAlertTypes(t).map((a) => (
              <Select.Option key={a.id} value={a.id}>
                {a.label}
              </Select.Option>
            ))}
          </Select>
          <Radio.Group
            options={[
              { label: "Preenchido", value: "filled" },
              { label: "Vazio", value: "empty" },
            ]}
            onChange={({ target: { value } }) =>
              setFieldValue({ handlingOption: value })
            }
            value={values.handlingOption}
          />
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" size="14px">
            Possui texto curadoria:
          </Heading>
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.hasAdminText}
            onChange={(value) => setFieldValue({ hasAdminText: value })}
            allowClear
          >
            <Select.Option value={1}>Sim</Select.Option>
            <Select.Option value={0}>Não</Select.Option>
          </Select>
        </Col>

        <Col xs={24} md={12}>
          <Heading as="label" size="14px">
            Tags:
          </Heading>
          <Select
            optionFilterProp="children"
            showSearch
            value={values.tags}
            onChange={(value) => setFieldValue({ tags: value })}
            allowClear
            mode="multiple"
            style={{ width: "100%" }}
          >
            {SubstanceTagEnum.getSubstanceTags(t).map((subtag) => (
              <Select.Option value={subtag.id}>{subtag.label}</Select.Option>
            ))}
          </Select>
        </Col>

        <Col xs={12} md={6}>
          <Heading as="label" size="14px">
            Dose máxima adulto:
          </Heading>
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.hasMaxDoseAdult}
            onChange={(value) => setFieldValue({ hasMaxDoseAdult: value })}
            allowClear
          >
            <Select.Option value={1}>Sim</Select.Option>
            <Select.Option value={0}>Não</Select.Option>
          </Select>
        </Col>

        <Col xs={12} md={6}>
          <Heading as="label" size="14px">
            Dose máxima adulto/Peso:
          </Heading>
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.hasMaxDoseAdultWeight}
            onChange={(value) =>
              setFieldValue({ hasMaxDoseAdultWeight: value })
            }
            allowClear
          >
            <Select.Option value={1}>Sim</Select.Option>
            <Select.Option value={0}>Não</Select.Option>
          </Select>
        </Col>

        <Col xs={12} md={6}>
          <Heading as="label" size="14px">
            Dose máxima pediátrico:
          </Heading>
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.hasMaxDosePediatric}
            onChange={(value) => setFieldValue({ hasMaxDosePediatric: value })}
            allowClear
          >
            <Select.Option value={1}>Sim</Select.Option>
            <Select.Option value={0}>Não</Select.Option>
          </Select>
        </Col>

        <Col xs={12} md={6}>
          <Heading as="label" size="14px">
            Dose máxima pediátrico/Peso:
          </Heading>
          <Select
            optionFilterProp="children"
            showSearch
            style={{ width: "100%" }}
            value={values.hasMaxDosePediatricWeight}
            onChange={(value) =>
              setFieldValue({ hasMaxDosePediatricWeight: value })
            }
            allowClear
          >
            <Select.Option value={1}>Sim</Select.Option>
            <Select.Option value={0}>Não</Select.Option>
          </Select>
        </Col>
      </Row>
    </Col>
  );
}
