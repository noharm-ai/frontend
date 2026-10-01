import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { Button, Tabs, Space } from "antd";
import { Checkbox, Select } from "components/Inputs";
import { PlusOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import { ExpandableTable } from "components/Table";
import notification from "components/notification";
import Empty from "components/Empty";
import {
  fetchExams,
  setExamsModalAdmissionNumber,
  setExamsModalHighlight,
} from "./ExamModalSlice";
import { setExamFormModal } from "../ExamForm/ExamFormSlice";
import { setExam as setAdminExam } from "features/admin/Exam/ExamForm/ExamFormSlice";
import { ExamForm as AdminExamForm } from "features/admin/Exam/ExamForm/ExamForm";
import { toDataSource } from "utils";
import { getErrorMessage } from "utils/errorHandler";
import { getResponsiveTableWidth } from "src/utils/responsive";
import { ExamForm } from "../ExamForm/ExamForm";
import { FeatureService } from "src/services/FeatureService";
import Feature from "src/models/Feature";

import examColumns, {
  examRowClassName,
  expandedExamRowRender,
  textualColumns,
} from "./table/columns";

export default function ExamsModal({ idSegment }) {
  const dispatch = useDispatch();
  const admissionNumber = useSelector(
    (state) => state.examsModal.admissionNumber,
  );
  const list = useSelector((state) => state.examsModal.list);
  const status = useSelector((state) => state.examsModal.status);
  const highlightExamId = useSelector(
    (state) => state.examsModal.highlightExamId,
  );

  const [sortOrder, setSortOrder] = useState({
    order: "ascend",
    columnKey: "name",
    column: { dataIndex: "name" },
  });
  const [activeTab, setActiveTab] = useState("exams");
  const [showOnlyConfigured, setShowOnlyConfigured] = useState(true);
  const [selectedNames, setSelectedNames] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const { t } = useTranslation();

  // exam type row holding the deep-linked fkexame in its history; only numeric
  // exams carry an id
  const highlightedExam = useMemo(() => {
    if (!highlightExamId) return null;

    return (
      list.find(
        (e) =>
          !e.text &&
          e.history?.some((h) => String(h.idExam) === String(highlightExamId)),
      ) ?? null
    );
  }, [list, highlightExamId]);

  // state adjusted while rendering (not in an effect) when its inputs change:
  // https://react.dev/learn/you-might-not-need-an-effect
  const [prevAdmissionNumber, setPrevAdmissionNumber] =
    useState(admissionNumber);
  const [appliedHighlightId, setAppliedHighlightId] = useState(null);

  if (admissionNumber !== prevAdmissionNumber) {
    setPrevAdmissionNumber(admissionNumber);
    if (!admissionNumber) {
      setExpandedRowKeys([]);
      setAppliedHighlightId(null);
    }
  }

  const highlightLoaded = !!highlightExamId && status === "succeeded";

  if (
    highlightLoaded &&
    highlightedExam &&
    appliedHighlightId !== highlightExamId
  ) {
    // make the row reachable: right tab, no filter hiding it, expanded
    setAppliedHighlightId(highlightExamId);
    setActiveTab("exams");
    setSelectedNames([]);
    if (!highlightedExam.configured) {
      setShowOnlyConfigured(false);
    }
    setExpandedRowKeys((keys) =>
      keys.includes(highlightedExam.key) ? keys : [...keys, highlightedExam.key],
    );
  }

  useEffect(() => {
    if (!highlightLoaded || highlightedExam) return;

    notification.info({
      message:
        "Exame não localizado entre os exames carregados deste atendimento.",
    });
    dispatch(setExamsModalHighlight(null));
  }, [highlightLoaded, highlightedExam, dispatch]);

  useEffect(() => {
    if (!appliedHighlightId || !highlightedExam) return;

    const rowKey = CSS.escape(String(highlightedExam.key));
    const timer = window.setTimeout(() => {
      document
        .querySelector(`.ant-modal tr[data-row-key="${rowKey}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [appliedHighlightId, highlightedExam]);

  const numericRowClassName = (record) =>
    [
      examRowClassName(record),
      highlightedExam && record.key === highlightedExam.key ? "highlight" : "",
    ]
      .filter(Boolean)
      .join(" ");

  useEffect(() => {
    if (admissionNumber) {
      if (isEmpty(list) && admissionNumber) {
        dispatch(fetchExams({ admissionNumber, idSegment })).then(
          (response) => {
            if (response.error) {
              notification.error({
                message: getErrorMessage(response, t),
              });
            }
          },
        );
      }
    }
  }, [admissionNumber]); // eslint-disable-line

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  const onConfigure = (record) => {
    if (record.configured) {
      dispatch(setAdminExam({ idSegment, type: record.key }));
    } else {
      dispatch(
        setAdminExam({ idSegment, type: record.key, new: true, active: true }),
      );
    }
  };

  const numericExams = list.filter((e) => !e.text);
  const textualExams = list.filter((e) => e.text);
  const configuredFilteredExams = showOnlyConfigured
    ? numericExams.filter((e) => e.configured)
    : numericExams;
  const nameOptions = useMemo(
    () =>
      [...new Set(configuredFilteredExams.map((e) => e.name))].map((name) => ({
        label: name,
        value: name,
      })),
    [configuredFilteredExams],
  );
  const filteredNumericExams = configuredFilteredExams.filter(
    (e) => selectedNames.length === 0 || selectedNames.includes(e.name),
  );

  const tabs = [
    {
      label: "Exames numéricos",
      key: "exams",
      children: (
        <>
          <Space style={{ marginBottom: 8 }} wrap>
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Filtrar por exame..."
              style={{ minWidth: 250 }}
              options={nameOptions}
              value={selectedNames}
              onChange={setSelectedNames}
              popupMatchSelectWidth={false}
            />
            <Checkbox
              checked={showOnlyConfigured}
              onChange={(e) => setShowOnlyConfigured(e.target.checked)}
            >
              Exibir somente exames configurados
            </Checkbox>
          </Space>
          <ExpandableTable
            columns={examColumns(t, sortOrder)}
            showSorterTooltip={false}
            pagination={false}
            loading={status === "loading"}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Nenhum exame encontrado."
                />
              ),
            }}
            dataSource={
              status !== "loading"
                ? toDataSource(filteredNumericExams, "key", { onConfigure })
                : []
            }
            rowClassName={numericRowClassName}
            expandable={{
              expandedRowRender: (record) =>
                expandedExamRowRender(record, highlightExamId),
              expandedRowKeys,
              onExpandedRowsChange: setExpandedRowKeys,
            }}
            onChange={handleTableChange}
            scroll={getResponsiveTableWidth("max-content")}
          />
        </>
      ),
    },
    {
      label: "Exames textuais",
      key: "exams_text",
      children: (
        <ExpandableTable
          columns={textualColumns(t, sortOrder)}
          showSorterTooltip={false}
          pagination={false}
          loading={status === "loading"}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhum exame encontrado."
              />
            ),
          }}
          dataSource={
            status !== "loading"
              ? toDataSource(textualExams, "key", { onConfigure })
              : []
          }
          rowClassName={examRowClassName}
          expandedRowRender={(record) => expandedExamRowRender(record)}
          onChange={handleTableChange}
          scroll={getResponsiveTableWidth("max-content")}
        />
      ),
    },
  ];

  return (
    <DefaultModal
      destroyOnHidden
      open={admissionNumber}
      onCancel={() => dispatch(setExamsModalAdmissionNumber(null))}
      width="90%"
      footer={
        FeatureService.has(Feature.ADD_EXAMS) ? (
          <Space>
            <Button
              type="default"
              onClick={() => dispatch(setExamsModalAdmissionNumber(null))}
            >
              Fechar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                dispatch(setExamFormModal({ admissionNumber, idSegment }))
              }
            >
              Adicionar resultado de exame
            </Button>
          </Space>
        ) : null
      }
      style={{ top: "10px", height: "100vh" }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />

      <ExamForm />
      <AdminExamForm
        onAfterSave={() => dispatch(fetchExams({ admissionNumber, idSegment }))}
      />
    </DefaultModal>
  );
}
