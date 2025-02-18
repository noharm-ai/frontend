import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";

import DefaultModal from "components/Modal";
import { ExpandableTable } from "components/Table";
import notification from "components/notification";
import Empty from "components/Empty";
import { fetchExams, setExamsModalAdmissionNumber } from "./ExamModalSlice";
import { toDataSource } from "utils";
import { getErrorMessage } from "utils/errorHandler";

//refactor
import examColumns, {
  examRowClassName,
  expandedExamRowRender,
} from "components/Screening/Exam/columns";

export default function ExamsModal() {
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
        // TODO: add idSegment when exists
        dispatch(fetchExams({ admissionNumber })).then((response) => {
          if (response.error) {
            notification.error({
              message: getErrorMessage(response, t),
            });
          }
        });
      }
    }
  }, [admissionNumber]); // eslint-disable-line

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  return (
    <DefaultModal
      title={t("tableHeader.exams")}
      destroyOnClose
      open={admissionNumber}
      onCancel={() => dispatch(setExamsModalAdmissionNumber(null))}
      width="90%"
      footer={null}
      style={{ top: "10px", height: "100vh" }}
    >
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
        dataSource={status !== "loading" ? toDataSource(list, "key", {}) : []}
        rowClassName={examRowClassName}
        expandedRowRender={expandedExamRowRender}
        onChange={handleTableChange}
      />
    </DefaultModal>
  );
}
