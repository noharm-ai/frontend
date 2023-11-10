import React, { useEffect, useState, useCallback, useRef } from "react";
import isEmpty from "lodash.isempty";
import { Row, Col } from "antd";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Table from "components/Table";
import Empty from "components/Empty";
import Tooltip from "components/Tooltip";
import BackTop from "components/BackTop";
import notification from "components/notification";
import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

import FormExamModal from "containers/Forms/Exam";
import { toDataSource } from "utils";

import Filter from "./Filter";
import examColumns from "./Exam/columns";
import "./index.css";

const emptyText = (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Nenhum dado encontrado."
  />
);

const type = "DraggableBodyRow";

function Segments({
  segments,
  fetchSegmentById,
  selectExam,
  updateExamOrder,
  sortStatus,
  hospitals,
}) {
  const { t } = useTranslation();
  const [examModalVisible, setExamModalVisibility] = useState(false);
  const { single: currentSegment, examTypes } = segments;
  const availableExamTypes = currentSegment.content.exams
    ? examTypes.list.filter(
        (t) =>
          currentSegment.content.exams.findIndex((e) => e.type === t) === -1
      )
    : [];

  useEffect(() => {
    // initial load
    fetchSegmentById(1, 1);
  }, [fetchSegmentById]);

  useEffect(() => {
    if (sortStatus.error) {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [sortStatus.error, t]);

  const onShowExamModal = (data) => {
    selectExam(data);
    setExamModalVisibility(true);
  };

  const addExamModal = () => {
    selectExam({
      new: true,
      idSegment: currentSegment.content.id,
      active: true,
    });
    setExamModalVisibility(true);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  const onCancelExamModal = useCallback(() => {
    setExamModalVisibility(false);
  }, [setExamModalVisibility]);

  const dsExams = toDataSource(currentSegment.content.exams, null, {
    showModal: onShowExamModal,
    idSegment: currentSegment.content.id,
  });

  const DraggableBodyRow = ({
    index,
    moveRow,
    className,
    style,
    ...restProps
  }) => {
    const ref = useRef(null);
    const [{ isOver, dropClassName }, drop] = useDrop({
      accept: type,
      collect: (monitor) => {
        const { index: dragIndex } = monitor.getItem() || {};

        if (dragIndex === index) {
          return {};
        }

        return {
          isOver: monitor.isOver(),
          dropClassName:
            dragIndex < index ? " drop-over-downward" : " drop-over-upward",
        };
      },
      drop: (item) => {
        moveRow(item.index, index);
      },
    });
    const [, drag] = useDrag({
      type,
      item: {
        index,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    drop(drag(ref));
    return (
      <tr
        ref={ref}
        className={`${className}${isOver ? dropClassName : ""}`}
        style={{
          cursor: "move",
          ...style,
        }}
        {...restProps}
      />
    );
  };

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };
  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      if (dragIndex !== hoverIndex) {
        updateExamOrder(dragIndex, hoverIndex);
      }
    },
    [updateExamOrder]
  );

  const [sortOrder, setSortOrder] = useState({
    order: null,
    columnKey: null,
  });

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Exames</h1>
          <div className="page-header-legend">Configuração de exames</div>
        </div>
      </PageHeader>

      <Filter
        segments={segments}
        hospitals={hospitals}
        isFetching={currentSegment.isFetching}
        fetchList={fetchSegmentById}
      />

      <Row type="flex" justify="space-between" style={{ marginBottom: "20px" }}>
        <Col xs={12} style={{ display: "flex", alignItems: "flex-end" }}>
          <span>
            Exames do segmento:
            <strong>{" " + currentSegment.content.description}</strong>
          </span>
        </Col>
        <Col xs={12} style={{ textAlign: "right" }}>
          <Tooltip
            title={
              isEmpty(availableExamTypes)
                ? "Não há exames disponíves para cadastro"
                : ""
            }
          >
            <Button
              type="primary gtm-bt-add-exam"
              onClick={addExamModal}
              disabled={isEmpty(availableExamTypes)}
              icon={<PlusOutlined />}
            >
              Adicionar
            </Button>
          </Tooltip>
        </Col>
      </Row>

      <PageCard>
        <DndProvider backend={HTML5Backend}>
          <Table
            columns={examColumns(sortOrder, false)}
            pagination={false}
            loading={currentSegment.isFetching || sortStatus.isSaving}
            locale={{ emptyText }}
            dataSource={!currentSegment.isFetching ? dsExams : []}
            onChange={handleTableChange}
            components={components}
            onRow={(_, index) => {
              const attr = {
                index,
                moveRow,
              };
              return attr;
            }}
          />
        </DndProvider>
      </PageCard>

      <BackTop />

      <FormExamModal
        open={examModalVisible}
        onCancel={onCancelExamModal}
        okText="Salvar"
        okType="primary gtm-bt-save-exam"
        cancelText="Cancelar"
        afterSave={onCancelExamModal}
      />
    </>
  );
}

export default Segments;
