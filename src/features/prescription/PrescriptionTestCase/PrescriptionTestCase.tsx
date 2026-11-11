import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Affix,
  Alert,
  Anchor,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Grid,
  Input,
  InputNumber,
  Radio,
  Result,
  Row,
  Select,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { uniqBy } from "lodash";

import notification from "components/notification";
import api from "services/api";
import { getSegmentDepartments } from "features/lists/ListsSlice";
import { createPrescriptionTestCase } from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch } from "store/index";
import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

import { PrescriptionTestCaseItem } from "./PrescriptionTestCaseItem/PrescriptionTestCaseItem";
import type {
  IFormValues,
  IItemValues,
  IOption,
  ISegmentDepartment,
  ITestCaseResult,
} from "./types";
import { NavLinks, SideColumn, SideTitle } from "./PrescriptionTestCase.style";

// the backend reads dates as the schema's local time
const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";

const NEW_ITEM: IItemValues = { source: "Medicamentos" };

// the side column sticks this far from the top, and the section links scroll
// their card to the same line
const SCROLL_OFFSET = 24;

const SECTION_IDS = {
  admission: "test-case-admission",
  prescription: "test-case-prescription",
  items: "test-case-items",
};

const itemId = (index: number) => `test-case-item-${index}`;

const SECTIONS = [
  { id: SECTION_IDS.admission, title: "admission" },
  { id: SECTION_IDS.prescription, title: "prescription" },
  { id: SECTION_IDS.items, title: "items" },
];

const initialValues = (): IFormValues => ({
  admissionMode: "new",
  date: dayjs(),
  items: [{ ...NEW_ITEM }],
});

const toPayload = (values: IFormValues) => ({
  admissionNumber:
    values.admissionMode === "existing" ? values.admissionNumber : null,
  patient:
    values.admissionMode === "new"
      ? {
          birthdate: values.birthdate
            ? values.birthdate.format("YYYY-MM-DD")
            : null,
          gender: values.gender ?? null,
          weight: values.weight ?? null,
          height: values.height ?? null,
        }
      : null,
  // a string: department ids may not fit a javascript number
  idDepartment: values.idDepartment,
  date: values.date ? values.date.format(DATE_TIME_FORMAT) : null,
  expire: values.expire ? values.expire.format(DATE_TIME_FORMAT) : null,
  bed: values.bed || null,
  prescriber: values.prescriber || null,
  items: values.items.map((item) => ({
    // a string: drug ids may not fit a javascript number
    idDrug: item.drug?.value,
    source: item.source,
    dose: item.dose ?? null,
    measureUnit: item.measureUnit ?? null,
    frequency: item.frequency ?? null,
    interval: item.interval || null,
    route: item.route || null,
    notes: item.notes || null,
  })),
});

interface IPrescriptionTestCaseProps {
  /** the page title, the header being this form's (it holds its button) */
  title: ReactNode;
}

/**
 * Creates a prescription in the maintainers' test schema, as if the hospital
 * had sent it, and processes it (prescalc), to build test cases: for a new
 * admission (with the patient's data the alerts read) or an existing one.
 */
