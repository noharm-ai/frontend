import React from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { Select } from "components/Inputs";
import Editor from "components/Editor";
import Button from "components/Button";

import { EditorBox } from "components/Forms/Form.style";

function BaseForm() {
  const { t } = useTranslation();
  const { values, errors, touched, setFieldValue } = useFormikContext();

  const uploadProps = {
    onRemove: () => {
      setFieldValue("fileList", []);
      setFieldValue("attachment", null);
    },
    beforeUpload: (file) => {
      setFieldValue("fileList", [file]);
      setFieldValue("attachment", file);

      return false;
    },
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
          <label>{t("labels.subject")}:</label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("category", value)}
            value={values.category}
            status={errors.category && touched.category ? "error" : null}
            optionFilterProp="children"
            showSearch
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
          </Select>
        </div>
        {errors.category && touched.category && (
          <div className="form-error">{errors.category}</div>
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
      </div>

      <div className={`form-row ${errors.attachment ? "error" : ""}`}>
        <div className="form-label"></div>
        <div className="form-input">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Anexar arquivo</Button>
          </Upload>
        </div>
        {errors.attachment && (
          <div className="form-error">{errors.attachment}</div>
        )}
      </div>
    </>
  );
}

export default BaseForm;
