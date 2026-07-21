import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";

import { useAppDispatch, useAppSelector } from "src/store";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import { Form } from "styles/Form.style";

import {
  setProtocol,
  upsertProtocol,
  fetchProtocols,
  reset,
} from "../ProtocolSlice";
import { BaseForm } from "./Base";
import { IProtocolFormBaseFields, emptyProtocol } from "./types";
import { StickyPageHeader } from "../Protocol.style";

const LIST_PATH = "/admin/protocolos";

export function ProtocolEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const list = useAppSelector((state) => state.admin.protocol.list);
  const listStatus = useAppSelector((state) => state.admin.protocol.status);
  const saveStatus = useAppSelector(
    (state) => state.admin.protocol.single.status
  );
  const isSaving = saveStatus === "loading";
  const isNew = id === "new";

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (!isNew) {
      dispatch(fetchProtocols({}));
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isNew]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().required(t("validation.requiredField")),
    protocolType: Yup.string()
      .nullable()
      .required(t("validation.requiredField")),
    statusType: Yup.string().nullable().required(t("validation.requiredField")),
    config: Yup.object().shape({
      variables: Yup.array()
        .nullable()
        .min(1, t("validation.atLeastOne"))
        .required(t("validation.requiredField")),
      trigger: Yup.string().nullable().required(t("validation.requiredField")),
      result: Yup.object().shape({
        level: Yup.string().nullable().required(t("validation.requiredField")),
        message: Yup.string()
          .nullable()
          .required(t("validation.requiredField")),
        description: Yup.string()
          .nullable()
          .required(t("validation.requiredField")),
      }),
    }),
  });

  const record = isNew
    ? null
    : list.find((p: any) => String(p.id) === id) ?? null;

  const initialValues: IProtocolFormBaseFields = record
    ? { ...record }
    : emptyProtocol();

  const onSave = (params: IProtocolFormBaseFields) => {
    dispatch(upsertProtocol(params)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setProtocol(null));
        notification.success({
          message: t("success.generic"),
        });
        navigate(LIST_PATH);
      }
    });
  };

  const onCancel = () => {
    navigate(LIST_PATH);
  };

  const isLoading = !isNew && listStatus === "loading";
  const notFound = !isNew && listStatus === "succeeded" && !record;

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({
        handleSubmit,
        values,
      }: {
        handleSubmit: () => void;
        values: any;
      }) => (
        <>
          <div ref={sentinelRef} />
          <StickyPageHeader className={isStuck ? "is-stuck" : ""}>
            <div>
              <h1 className="page-header-title">
                {isNew ? "Novo Protocolo" : values.name || "Editar Protocolo"}
              </h1>
              <div className="page-header-legend">Protocolos</div>
            </div>
            <div className="page-header-actions">
              <Button onClick={onCancel} disabled={isSaving}>
                {t("actions.cancel")}
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={isSaving}
                disabled={isSaving || isLoading || notFound}
              >
                {t("actions.save")}
              </Button>
            </div>
          </StickyPageHeader>

          {notFound ? (
            <p>Protocolo não encontrado.</p>
          ) : (
            <Form onSubmit={handleSubmit}>
              <BaseForm formData={values} />
            </Form>
          )}
        </>
      )}
    </Formik>
  );
}
