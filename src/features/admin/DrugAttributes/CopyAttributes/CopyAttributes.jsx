import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Divider } from "antd";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import Tooltip from "components/Tooltip";
import { Select } from "components/Inputs";
import Switch from "components/Switch";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";

import { copyAttributes } from "../DrugAttributesSlice";

function CopyAttributes({ open, setOpen, reload, ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector(
    (state) => state.admin.drugAttributes.copyAttributes.status
  );
  const segmentList = useSelector((state) => state.segments.list);

  const validationSchema = Yup.object().shape({
    idSegmentOrigin: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    idSegmentDestiny: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    attributes: Yup.array().nullable().required(t("validation.requiredField")),
  });
  const initialValues = {
    idSegmentOrigin: null,
    idSegmentDestiny: null,
    fromAdminSchema: true,
    overwriteAll: false,
    attributes: [],
  };

  const onSave = (params) => {
    dispatch(copyAttributes(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        reload();
        setOpen(false);

        notification.success({
          message: "Atributos copiados!",
          description: `${response.payload.data.data} medicamentos atualizados`,
        });
      }
    });
  };

  const onCancel = () => {
    setOpen(false);
  };

  const onChangeSchema = (active, setFieldValue) => {
    setFieldValue("fromAdminSchema", active);
    setFieldValue("idSegmentOrigin", null);
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors, touched, values, setFieldValue }) => (
        <DefaultModal
          open={open}
          width={500}
          centered
          destroyOnClose
          onCancel={onCancel}
          onOk={handleSubmit}
          okText="Iniciar cópia"
          cancelText={t("actions.cancel")}
          confirmLoading={status === "loading"}
          okButtonProps={{
            disabled: status === "loading",
          }}
          cancelButtonProps={{
            disabled: status === "loading",
          }}
          {...props}
        >
          <header>
            <Heading margin="0 0 11px">Copiar Atributos</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <p>
              Esta ação copia os atributos dos medicamentos entre o segmento{" "}
              <strong>origem</strong> e o segmento <strong>destino</strong>.
            </p>
            <p>
              A cópia dos atributos é baseada na substância dos medicamentos.
              Portanto, as substâncias dos medicamentos precisam estar
              definidas.
            </p>
            <p>
              **É recomendado utilizar o botão "Ajustar inconsistências" antes
              de executar a cópia dos atributos.
            </p>

            <Divider />

            <div
              className={`form-row ${
                errors.idSegmentOrigin && touched.idSegmentOrigin ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Atributos:</label>
              </div>
              <div className="form-input">
                <Select
                  onChange={(value) => setFieldValue("attributes", value)}
                  value={values.attributes}
                  status={
                    errors.attributes && touched.attributes ? "error" : null
                  }
                  optionFilterProp="children"
                  showSearch
                  autoFocus
                  allowClear
                  mode="multiple"
                >
                  <Select.OptGroup label="Classificação">
                    <Select.Option key="mav" value="mav">
                      Alta Vigilância
                    </Select.Option>

                    <Select.Option key="antimicro" value="antimicro">
                      Antimicrobiano
                    </Select.Option>

                    <Select.Option key="controlados" value="controlados">
                      Controlados
                    </Select.Option>

                    <Select.Option key="dialisavel" value="dialisavel">
                      Dialisável
                    </Select.Option>

                    <Select.Option key="jejum" value="jejum">
                      Jejum
                    </Select.Option>

                    <Select.Option key="idoso" value="idoso">
                      MPI
                    </Select.Option>

                    <Select.Option key="naopadronizado" value="naopadronizado">
                      Não Padronizado
                    </Select.Option>

                    <Select.Option key="quimio" value="quimio">
                      Quimioterápico
                    </Select.Option>

                    <Select.Option key="linhabranca" value="linhabranca">
                      Sem validação
                    </Select.Option>

                    <Select.Option key="sonda" value="sonda">
                      Sonda
                    </Select.Option>
                  </Select.OptGroup>

                  <Select.OptGroup label="Valores">
                    <Select.Option key="plaquetas" value="plaquetas">
                      Alerta de Plaquetas
                    </Select.Option>

                    <Select.Option key="hepatico" value="hepatico">
                      Hepatotóxico
                    </Select.Option>
                    <Select.Option key="renal" value="renal">
                      Nefrotóxico
                    </Select.Option>

                    <Select.Option key="risco_queda" value="risco_queda">
                      Risco de Queda
                    </Select.Option>
                    <Select.Option key="lactante" value="lactante">
                      Risco Lactante
                    </Select.Option>
                    <Select.Option key="gestante" value="gestante">
                      Risco Gestante
                    </Select.Option>
                    <Select.Option
                      key="fkunidademedidacusto"
                      value="fkunidademedidacusto"
                    >
                      Unidade de medida do Custo
                    </Select.Option>
                    <Select.Option key="custo" value="custo">
                      Custo
                    </Select.Option>
                  </Select.OptGroup>
                </Select>
              </div>
              {errors.attributes && touched.attributes && (
                <div className="form-error">{errors.attributes}</div>
              )}
            </div>

            <div className={`form-row`}>
              <div className="form-label">
                <label>
                  Importar da <strong>Curadoria NoHarm</strong>?:
                </label>
              </div>
              <div className="form-input">
                <Switch
                  onChange={(active) => onChangeSchema(active, setFieldValue)}
                  checked={values.fromAdminSchema}
                />
              </div>
            </div>

            <div
              className={`form-row ${
                errors.idSegmentOrigin && touched.idSegmentOrigin ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Segmento origem:</label>
              </div>
              <div className="form-input">
                <Select
                  onChange={(value) => setFieldValue("idSegmentOrigin", value)}
                  value={values.idSegmentOrigin}
                  status={
                    errors.idSegmentOrigin && touched.idSegmentOrigin
                      ? "error"
                      : null
                  }
                  optionFilterProp="children"
                  showSearch
                  autoFocus
                  allowClear
                >
                  {values.fromAdminSchema ? (
                    <>
                      <Select.Option key={5} value={5}>
                        Curadoria Adulto
                      </Select.Option>
                      <Select.Option key={7} value={7}>
                        Curadoria Pediátrica
                      </Select.Option>
                    </>
                  ) : (
                    segmentList.map(({ id, description: text }) => (
                      <Select.Option key={id} value={id}>
                        {text}
                      </Select.Option>
                    ))
                  )}
                </Select>
              </div>
              {errors.idSegmentOrigin && touched.idSegmentOrigin && (
                <div className="form-error">{errors.idSegmentOrigin}</div>
              )}
            </div>

            <div
              className={`form-row ${
                errors.idSegmentOrigin && touched.idSegmentOrigin ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Segmento destino:</label>
              </div>
              <div className="form-input">
                <Select
                  onChange={(value) => setFieldValue("idSegmentDestiny", value)}
                  value={values.idSegmentDestiny}
                  status={
                    errors.idSegmentDestiny && touched.idSegmentDestiny
                      ? "error"
                      : null
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
              {errors.idSegmentDestiny && touched.idSegmentDestiny && (
                <div className="form-error">{errors.idSegmentDestiny}</div>
              )}
            </div>

            <div className={`form-row`}>
              <div className="form-label">
                <label>
                  <Tooltip
                    underline
                    title="Quando marcado, sobrescreve os atributos selecionados, mesmo aqueles que já foram atualizados pelo cliente."
                  >
                    Sobrescrever atributos?:
                  </Tooltip>
                </label>
              </div>
              <div className="form-input">
                <Switch
                  onChange={(active) => setFieldValue("overwriteAll", active)}
                  checked={values.overwriteAll}
                />
              </div>
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default CopyAttributes;