export function PrescriptionTestCase({ title }: IPrescriptionTestCaseProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const screens = Grid.useBreakpoint();
  const [form] = Form.useForm<IFormValues>();
  const [saving, setSaving] = useState(false);
  // changed since the form was opened (or last reset) and not created yet
  const [dirty, setDirty] = useState(false);
  const [result, setResult] = useState<ITestCaseResult | null>(null);
  const [routes, setRoutes] = useState<IOption[]>([]);

  const departmentList: ISegmentDepartment[] = useSelector(
    (state: any) => state.lists.getSegmentDepartments.list,
  );
  const departmentStatus = useSelector(
    (state: any) => state.lists.getSegmentDepartments.status,
  );

  const admissionMode = Form.useWatch("admissionMode", form);
  const idDepartment = Form.useWatch("idDepartment", form);
  const items = Form.useWatch("items", form);

  useEffect(() => {
    if (departmentStatus === "idle") {
      dispatch(getSegmentDepartments(undefined));
    }
  }, [dispatch, departmentStatus]);

  useEffect(() => {
    let stale = false;
    api.lists.getRoutes().then((response: any) => {
      if (stale) {
        return;
      }

      setRoutes(
        (response.data?.data ?? []).map((r: any) => ({
          value: String(r.id),
          label: r.name && r.name !== r.id ? `${r.name} (${r.id})` : r.id,
        })),
      );
    });

    return () => {
      stale = true;
    };
  }, []);

  const departments = useMemo(
    () =>
      uniqBy(departmentList ?? [], "idDepartment").map((d) => ({
        value: String(d.idDepartment),
        label: d.label,
      })),
    [departmentList],
  );

  const idSegment = useMemo(() => {
    const department = (departmentList ?? []).find(
      (d) => String(d.idDepartment) === idDepartment,
    );
    return department ? department.idSegment : null;
  }, [departmentList, idDepartment]);

  const submit = (values: IFormValues) => {
    setSaving(true);
    dispatch(createPrescriptionTestCase(toPayload(values))).then(
      (response: any) => {
        setSaving(false);

        if (response.error) {
          notification.error({
            message: t("error.title"),
            description: getErrorMessage(response, t),
          });
          return;
        }

        setDirty(false);
        setResult(response.payload.data);
      },
    );
  };

  const newTestCase = () => {
    form.resetFields();
    setResult(null);
  };

  // another prescription for the same patient: a new day, a new drug
  const sameAdmission = () => {
    const admissionNumber = result?.admissionNumber;
    const department = form.getFieldValue("idDepartment");
    form.resetFields();
    form.setFieldsValue({
      admissionMode: "existing",
      admissionNumber,
      idDepartment: department,
    });
    setResult(null);
  };

  const header = (actions?: ReactNode) => (
    <PageHeader>
      <div>
        {title}
        <div className="page-header-legend">
          {t("prescriptionTestCase.intro")}
        </div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </PageHeader>
  );

  if (result) {
    return (
      <>
        {header()}
        <PageCard>
          <Result
            status="success"
            title={t("prescriptionTestCase.created")}
            subTitle={t("prescriptionTestCase.createdDescription", {
              idPrescription: result.idPrescription,
              admissionNumber: result.admissionNumber,
            })}
            extra={
              <Flex vertical gap={16} align="center">
                {!result.idPrescriptionDay && (
                  <Alert
                    type="warning"
                    showIcon
                    title={t("prescriptionTestCase.notProcessed")}
                  />
                )}
                <Flex gap={8} wrap justify="center">
                  {result.idPrescriptionDay && (
                    <Button
                      type="primary"
                      href={`/prescricao/${result.idPrescriptionDay}`}
                      target="_blank"
                    >
                      {t("prescriptionTestCase.openPrescriptionDay")}
                    </Button>
                  )}
                  <Button onClick={sameAdmission}>
                    {t("prescriptionTestCase.sameAdmission")}
                  </Button>
                  <Button onClick={newTestCase}>
                    {t("prescriptionTestCase.newTestCase")}
                  </Button>
                </Flex>
              </Flex>
            }
          />
        </PageCard>
      </>
    );
  }

  const required = [{ required: true, message: t("validation.requiredField") }];

  const drugName = (index: number) => items?.[index]?.drug?.label;

  const itemTitle = (index: number) => {
    const item = t("prescriptionTestCase.item", { number: index + 1 });
    const drug = drugName(index);
    return drug ? `${item} · ${drug}` : item;
  };

  // the items under their section, by drug once one is picked
  const anchorItems = SECTIONS.map((section) => ({
    key: section.id,
    href: `#${section.id}`,
    title:
      section.id === SECTION_IDS.items
        ? `${t("prescriptionTestCase.items")} (${items?.length ?? 0})`
        : t(`prescriptionTestCase.${section.title}`),
    children:
      section.id === SECTION_IDS.items
        ? (items ?? []).map((_, index) => ({
            key: itemId(index),
            href: `#${itemId(index)}`,
            title:
              drugName(index) ??
              t("prescriptionTestCase.item", { number: index + 1 }),
          }))
        : undefined,
  }));

  const sideColumn = (
    <SideColumn data-kb="prescriptionTestCase.nav">
      {dirty && (
        <Alert
          type="warning"
          showIcon
          title={t("prescriptionTestCase.pendingChanges")}
          description={t("prescriptionTestCase.pendingChangesDescription")}
        />
      )}
      {screens.lg && (
        <Card>
          <SideTitle>{t("prescriptionTestCase.sections")}</SideTitle>
          <NavLinks>
            <Anchor
              affix={false}
              replace
              targetOffset={SCROLL_OFFSET}
              items={anchorItems}
            />
          </NavLinks>
        </Card>
      )}
    </SideColumn>
  );

  return (
    <>
      {header(
        <Button type="primary" onClick={() => form.submit()} loading={saving}>
          {t("prescriptionTestCase.create")}
        </Button>,
      )}
      <Row gutter={24}>
        {/* first on phones, where it sits above the form; the right column on
            larger screens */}
        <Col xs={24} lg={{ span: 6, order: 2 }}>
          {screens.lg ? (
            <Affix offsetTop={SCROLL_OFFSET}>{sideColumn}</Affix>
          ) : (
            sideColumn
          )}
        </Col>
        <Col
          xs={24}
          lg={{ span: 18, order: 1 }}
          data-kb="prescriptionTestCase.form"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues()}
            onFinish={submit}
            onValuesChange={() => setDirty(true)}
            disabled={saving}
            requiredMark={false}
            scrollToFirstError={{ behavior: "smooth", block: "center" }}
          >
            <Flex vertical gap={16}>
              <Card
                id={SECTION_IDS.admission}
                title={t("prescriptionTestCase.admission")}
                data-kb="prescriptionTestCase.admission"
              >
                <Form.Item name="admissionMode">
                  <Radio.Group
                    options={[
                      {
                        value: "new",
                        label: t("prescriptionTestCase.newAdmission"),
                      },
                      {
                        value: "existing",
                        label: t("prescriptionTestCase.existingAdmission"),
                      },
                    ]}
                  />
                </Form.Item>

                {admissionMode === "existing" ? (
                  <Row gutter={8}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="admissionNumber"
                        label={t("prescriptionTestCase.admissionNumber")}
                        rules={required}
                      >
                        <InputNumber
                          min={0}
                          precision={0}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Row gutter={8}>
                    <Col xs={12} md={6}>
                      <Form.Item
                        name="birthdate"
                        label={t("prescriptionTestCase.birthdate")}
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        name="gender"
                        label={t("prescriptionTestCase.gender")}
                      >
                        <Select
                          allowClear
                          options={[
                            {
                              value: "F",
                              label: t("prescriptionTestCase.genderF"),
                            },
                            {
                              value: "M",
                              label: t("prescriptionTestCase.genderM"),
                            },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        name="weight"
                        label={t("prescriptionTestCase.weight")}
                      >
                        <InputNumber min={0.1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Item
                        name="height"
                        label={t("prescriptionTestCase.height")}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Card>

              <Card
                id={SECTION_IDS.prescription}
                title={t("prescriptionTestCase.prescription")}
                data-kb="prescriptionTestCase.prescription"
              >
                <Row gutter={8}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="idDepartment"
                      label={t("prescriptionTestCase.department")}
                      rules={required}
                    >
                      <Select
                        showSearch={{ optionFilterProp: "label" }}
                        options={departments}
                        loading={departmentStatus === "loading"}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Item name="bed" label={t("prescriptionTestCase.bed")}>
                      <Input maxLength={16} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Item
                      name="prescriber"
                      label={t("prescriptionTestCase.prescriber")}
                    >
                      <Input maxLength={255} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Item
                      name="date"
                      label={t("prescriptionTestCase.date")}
                      rules={required}
                    >
                      <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Item
                      name="expire"
                      label={t("prescriptionTestCase.expire")}
                      tooltip={t("prescriptionTestCase.expireHelp")}
                    >
                      <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <Flex
                    vertical
                    gap={16}
                    id={SECTION_IDS.items}
                    data-kb="prescriptionTestCase.items"
                  >
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        id={itemId(index)}
                        title={itemTitle(index)}
                        extra={
                          fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              aria-label={t("prescriptionTestCase.removeItem")}
                              onClick={() => remove(field.name)}
                            />
                          )
                        }
                      >
                        <PrescriptionTestCaseItem
                          name={field.name}
                          idSegment={idSegment}
                          routes={routes}
                        />
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      block
                      icon={<PlusOutlined />}
                      onClick={() => add({ ...NEW_ITEM })}
                      disabled={saving || fields.length >= 100}
                    >
                      {t("prescriptionTestCase.addItem")}
                    </Button>
                  </Flex>
                )}
              </Form.List>
            </Flex>
          </Form>
        </Col>
      </Row>
    </>
  );
}
