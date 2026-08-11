import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as Yup from "yup";
import { RobotOutlined } from "@ant-design/icons";
import { Alert } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import { Form } from "styles/Form.style";

import {
  setProtocol,
  upsertProtocol,
  fetchProtocol,
  reset,
} from "../ProtocolSlice";
import { BaseForm } from "./Base";
import { AgentChatDrawer } from "./AgentChat/AgentChatDrawer";
import { IProtocolFormBaseFields, emptyProtocol } from "./types";
import { findUnfilledClearedAttributes } from "./copyProtocol";
import { IProtocolEditorLocationState } from "./navigationState";
import { StickyPageHeader } from "../Protocol.style";

const LIST_PATH = "/admin/protocolos";

export function ProtocolEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const storedRecord = useAppSelector(
    (state) => state.admin.protocol.record.data
  );
  const recordStatus = useAppSelector(
    (state) => state.admin.protocol.record.status
  );
  const saveStatus = useAppSelector(
    (state) => state.admin.protocol.single.status
  );
  const isSaving = saveStatus === "loading";
  const isNew = id === "new";

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  useEffect(() => {
    // the editor is opened from the (usually scrolled) listing, and the
    // browser keeps the scroll position across the navigation
    window.scrollTo({ top: 0 });

    if (!isNew && id) {
      dispatch(fetchProtocol({ id }));
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isNew, id]);

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

  // never render a record other than the one the url asks for (switching to
  // "new" or to another id keeps this component mounted)
  const record =
    !isNew && String(storedRecord?.id) === id ? storedRecord : null;

  const protocolCopy =
    (isNew &&
      (location.state as IProtocolEditorLocationState | null)?.protocolCopy) ||
    null;

  const initialValues: IProtocolFormBaseFields = useMemo(() => {
    if (record) return { ...record };
    if (protocolCopy) return protocolCopy.values;

    return emptyProtocol();
  }, [record, protocolCopy]);

  const onSave = (params: IProtocolFormBaseFields) => {
    const unfilled = protocolCopy
      ? findUnfilledClearedAttributes(params, protocolCopy.clearedAttributes)
      : [];

    if (unfilled.length) {
      notification.error({
        message: "Preencha os campos limpos na cópia",
        description: unfilled
          .map((item) => `${item.variableName}: ${item.label}`)
          .join(" · "),
      });
      return;
    }

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

  const isLoading =
    !isNew && (recordStatus === "loading" || recordStatus === "idle");
  const notFound =
    !isNew &&
    ((recordStatus === "succeeded" && !record) || recordStatus === "failed");

  const copyNotice = protocolCopy ? (
    <Alert
      type={protocolCopy.clearedAttributes.length ? "warning" : "info"}
      showIcon
      style={{ marginBottom: "20px" }}
      message={`Cópia de "${protocolCopy.sourceName}"${
        protocolCopy.sourceSchema ? ` (${protocolCopy.sourceSchema})` : ""
      }`}
      description={
        protocolCopy.clearedAttributes.length ? (
          <>
            <p>
              As variáveis abaixo usam dados específicos do schema de origem e
              foram limpas. Preencha-as com os valores deste schema antes de
              salvar:
            </p>
            <ul>
              {protocolCopy.clearedAttributes.map((item) => (
                <li key={`${item.variableName}-${item.attribute}`}>
                  <strong>{item.variableName}</strong>: {item.label}
                </li>
              ))}
            </ul>
          </>
        ) : (
          "A cópia começa como Inativa. Revise os dados e ajuste a situação antes de salvar."
        )
      }
    />
  ) : null;

  // A global protocol is shared by every schema: editing it here changes the
  // behaviour of all of them, so say it out loud.
  const globalNotice =
    record && !record.schema ? (
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: "20px" }}
        message="Protocolo global (Todos os schemas)"
        description="As alterações valem para todos os schemas, não apenas para o seu."
      />
    ) : null;

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
      }) => {
        const header = (
          <>
            <div ref={sentinelRef} />
            <StickyPageHeader className={isStuck ? "is-stuck" : ""}>
              <div>
                <h1 className="page-header-title">
                  {isNew
                    ? protocolCopy
                      ? "Copiar Protocolo"
                      : "Novo Protocolo"
                    : values.name || "Editar Protocolo"}
                </h1>
                <div className="page-header-legend">Protocolos</div>
              </div>
              <div className="page-header-actions">
                <Button
                  id="protocol-copilot-open"
                  icon={<RobotOutlined />}
                  onClick={() => setCopilotOpen(true)}
                  disabled={isSaving || isLoading || notFound}
                >
                  Copiloto IA
                </Button>
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
          </>
        );

        return notFound ? (
          <>
            {header}
            <p>Protocolo não encontrado.</p>
          </>
        ) : (
          <Form onSubmit={handleSubmit}>
            <BaseForm
              formData={values}
              header={header}
              notice={copyNotice ?? globalNotice}
            />
            <AgentChatDrawer
              open={copilotOpen}
              onClose={() => setCopilotOpen(false)}
            />
          </Form>
        );
      }}
    </Formik>
  );
}
