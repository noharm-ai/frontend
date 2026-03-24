import { useFormikContext } from "formik";

import { Input, Select, Textarea } from "components/Inputs";
import { KnowledgeBasePathEnum } from "models/KnowledgeBasePathEnum";
import { IKnowledgeBaseFormBaseFields } from "./KnowledgeBaseForm";

export function MainTab() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<IKnowledgeBaseFormBaseFields>();

  const activeOptions = [
    {
      value: true,
      label: "Ativo",
    },
    {
      value: false,
      label: "Inativo",
    },
  ];

  return (
    <>
      <div className={`form-row ${errors.path && touched.path ? "error" : ""}`}>
        <div className="form-label">
          <label>Página relacionada:</label>
        </div>
        <div className="form-input">
          <Select
            mode="multiple"
            optionFilterProp="label"
            showSearch
            value={values.path}
            onChange={(value) => setFieldValue("path", value)}
            allowClear
            options={KnowledgeBasePathEnum.getList()}
          />
        </div>
        {errors.path && <div className="form-error">{errors.path}</div>}
      </div>

      <div
        className={`form-row ${errors.title && touched.title ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Título do artigo:</label>
        </div>
        <div className="form-input">
          <Input
            onChange={({ target }) => setFieldValue("title", target.value)}
            value={values.title}
            maxLength={250}
          />
        </div>
        {errors.title && <div className="form-error">{errors.title}</div>}
      </div>

      <div className={`form-row ${errors.link && touched.link ? "error" : ""}`}>
        <div className="form-label">
          <label>Link para o artigo na base de conhecimento:</label>
        </div>
        <div className="form-input">
          <Input
            onChange={({ target }) => setFieldValue("link", target.value)}
            value={values.link}
            maxLength={500}
          />
        </div>
        {errors.link && <div className="form-error">{errors.link}</div>}
      </div>

      <div
        className={`form-row ${
          errors.description && touched.description ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Descrição:</label>
        </div>
        <div className="form-input">
          <Textarea
            onChange={({ target }) =>
              setFieldValue("description", target.value)
            }
            value={values.description}
            maxLength={500}
          />
        </div>
        {errors.description && (
          <div className="form-error">{errors.description}</div>
        )}
      </div>

      <div
        className={`form-row ${errors.active && touched.active ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Status:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="label"
            showSearch
            value={values.active}
            onChange={(value) => setFieldValue("active", value)}
            allowClear
            options={activeOptions}
          />
        </div>
        {errors.active && <div className="form-error">{errors.active}</div>}
      </div>
    </>
  );
}
