import React from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Upload, notification } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { Select, Input } from "components/Inputs";
import Editor from "components/Editor";
import Button from "components/Button";
import IntegrationStatus from "models/IntegrationStatus";

import { EditorBox } from "components/Forms/Form.style";

function BaseForm() {
  const { t } = useTranslation();
  const integrationStatus = useSelector(
    (state) => state.app.config.integrationStatus
  );
  const { values, errors, touched, setFieldValue } = useFormikContext();

  const uploadProps = {
    onRemove: (file) => {
      const index = values.fileList.indexOf(file);
      const newFileList = values.fileList.slice();
      newFileList.splice(index, 1);
      setFieldValue("fileList", newFileList);
    },
    beforeUpload: (file) => {
      if (values.fileList.length >= 2) {
        notification.error({ message: "Máximo de arquivos anexos atingido." });
      } else {
        setFieldValue("fileList", [...values.fileList, file]);
      }

      return false;
    },
    listType: "picture",
    multiple: true,
    accept: "image/*, .doc, .docx, .pdf",
    fileList: values.fileList,
  };

  return (
    <>
      <div
        className={`form-row ${
          errors.category && touched.category ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>{t("labels.ticketType")}:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("category", value)}
            value={values.category}
            status={errors.category && touched.category ? "error" : null}
            optionFilterProp="children"
            showSearch
            placeholder="Selecione"
          >
            <Select.Option key={0} value="Dúvida">
              Dúvida
            </Select.Option>
            <Select.Option key={1} value="Erro">
              Erro
            </Select.Option>
            <Select.Option key={2} value="Sugestão">
              Sugestão
            </Select.Option>
            {integrationStatus === IntegrationStatus.INTEGRATION && (
              <Select.Option key={2} value="Validação">
                Validação
              </Select.Option>
            )}
          </Select>
        </div>
        {errors.category && touched.category && (
          <div className="form-error">{errors.category}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.category && touched.category ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>{t("labels.subject")}:</label>
        </div>
        <div className="form-input">
          <Input
            placeholder="Ex: Erro ao checar prescrição"
            value={values.title}
            onChange={({ target }) => setFieldValue("title", target.value)}
            maxLength={90}
          />
        </div>
        {errors.title && touched.title && (
          <div className="form-error">{errors.title}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.description && touched.description ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>{t("labels.message")}:</label>
        </div>
        <div className="form-input">
          <EditorBox>
            <Editor
              onEdit={(value) => setFieldValue("description", value)}
              content={values.description || ""}
              onReady={(editor) => {
                editor.editing.view.change((writer) => {
                  writer.setStyle(
                    "height",
                    "200px",
                    editor.editing.view.document.getRoot()
                  );
                });
              }}
            />
          </EditorBox>
        </div>

        {errors.description && touched.description && (
          <div className="form-error">{errors.description}</div>
        )}
        <div className="form-info">
          Lembre-se de dar exemplos com número de Atendimento e/ou número de
          Prescrição para facilitar a resolução do seu chamado.
        </div>
      </div>

      <div className={`form-row ${errors.fileList ? "error" : ""}`}>
        <div className="form-label"></div>
        <div className="form-input">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Anexar arquivo</Button>
          </Upload>
        </div>
        <div className="form-info">
          <ul>
            <li>
              * Até 2 anexos são permitidos (mais anexos podem ser enviados após
              a abertura do chamado)
            </li>
            <li>* Tamanho máximo do arquivo: 2mb</li>
            <li>* Extensões permitidas: .png, .jpg, .doc, .docx, .pdf</li>
          </ul>
        </div>
        {errors.fileList && <div className="form-error">{errors.fileList}</div>}
      </div>
    </>
  );
}

export default BaseForm;
