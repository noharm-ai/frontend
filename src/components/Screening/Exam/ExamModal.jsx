import React, { useEffect, useState } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";

import DefaultModal from "components/Modal";
import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";
import { toDataSource } from "utils";

import examColumns, {
  examRowClassName,
  expandedExamRowRender,
} from "./columns";

export default function Modal({
  fetchExams,
  exams,
  admissionNumber,
  idSegment,
  visible,
  setVisibility,
}) {
  const [dsExams, setDsExams] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    order: null,
    columnKey: null,
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      if (isEmpty(exams.list) && admissionNumber && idSegment) {
        fetchExams(admissionNumber, { idSegment: idSegment });
      }
    }
  }, [visible, admissionNumber, idSegment]); // eslint-disable-line

  useEffect(() => {
    setDsExams(toDataSource(exams.list, "key", {}));
  }, [exams.list]); // eslint-disable-line

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  return (
    <DefaultModal
      title={t("tableHeader.exams")}
      destroyOnClose
      visible={visible}
      onCancel={() => setVisibility(false)}
      width="90%"
      footer={null}
      style={{ top: "10px", height: "100vh" }}
    >
      <ExpandableTable
        columns={examColumns(t, sortOrder)}
        showSorterTooltip={false}
        pagination={false}
        loading={exams.isFetching}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhum exame encontrado."
            />
          ),
        }}
        dataSource={!exams.isFetching ? dsExams : []}
        rowClassName={examRowClassName}
        expandedRowRender={expandedExamRowRender}
        onChange={handleTableChange}
      />
    </DefaultModal>
  );
}
