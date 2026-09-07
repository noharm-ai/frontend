import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import Modal from "components/Modal";
import { Input } from "components/Inputs";
import { formatDate } from "utils/date";
import { Brand, LoginContainer } from "components/Login/Login.style";

import {
  ResultTitle,
  ValidationCard,
  ValidationResult,
} from "./CertificateValidation.style";
import {
  CODE_LENGTH,
  formatCertificateCode,
  normalizeCertificateCode,
} from "./certificateCode";

interface ICertificate {
  valid: boolean;
  maskedName?: string;
  trainingTitle?: string;
  totalHours?: number;
  totalLessons?: number;
  // titles of the lessons taken, in module order
  lessons?: string[];
  completedAt?: string;
}

type Status = "idle" | "loading" | "done" | "error";

export function CertificateValidation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { code } = useParams();

  const [status, setStatus] = useState<Status>("idle");
  const [certificate, setCertificate] = useState<ICertificate | null>(null);
  const [typedCode, setTypedCode] = useState<string>(code ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const validate = useCallback((rawCode: string) => {
    setStatus("loading");
    setCertificate(null);

    api.training
      .validateCertificate(normalizeCertificateCode(rawCode))
      .then((response: any) => {
        setCertificate(response.data.data);
        setStatus("done");
      })
      .catch(() => {
        // a failed lookup is "not found" and comes back as valid:false; only
        // a transport or server fault lands here
        setStatus("error");
      });
  }, []);

  // the :code param is the single trigger, so a pasted URL and a submitted
  // form go through exactly the same path
  useEffect(() => {
    if (code) {
      setTypedCode(code);
      validate(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const normalized = normalizeCertificateCode(typedCode);

    if (normalized.length !== CODE_LENGTH) {
      setFormError(t("certificateValidation.invalidFormat"));
      return;
    }

    setFormError(null);

    // navigate rather than fetch, so the result is a shareable URL and the
    // back button behaves
    navigate(`/validar-certificado/${formatCertificateCode(normalized)}`);
  };

  const isValid = status === "done" && certificate?.valid === true;
  const isNotFound = status === "done" && certificate?.valid === false;
  const showResult = isValid || isNotFound || status === "error";

  const closeResult = () => {
    setStatus("idle");
    setCertificate(null);

    // drop the code from the URL, or re-submitting the same one would not be a
    // navigation and the effect would never fire again
    if (code) {
      navigate("/validar-certificado", { replace: true });
    }
  };

  return (
    <LoginContainer>
      <div className="form">
        <Brand title="noHarm.ai" />

        <ValidationCard>
          <h1>{t("certificateValidation.pageTitle")}</h1>
          <p className="subtitle">{t("certificateValidation.subtitle")}</p>

          <form onSubmit={submit}>
            <Input
              className="code-input"
              placeholder={t("certificateValidation.codePlaceholder")}
              aria-label={t("certificateValidation.codeLabel")}
              value={typedCode}
              maxLength={20}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTypedCode(e.target.value)
              }
            />
            {formError && <span className="field-error">{formError}</span>}

            <div className="actions">
              <Button
                type="primary"
                htmlType="submit"
                block
                icon={<SafetyCertificateOutlined />}
                loading={status === "loading"}
              >
                {status === "loading"
                  ? t("certificateValidation.validating")
                  : t("certificateValidation.submit")}
              </Button>
            </div>
          </form>
        </ValidationCard>

        <Modal
          open={showResult}
          onCancel={closeResult}
          onOk={closeResult}
          okText={t("certificateValidation.close")}
          cancelButtonProps={{ style: { display: "none" } }}
          destroyOnHidden
          title={
            <ResultTitle $valid={isValid}>
              {isValid ? (
                <CheckCircleFilled />
              ) : isNotFound ? (
                <CloseCircleFilled />
              ) : (
                <ExclamationCircleFilled />
              )}
              {isValid
                ? t("certificateValidation.validTitle")
                : isNotFound
                  ? t("certificateValidation.invalidTitle")
                  : t("certificateValidation.errorTitle")}
            </ResultTitle>
          }
        >
          {isValid && (
            <ValidationResult>
              <p className="result-subtitle">
                {t("certificateValidation.validSubtitle")}
              </p>

              <dl>
                <dt>{t("certificateValidation.holder")}</dt>
                <dd>{certificate?.maskedName}</dd>

                <dt>{t("certificateValidation.module")}</dt>
                <dd>{certificate?.trainingTitle}</dd>

                {certificate?.totalHours ? (
                  <>
                    <dt>{t("certificateValidation.workloadLabel")}</dt>
                    <dd>
                      {t("certificateValidation.workload", {
                        count: certificate.totalHours,
                      })}
                    </dd>
                  </>
                ) : null}

                {/* the numbered list below already shows the count, so this
                    row only earns its place when there is no list */}
                {certificate?.lessons?.length ? null : (
                  <>
                    <dt>{t("certificateValidation.lessonsLabel")}</dt>
                    <dd>{certificate?.totalLessons}</dd>
                  </>
                )}

                <dt>{t("certificateValidation.completedAtLabel")}</dt>
                <dd>{formatDate(certificate?.completedAt)}</dd>
              </dl>

              {certificate?.lessons?.length ? (
                <div className="lessons">
                  <p className="lessons-title">
                    {t("certificateValidation.lessonsTaken")}
                  </p>
                  <ol>
                    {certificate.lessons.map((lesson, index) => (
                      <li key={`${index}-${lesson}`}>{lesson}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <p className="masked-hint">
                {t("certificateValidation.maskedNameHint")}
              </p>
            </ValidationResult>
          )}

          {isNotFound && (
            <ValidationResult>
              <p className="result-subtitle">
                {t("certificateValidation.invalidSubtitle")}
              </p>
            </ValidationResult>
          )}

          {status === "error" && (
            <ValidationResult>
              <p className="result-subtitle">
                {t("certificateValidation.errorSubtitle")}
              </p>
            </ValidationResult>
          )}
        </Modal>
      </div>
      <div className="bg">
        <div className="gradient"></div>
      </div>
    </LoginContainer>
  );
}
