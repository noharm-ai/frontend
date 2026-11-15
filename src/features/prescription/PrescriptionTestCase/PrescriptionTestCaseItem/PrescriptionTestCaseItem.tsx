import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AutoComplete,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
} from "antd";
import { debounce, uniqBy } from "lodash";

import api from "services/api";

import { ITEM_SOURCES } from "../types";
import type { IOption } from "../types";

interface IPrescriptionTestCaseItemProps {
  name: number;
  idSegment: number | null;
  routes: IOption[];
}

interface IResource {
  id: string;
  description: string;
}

interface IResources {
  idDrug: string;
  units: IOption[];
  frequencies: IOption[];
}

/**
 * One item of a test case prescription: any drug of the schema (searched by
 * name), with the units and frequencies of the schema, the ones the drug was
 * prescribed with first.
 */
export function PrescriptionTestCaseItem({
  name,
  idSegment,
  routes,
}: IPrescriptionTestCaseItemProps) {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const drug: IOption | undefined = Form.useWatch(
    ["items", name, "drug"],
    form,
  );
  const idDrug = drug?.value;

  const [drugOptions, setDrugOptions] = useState<IOption[]>([]);
  const [searching, setSearching] = useState(false);
  // the units and frequencies of the drug they were loaded for
  const [resources, setResources] = useState<IResources | null>(null);

  const search = useMemo(
    () =>
      debounce((term: string) => {
        if (term.length < 3) {
          return;
        }

        setSearching(true);
        // every drug of the schema, not only the ones with scores
        api
          .getDrugs(undefined, { q: term, group: 0 })
          .then((response: any) => {
            setDrugOptions(
              (response.data?.data ?? []).map((d: any) => ({
                value: String(d.idDrug),
                label: d.name,
              })),
            );
          })
          .finally(() => setSearching(false));
      }, 500),
    [],
  );

  useEffect(() => () => search.cancel(), [search]);

  useEffect(() => {
    if (!idDrug) {
      return;
    }

    let stale = false;
    api
      .getDrugResources(undefined, idDrug, idSegment ?? 1)
      .then((response: any) => {
        if (stale) {
          return;
        }

        const data = response.data?.data ?? {};
        const toOptions = (list: IResource[] = []) =>
          uniqBy(list, "id").map((r) => ({
            value: String(r.id),
            label: r.description,
          }));

        setResources({
          idDrug,
          units: toOptions(data.units),
          frequencies: toOptions(data.frequencies),
        });
      });

    return () => {
      stale = true;
    };
  }, [idDrug, idSegment]);

  const loaded = idDrug && resources?.idDrug === idDrug ? resources : null;
  const units = loaded?.units ?? [];
  const frequencies = loaded?.frequencies ?? [];
  const loadingResources = !!idDrug && !loaded;

  const onDrugChange = () => {
    // the units and frequencies are the new drug's
    form.setFieldValue(["items", name, "measureUnit"], undefined);
    form.setFieldValue(["items", name, "frequency"], undefined);
  };

  return (
    <Row gutter={8} align="top" data-testid="test-case-item">
      <Col xs={24} md={4}>
        <Form.Item
          name={[name, "source"]}
          label={t("prescriptionTestCase.source")}
        >
          <Select
            options={ITEM_SOURCES.map((source) => ({
              value: source,
              label: source,
            }))}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={20}>
        <Form.Item
          name={[name, "drug"]}
          label={t("prescriptionTestCase.drug")}
          rules={[{ required: true, message: t("validation.requiredField") }]}
        >
          <Select
            showSearch={{ filterOption: false, onSearch: search }}
            labelInValue
            placeholder={t("prescriptionTestCase.drugSearch")}
            options={drugOptions}
            notFoundContent={searching ? <Spin size="small" /> : null}
            onChange={onDrugChange}
          />
        </Form.Item>
      </Col>

      <Col xs={12} md={4}>
        <Form.Item name={[name, "dose"]} label={t("prescriptionTestCase.dose")}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={12} md={5}>
        <Form.Item
          name={[name, "measureUnit"]}
          label={t("prescriptionTestCase.measureUnit")}
        >
          <Select
            allowClear
            showSearch={{ optionFilterProp: "label" }}
            options={units}
            loading={loadingResources}
            disabled={!idDrug}
          />
        </Form.Item>
      </Col>
      <Col xs={12} md={5}>
        <Form.Item
          name={[name, "frequency"]}
          label={t("prescriptionTestCase.frequency")}
        >
          <Select
            allowClear
            showSearch={{ optionFilterProp: "label" }}
            options={frequencies}
            loading={loadingResources}
            disabled={!idDrug}
          />
        </Form.Item>
      </Col>
      <Col xs={12} md={5}>
        <Form.Item
          name={[name, "interval"]}
          label={t("prescriptionTestCase.interval")}
          tooltip={t("prescriptionTestCase.intervalHelp")}
        >
          <Input maxLength={50} />
        </Form.Item>
      </Col>
      <Col xs={24} md={5}>
        <Form.Item
          name={[name, "route"]}
          label={t("prescriptionTestCase.route")}
        >
          <AutoComplete
            options={routes}
            maxLength={50}
            showSearch={{
              filterOption: (input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
          />
        </Form.Item>
      </Col>
      <Col xs={24}>
        <Form.Item
          name={[name, "notes"]}
          label={t("prescriptionTestCase.notes")}
        >
          <Input maxLength={2000} />
        </Form.Item>
      </Col>
    </Row>
  );
}
