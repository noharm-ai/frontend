import { useEffect, useState } from "react";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Input, Select, Spin, Switch } from "antd";

import api from "services/api";
import DefaultModal from "components/Modal";
import Editor from "components/Editor";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch } from "src/store";
import { KnowledgeBasePathEnum } from "models/KnowledgeBasePathEnum";
import { KnowledgeBaseSectionEnum } from "models/KnowledgeBaseSectionEnum";
import { Form } from "styles/Form.style";

import {
  IKnowledgeBaseArticle,
  upsertKnowledgeBaseArticle,
} from "../KnowledgeBaseSlice";

interface IFormValues {
  id?: number | null;
  title: string;
  description: string;
  path: string[];
  section: string[];
  link: string;
  content: string;
  active: boolean;
}

interface KnowledgeBaseFormProps {
  open: boolean;
  // edit this article; create a new one when absent
  articleId?: number | null;
  // pre-filled pages/sections for a new article (the place it was created from)
  defaults?: { path?: string[]; section?: string[] };
  onClose: () => void;
  onSaved?: (article: IKnowledgeBaseArticle) => void;
}

const hasText = (html: string | null | undefined) =>
  !!(html ?? "").replace(/<[^>]*>|&nbsp;/g, "").trim();

const emptyValues = (defaults: KnowledgeBaseFormProps["defaults"]) => ({
  id: null,
  title: "",
  description: "",
  path: defaults?.path ?? [],
  section: defaults?.section ?? [],
  link: "",
  content: "",
  active: true,
});

function FormFields() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<IFormValues>();

  const onChangeSections = (sections: string[]) => {
    setFieldValue("section", sections);

    // a section lives on a page: keep that page among the article pages, so
    // the article also shows up in the support panel of the page
    const pages = sections
      .map((value) => KnowledgeBaseSectionEnum.getSection(value)?.page)
      .filter((page): page is string => !!page && !values.path.includes(page));
    if (pages.length) {
      setFieldValue("path", [...values.path, ...new Set(pages)]);
    }
  };

  return (
    <>
      <div
        className={`form-row ${errors.title && touched.title ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Título:</label>
        </div>
        <div className="form-input">
          <Input
            value={values.title}
            maxLength={255}
            onChange={({ target }) => setFieldValue("title", target.value)}
          />
        </div>
        {errors.title && touched.title && (
          <div className="form-error">{errors.title}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-label">
          <label>Resumo:</label>
        </div>
        <div className="form-input">
          <Input.TextArea
            value={values.description}
            autoSize={{ minRows: 2, maxRows: 4 }}
            onChange={({ target }) =>
              setFieldValue("description", target.value)
            }
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">
          <label>Páginas:</label>
        </div>
        <div className="form-input">
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="O artigo aparece no painel de ajuda destas páginas"
            value={values.path}
            options={KnowledgeBasePathEnum.getOptions()}
            optionFilterProp="label"
            onChange={(value) => setFieldValue("path", value)}
            allowClear
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">
          <label>Seções:</label>
        </div>
        <div className="form-input">
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="O artigo aparece no ícone de ajuda destas seções"
            value={values.section}
            options={KnowledgeBaseSectionEnum.getOptions()}
            optionFilterProp="label"
            onChange={onChangeSections}
            allowClear
          />
        </div>
      </div>

      <div className={`form-row ${errors.content ? "error" : ""}`}>
        <div className="form-label">
          <label>Conteúdo:</label>
        </div>
        <div className="form-input">
          <Editor
            content={values.content}
            onEdit={(html: string | null) =>
              setFieldValue("content", html ?? "")
            }
            utilities={["basic", "link"]}
          />
        </div>
        {errors.content && <div className="form-error">{errors.content}</div>}
      </div>

      <div className={`form-row ${errors.link && touched.link ? "error" : ""}`}>
        <div className="form-label">
          <label>Link externo (opcional):</label>
        </div>
        <div className="form-input">
          <Input
            value={values.link}
            maxLength={255}
            placeholder="https://"
            onChange={({ target }) => setFieldValue("link", target.value)}
          />
        </div>
        {errors.link && touched.link && (
          <div className="form-error">{errors.link}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-label">
          <label>Publicado:</label>
        </div>
        <div className="form-input">
          <Switch
            checked={values.active}
            onChange={(checked) => setFieldValue("active", checked)}
          />
        </div>
      </div>
    </>
  );
}

export function KnowledgeBaseForm({
  open,
  articleId,
  defaults,
  onClose,
  onSaved,
}: KnowledgeBaseFormProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [initialValues, setInitialValues] = useState<IFormValues | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setInitialValues(null);
      return undefined;
    }

    if (!articleId) {
      setInitialValues(emptyValues(defaults));
      return undefined;
    }

    let active = true;
    api.knowledgeBase
      .get(articleId)
      .then((response: any) => {
        if (!active) return;
        const article: IKnowledgeBaseArticle = response.data.data;

        setInitialValues({
          id: article.id,
          title: article.title,
          description: article.description ?? "",
          path: article.path,
          section: article.section,
          link: article.link ?? "",
          content: article.content ?? "",
          active: article.active,
        });
      })
      .catch(() => {
        if (!active) return;
        notification.error({ message: t("error.title") });
        onClose();
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, articleId]);

  const validationSchema = Yup.object().shape({
    title: Yup.string().trim().required(t("validation.requiredField")),
    link: Yup.string()
      .nullable()
      .matches(/^https?:\/\/\S+$/, "Informe um endereço http(s) válido"),
    content: Yup.string()
      .nullable()
      .test(
        "content-or-link",
        "Escreva o conteúdo do artigo ou informe um link externo",
        function (value) {
          return hasText(value) || !!this.parent.link?.trim();
        },
      ),
  });

  const onSave = (values: IFormValues) => {
    setSaving(true);

    const params = {
      ...values,
      content: hasText(values.content) ? values.content : null,
      link: values.link?.trim() || null,
      description: values.description?.trim() || null,
    };

    dispatch(upsertKnowledgeBaseArticle(params)).then((response: any) => {
      setSaving(false);

      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
        return;
      }

      notification.success({ message: t("success.generic") });
      onSaved?.(response.payload.data);
      onClose();
    });
  };

  return (
    <DefaultModal
      open={open}
      width={800}
      centered
      destroyOnHidden
      onCancel={onClose}
      footer={initialValues ? undefined : null}
      okText={t("actions.save")}
      cancelText={t("actions.cancel")}
      confirmLoading={saving}
      okButtonProps={{ form: "knowledge-base-form", htmlType: "submit" }}
      cancelButtonProps={{ disabled: saving }}
      title="Artigo da base de conhecimento"
    >
      {!initialValues ? (
        <Spin />
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSave}
        >
          {({ handleSubmit }) => (
            <Form id="knowledge-base-form" onSubmit={handleSubmit}>
              <FormFields />
            </Form>
          )}
        </Formik>
      )}
    </DefaultModal>
  );
}
