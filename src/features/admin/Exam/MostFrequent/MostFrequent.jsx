import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { ExpandableTable } from "components/Table";
import Empty from "components/Empty";
import { Input, Select } from "components/Inputs";
import { getErrorMessage } from "utils/errorHandler";
import { Form } from "styles/Form.style";

import { fetchMostFrequent, addMostFrequent } from "../ExamSlice";
import columns from "./columns";
//todo: should be central
import { FilterContainer } from "../../Segment/Segment.style";

function MostFrequentForm({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const segmentList = useSelector((state) => state.segments.list);
  const exams = useSelector((state) => state.admin.exam.fetchMostFrequent.list);
  const fetchStatus = useSelector(
    (state) => state.admin.exam.fetchMostFrequent.status,
  );
  const saveStatus = useSelector(
    (state) => state.admin.exam.addMostFrequent.status,
  );

  const [filter, setFilter] = useState({
    type: null,
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchMostFrequent()).then((response) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        }
      });
    }
  }, [open, dispatch, t]);

  const validationSchema = Yup.object().shape({
    idSegment: Yup.string().nullable().required(t("validation.requiredField")),
    selectedExams: Yup.array().min(1, "Selecione ao menos um exame"),
  });

  const initialValues = {
    selectedKeys: [],
    selectedExams: [],
    idSegment: null,
  };

  const filterList = () => {
    if (!exams) return [];

    return exams.filter((i) => {
      let show = true;

      if (filter.type) {
        show = show && i.type.toLowerCase().includes(filter.type.toLowerCase());
      }

      return show;
    });
  };

  const onSave = (params) => {
    const save = () => {
      const payload = {
        idSegment: params.idSegment,
        examTypes: params.selectedExams.map((e) => e.type),
      };

      dispatch(addMostFrequent(payload)).then((response) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          notification.success({
            message: "Exames inseridos com sucesso!",
            description:
              "Recarregue a página para ver os resultados. Os exames inseridos estão inativos. Eles devem ser configurados antes de ativar.",
          });
          setOpen(false);
        }
      });
    };

    DefaultModal.confirm({
      title: "Confirma a inclusao dos exames selecionados?",
      content: (
        <>
          <p>
            <strong>{params.selectedKeys.length}</strong> exames selecionados
          </p>
        </>
      ),
      onOk: save,
      okText: "Confirmar",
      cancelText: "Cancelar",
      width: 500,
    });
  };

  const onCancel = () => {
    setOpen(false);
    setFilter({
      type: null,
    });
  };

  const getDatasource = () => {
    return filterList().map((d) => ({
      key: `${d.type}`,
      ...d,
    }));
  };

  const rowSelection = (selected, setFieldValue) => ({
    type: "checkbox",
    selectedRowKeys: selected,
    preserveSelectedRowKeys: true,
    onChange: (selectedRowKeys, selectedRows) => {
      setFieldValue("selectedKeys", selectedRowKeys);
      setFieldValue("selectedExams", selectedRows);
    },
  });

  if (!open) {
    return null;
  }

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, values, setFieldValue, errors, touched }) => (
        <DefaultModal
          open={open}
          width={"60vw"}
          centered
          destroyOnHidden
          onCancel={onCancel}
          onOk={handleSubmit}
          okText="Adicionar Exames"
          cancelText={t("actions.cancel")}
          confirmLoading={saveStatus === "loading"}
          okButtonProps={{
            disabled: saveStatus === "loading",
          }}
          cancelButtonProps={{
            disabled: saveStatus === "loading",
          }}
          maskClosable={false}
        >
          <header>
            <Heading style={{ fontSize: "20px" }}>
              Exames Mais Frequentes
            </Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <FilterContainer>
              <div className="info">
                {values.selectedKeys.length} exames selecionados
              </div>
              <div>
                <Input
                  style={{ width: 300 }}
                  placeholder="Procurar por exame"
                  allowClear
                  onChange={(ev) =>
                    setFilter({
                      ...filter,
                      ...{ type: ev.target.value },
                    })
                  }
                />
              </div>
            </FilterContainer>

            {errors.selectedExams && touched.selectedExams && (
              <div className="form-error">{errors.selectedExams}</div>
            )}

            <ExpandableTable
              rowSelection={rowSelection(values.selectedKeys, setFieldValue)}
              columns={columns(t)}
              pagination={true}
              loading={fetchStatus === "loading"}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Nenhum departamento encontrado."
                  />
                ),
              }}
              dataSource={
                fetchStatus !== "loading" ? getDatasource(values) : []
              }
              showSorterTooltip={false}
            />

            <div
              className={`form-row ${
                errors.idSegment && touched.idSegment ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Segmento destino:</label>
              </div>
              <div className="form-input">
                <Select
                  onChange={(value) => setFieldValue("idSegment", value)}
                  value={values.idSegment}
                  status={
                    errors.idSegment && touched.idSegment ? "error" : null
                  }
                  optionFilterProp="children"
                  showSearch
                  autoFocus
                  allowClear
                >
                  {segmentList.map(({ id, description: text }) => (
                    <Select.Option key={id} value={id}>
                      {text}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {errors.idSegment && touched.idSegment && (
                <div className="form-error">{errors.idSegment}</div>
              )}
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default MostFrequentForm;
