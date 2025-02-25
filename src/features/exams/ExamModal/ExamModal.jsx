import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { Tabs } from "antd";

import DefaultModal from "components/Modal";
import { ExpandableTable } from "components/Table";
import notification from "components/notification";
import Empty from "components/Empty";
import { fetchExams, setExamsModalAdmissionNumber } from "./ExamModalSlice";
import { toDataSource } from "utils";
import { getErrorMessage } from "utils/errorHandler";
import { getResponsiveTableWidth } from "src/utils/responsive";

import examColumns, {
  examRowClassName,
  expandedExamRowRender,
  textualColumns,
} from "./table/columns";

export default function ExamsModal({ idSegment }) {
  const dispatch = useDispatch();
  const admissionNumber = useSelector(
    (state) => state.examsModal.admissionNumber
  );
  const list = useSelector((state) => state.examsModal.list);
  const status = useSelector((state) => state.examsModal.status);

  const [sortOrder, setSortOrder] = useState({
    order: null,
    columnKey: null,
  });
  const { t } = useTranslation();

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
          }
        );
      }
    }
  }, [admissionNumber]); // eslint-disable-line

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  const numericExams = list.filter((e) => !e.text);
  const textualExams = list.filter((e) => e.text);

  const tabs = [
    {
      label: "Exames numéricos",
      key: "exams",
      children: (
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
            status !== "loading" ? toDataSource(numericExams, "key", {}) : []
          }
          rowClassName={examRowClassName}
          expandedRowRender={expandedExamRowRender}
          onChange={handleTableChange}
          scroll={getResponsiveTableWidth("max-content")}
        />
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
            status !== "loading" ? toDataSource(textualExams, "key", {}) : []
          }
          rowClassName={examRowClassName}
          expandedRowRender={expandedExamRowRender}
          onChange={handleTableChange}
          scroll={getResponsiveTableWidth("max-content")}
        />
      ),
    },
  ];

  return (
    <DefaultModal
      destroyOnClose
      open={admissionNumber}
      onCancel={() => dispatch(setExamsModalAdmissionNumber(null))}
      width="90%"
      footer={null}
      style={{ top: "10px", height: "100vh" }}
    >
      <Tabs defaultActiveKey="exams" items={tabs} />
    </DefaultModal>
  );
}
