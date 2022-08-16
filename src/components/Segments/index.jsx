import React, { useEffect, useState, useCallback, useRef } from "react";
import isEmpty from "lodash.isempty";
import { Row, Col } from "antd";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

import Tabs from "components/Tabs";
import Button from "components/Button";
import Table from "components/Table";
import Empty from "components/Empty";
import Tooltip from "components/Tooltip";
import PopConfirm from "components/PopConfirm";
import BackTop from "components/BackTop";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import Progress from "components/Progress";
import Heading from "components/Heading";

import FormSegment from "containers/Forms/Segment";
import FormExamModal from "containers/Forms/Exam";
import api from "services/api";
import { toDataSource, errorHandler } from "utils";

import feedback from "./feedback";
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
  outliers,
  generateOutlier,
  resetGenerate,
  fetchSegmentsList,
  fetchSegmentById,
  security,
  selectExam,
  updateExamOrder,
  sortStatus,
  access_token,
}) {
  const params = useParams();
  const { t } = useTranslation();
  const [examModalVisible, setExamModalVisibility] = useState(false);
  const [progressModalVisible, setProgressModalVisibility] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const { generate } = outliers;
  const { single: currentSegment, examTypes } = segments;
  const availableExamTypes = currentSegment.content.exams
    ? examTypes.list.filter(
        (t) =>
          currentSegment.content.exams.findIndex((e) => e.type === t) === -1
      )
    : [];

  useEffect(() => {
    fetchSegmentsList();
  }, [fetchSegmentsList]);

  useEffect(() => {
    if (!isEmpty(segments.list)) {
      if (!isEmpty(params)) {
        fetchSegmentById(params.idSegment);
      } else {
        fetchSegmentById(segments.list[0].id);
      }
    }
  }, [fetchSegmentById, params, segments.list]);

  useEffect(() => {
    let errorResponse = null;
    const startOutliersGeneration = async () => {
      const progressStep = 100 / generate.data.length;
      let progressTotal = 0;

      for (let i = 0; i < generate.data.length; i++) {
        const url = generate.data[i];

        const { error } = await api
          .generateOutlierFold(access_token, url)
          .catch(errorHandler);
        if (error) {
          errorResponse = error;
          break;
        }

        if (i === generate.data.length - 1) {
          progressTotal = 100;
        } else {
          progressTotal += progressStep;
        }

        setProgressPercentage(progressTotal);
      }

      if (!errorResponse) {
        setTimeout(() => {
          setProgressModalVisibility(false);
          feedback(generate.status, generate);
          setProgressPercentage(0);
          resetGenerate();
        }, 1000);
      } else {
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
        setProgressModalVisibility(false);
        resetGenerate();
      }
    };

    if (generate.status) {
      setProgressModalVisibility(true);
      startOutliersGeneration();
    }
  }, [access_token, generate, resetGenerate, t]);

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
      idSegment: segments.firstFilter.idSegment,
      active: true,
    });
    setExamModalVisibility(true);
  };

  const onCancelExamModal = useCallback(() => {
    setExamModalVisibility(false);
  }, [setExamModalVisibility]);

  const dsExams = toDataSource(currentSegment.content.exams, null, {
    showModal: onShowExamModal,
    idSegment: segments.firstFilter.idSegment,
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

  const afterSaveSegment = () => {};

  const [sortOrder, setSortOrder] = useState({
    order: null,
    columnKey: null,
  });

  const handleTableChange = (pagination, filters, sorter) => {
    setSortOrder(sorter);
  };

  const generateOutlierClick = () =>
    generateOutlier({
      id: segments.firstFilter.idSegment,
    });

  return (
    <>
      <Row>
        <Col xs={12}>
          <Filter segments={segments} />
        </Col>
        <Col xs={12} style={{ textAlign: "right" }}>
          {security.isAdmin() && (
            <PopConfirm
              title="Essa ação irá recalcular os escores de todo o segmento. Deseja continuar?"
              onConfirm={generateOutlierClick}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                type="primary gtm-bt-seg-generate"
                style={{ marginTop: "10px" }}
                loading={outliers.generate.isGenerating}
                disabled={outliers.generate.isGenerating}
              >
                Gerar Escores
              </Button>
            </PopConfirm>
          )}
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="1"
        style={{ width: "100%", marginTop: "20px" }}
        type="card gtm-tab-segments"
      >
        {security.isAdmin() && (
          <Tabs.TabPane tab="Setores" key="1">
            <FormSegment afterSaveSegment={afterSaveSegment} />
          </Tabs.TabPane>
        )}

        <Tabs.TabPane tab="Exames" key="2">
          <Row type="flex" justify="end" style={{ marginBottom: "20px" }}>
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
          </Row>
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
        </Tabs.TabPane>
      </Tabs>

      <BackTop />

      <FormExamModal
        visible={examModalVisible}
        onCancel={onCancelExamModal}
        okText="Salvar"
        okType="primary gtm-bt-save-exam"
        cancelText="Cancelar"
        afterSave={onCancelExamModal}
      />

      <DefaultModal
        width={210}
        centered
        destroyOnClose
        visible={progressModalVisible}
        footer={null}
        closable={false}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Progress
            type="circle"
            percent={Math.round(progressPercentage)}
            strokeColor={{
              "0%": "rgb(112, 189, 196)",
              "100%": "rgb(126, 190, 154)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "15px",
          }}
        >
          <Heading size="16px">Gerando escores...</Heading>
        </div>
      </DefaultModal>
    </>
  );
}

export default Segments;
