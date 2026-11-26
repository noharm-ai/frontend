import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";

import { Form } from "styles/Form.style";

import { setTag, upsertTag, ITagFormData } from "../TagSlice";
import { canCreateTags, canWriteTag } from "../tagPermissions";
import { BaseForm } from "./Base";

// the autoRefreshToken middleware returns a plain Promise of the thunk action
type UpsertTagAction = Awaited<ReturnType<ReturnType<typeof upsertTag>>>;

const MAX_TAG_CHARS = 40;

// extra props are forwarded to the modal
export function TagForm({ ...props }: Record<string, unknown>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.admin.tag.single.data);
  const status = useAppSelector((state) => state.admin.tag.single.status);
  const isSaving = status === "loading";
  const canWrite = formData?.new
    ? canCreateTags()
    : canWriteTag(formData?.tagType);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .nullable()
      .required(t("validation.requiredField"))
      .max(MAX_TAG_CHARS, t("validation.maxChars", { max: MAX_TAG_CHARS })),
    tagType: Yup.number().nullable().required(t("validation.requiredField")),
    active: Yup.boolean().nullable().required(t("validation.requiredField")),
  });
  const initialValues: ITagFormData = {
    ...formData,
  };

  const onSave = (params: ITagFormData) => {
    dispatch(upsertTag(params)).then((response: UpsertTagAction) => {
      if (upsertTag.rejected.match(response)) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setTag(null));

        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const onCancel = () => {
    dispatch(setTag(null));
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit }) => (
        <DefaultModal
          open={!!formData}
          width={350}
          centered
          destroyOnHidden
          onCancel={onCancel}
          onOk={() => handleSubmit()}
          okText={t("actions.save")}
          cancelText={canWrite ? t("actions.cancel") : t("actions.close")}
          confirmLoading={isSaving}
          okButtonProps={{
            disabled: isSaving,
            style: canWrite ? undefined : { display: "none" },
          }}
          cancelButtonProps={{
            disabled: isSaving,
          }}
          {...props}
        >
          <header>
            <Heading $margin="0 0 11px">Marcador</Heading>
          </header>

          <Form onSubmit={handleSubmit}>
            <BaseForm open={!!formData} />
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
