import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  AppstoreOutlined,
  PlusOutlined,
  RetweetOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

import Button from "components/Button";
import Table from "components/Table";
import Empty from "components/Empty";
import Tooltip from "components/Tooltip";
import BackTop from "components/BackTop";
import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";
import CopyExamsModal from "features/admin/Exam/CopyExams/CopyExams";
import MostFrequentExamsModal from "features/admin/Exam/MostFrequent/MostFrequent";
import { toDataSource } from "utils";
import { selectExam } from "./ExamSlice";
import ExamForm from "./Form/ExamForm";
import ExamsOrder from "./ExamsOrder/ExamsOrder";
import Filter from "./Filter/Filter";
import examColumns from "./Table/columns";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

export default function Exams() {
  const dispatch = useDispatch();
  const exams = useSelector((state) => state.admin.exam.exams.list);
  const status = useSelector((state) => state.admin.exam.exams.status);

  const [copyExamsVisible, setCopyExamsVisible] = useState(false);
  const [mostFrequentModalVisible, setMostFrequentModalVisible] =
    useState(false);
  const [examsOrderVisible, setExamsOrderVisible] = useState(false);

  const onShowExamModal = (data) => {
    dispatch(selectExam(data));
  };

  const addExamModal = () => {
    dispatch(
      selectExam({
        new: true,
        active: true,
      })
    );
  };

  const dsExams = toDataSource(exams, null, {
    showModal: onShowExamModal,
  });

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Exames</h1>
          <div className="page-header-legend">Configuração de exames</div>
        </div>
        <div className="page-header-actions">
          {PermissionService().has(Permission.ADMIN_EXAMS__COPY) && (
            <>
              <Tooltip title="Clique para mais informações">
                <Button
                  type="primary"
                  icon={<RetweetOutlined />}
                  onClick={() => setCopyExamsVisible(true)}
                >
                  Copiar Exames
                </Button>
              </Tooltip>

              <Tooltip title="Clique para mais informações">
                <Button
                  type="primary"
                  icon={<OrderedListOutlined />}
                  onClick={() => setMostFrequentModalVisible(true)}
                >
                  Exames Mais Frequentes
                </Button>
              </Tooltip>
            </>
          )}
          <Button
            type="primary gtm-bt-add-exam"
            onClick={addExamModal}
            icon={<PlusOutlined />}
          >
            Adicionar Exame
          </Button>

          <Button
            type="primary gtm-bt-add-exam"
            onClick={() => setExamsOrderVisible(true)}
            icon={<AppstoreOutlined />}
          >
            Card de Exames
          </Button>
        </div>
      </PageHeader>

      <Filter />

      <PageCard>
        <Table
          columns={examColumns()}
          pagination={false}
          loading={status === "loading"}
          locale={{ emptyText }}
          dataSource={status === "loading" ? [] : dsExams}
          rowKey="type"
        />
      </PageCard>

      <BackTop />

      <ExamForm />
      <ExamsOrder open={examsOrderVisible} setOpen={setExamsOrderVisible} />
      <CopyExamsModal open={copyExamsVisible} setOpen={setCopyExamsVisible} />
      <MostFrequentExamsModal
        open={mostFrequentModalVisible}
        setOpen={setMostFrequentModalVisible}
      />
    </>
  );
}
