import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Alert } from "antd";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CopyOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  MinusCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import { Brand } from "components/Login/Login.style";

import {
  CheckId,
  ICheck,
  IReceipt,
  IValidationPlan,
  receiptToText,
  runGetnameValidation,
} from "../getnameDiagnostics";
import {
  CheckIcon,
  CheckList,
  PageContainer,
  ValidationCard,
} from "./GetnameValidation.style";

type Phase = "loading" | "invalid" | "error" | "ready" | "running" | "done";
type SaveState = "idle" | "saving" | "saved" | "error";

// every step the test can run, in the order it runs them
const CHECK_ORDER: CheckId[] = [
  "config",
  "environment",
  "reachability",
  "health",
  "database",
  "auth_config",
  "lookup",
];

// diagnoses whose way out starts by opening the getname itself: the browser
// then shows the real error (certificate, refused connection, no route)
const OPEN_GETNAME_DIAGNOSES = ["unreachable", "unreachable_timeout"];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  passed: <CheckCircleFilled />,
  failed: <CloseCircleFilled />,
  warning: <ExclamationCircleFilled />,
  skipped: <MinusCircleOutlined />,
  running: <LoadingOutlined />,
  pending: <ClockCircleOutlined />,
};

export function GetnameValidation() {
  const { t, i18n } = useTranslation();
  const { token } = useParams();

  const [phase, setPhase] = useState<Phase>("loading");
  const [plan, setPlan] = useState<IValidationPlan | null>(null);
  const [checks, setChecks] = useState<ICheck[]>([]);
  const [running, setRunning] = useState<CheckId | null>(null);
  const [receipt, setReceipt] = useState<IReceipt | null>(null);
  const [permissionPrompt, setPermissionPrompt] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [ticket, setTicket] = useState<string | null>(null);
  const [runs, setRuns] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;

    api.getnameValidation
      .getPlan(token)
      .then((response: any) => {
        const data: IValidationPlan = response.data.data;

        setPlan(data);
        setRuns(data.runs ?? 0);
        setPhase(data.valid ? "ready" : "invalid");
      })
      .catch(() => {
        // an unknown link comes back as valid:false; only a transport or
        // server fault lands here
        setPhase("error");
      });
  }, [token]);

  const save = useCallback(
    (result: IReceipt) => {
      setSaveState("saving");

      api.getnameValidation
        .saveResult(token, result)
        .then((response: any) => {
          setTicket(response.data.data.ticket ?? null);
          setRuns(response.data.data.runs ?? 0);
          setSaveState("saved");
        })
        .catch(() => {
          setSaveState("error");
        });
    },
    [token],
  );

  const start = async () => {
    if (!plan || !token) return;

    setPhase("running");
    setChecks([]);
    setReceipt(null);
    setPermissionPrompt(false);
    setSaveState("idle");
    setCopied(false);

    const result = await runGetnameValidation(plan, {
      getAuthToken: async () => {
        const response: any = await api.getnameValidation.getAuthToken(token);

        return response.data.data.token;
      },
      onProgress: (current, step) => {
        setChecks(current);
        setRunning(step);
      },
      onPermissionPrompt: () => setPermissionPrompt(true),
    });

    setPermissionPrompt(false);
    setRunning(null);
    setChecks(result.checks);
    setReceipt(result);
    setPhase("done");
    save(result);
  };

  const copyReceipt = () => {
    if (!plan || !receipt) return;

    navigator.clipboard
      ?.writeText(receiptToText(plan, receipt, ticket))
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const checkMessage = (check: ICheck) => {
    const parts = [];

    if (check.code) {
      parts.push(
        t(`getnameValidation.codes.${check.code}`, {
          defaultValue: check.code,
        }),
      );
    }
    if (check.httpStatus !== undefined && check.status !== "passed") {
      parts.push(`HTTP ${check.httpStatus}`);
    }
    if (check.detail) {
      parts.push(check.detail);
    }

    return parts.join(" · ");
  };

  const renderChecks = () => {
    const done = new Map(checks.map((check) => [check.id, check]));
    const visible = CHECK_ORDER.filter(
      (id) => done.has(id) || phase === "running",
    );

    return (
      <CheckList data-kb="getnameValidation.checks">
        {visible.map((id) => {
          const check = done.get(id);
          const status = check?.status ?? (running === id ? "running" : "pending");

          return (
            <li key={id} data-check={id} data-status={status}>
              <CheckIcon $status={status}>{STATUS_ICONS[status]}</CheckIcon>
              <span className="check-label">
                {t(`getnameValidation.checks.${id}`)}
              </span>
              <span className="check-time">
                {check?.durationMs !== undefined ? `${check.durationMs} ms` : ""}
              </span>
              {check && checkMessage(check) && (
                <span className="check-message">{checkMessage(check)}</span>
              )}
            </li>
          );
        })}
      </CheckList>
    );
  };

  const renderVerdict = () => {
    if (!receipt || !plan) return null;

    const type =
      receipt.status === "passed"
        ? receipt.diagnosis === "ok"
          ? "success"
          : "warning"
        : receipt.status === "not_applicable"
          ? "info"
          : "error";

    return (
      <Alert
        data-kb="getnameValidation.verdict"
        data-diagnosis={receipt.diagnosis}
        type={type}
        showIcon
        title={t(`getnameValidation.diagnosis.${receipt.diagnosis}.title`, {
          defaultValue: receipt.diagnosis,
        })}
        description={
          <>
            <div>
              {t(`getnameValidation.diagnosis.${receipt.diagnosis}.description`, {
                defaultValue: "",
                origin: window.location.origin,
              })}
            </div>
            <p className="what-to-do">
              {t(`getnameValidation.diagnosis.${receipt.diagnosis}.action`, {
                defaultValue: "",
                origin: window.location.origin,
              })}
            </p>
            {OPEN_GETNAME_DIAGNOSES.includes(receipt.diagnosis) &&
              plan.baseUrl && (
                <a href={plan.baseUrl} target="_blank" rel="noreferrer">
                  {t("getnameValidation.openGetname")}
                </a>
              )}
          </>
        }
      />
    );
  };

  const renderSaved = () => {
    if (saveState === "saving") {
      return <p className="saved">{t("getnameValidation.saving")}</p>;
    }

    if (saveState === "saved") {
      return (
        <p className="saved" data-kb="getnameValidation.saved">
          {ticket
            ? t("getnameValidation.savedWithTicket", { ticket })
            : t("getnameValidation.savedWithoutTicket")}
        </p>
      );
    }

    if (saveState === "error") {
      return (
        <Alert
          className="notice"
          style={{ marginTop: 16 }}
          type="warning"
          showIcon
          title={t("getnameValidation.saveError")}
          action={
            <Button size="small" onClick={() => receipt && save(receipt)}>
              {t("getnameValidation.saveRetry")}
            </Button>
          }
        />
      );
    }

    return null;
  };

  const spent = plan?.maxRuns !== undefined && runs >= plan.maxRuns;

  return (
    <PageContainer>
      <div className="form">
        <Brand title="noHarm.ai" />

        <ValidationCard>
          <h1 data-kb="getnameValidation.title">
            {t("getnameValidation.pageTitle")}
          </h1>

          {phase === "loading" && (
            <p className="subtitle">
              <LoadingOutlined /> {t("getnameValidation.loading")}
            </p>
          )}

          {phase === "invalid" && (
            <Alert
              type="error"
              showIcon
              title={t("getnameValidation.invalid.title")}
              description={t(
                `getnameValidation.invalid.${plan?.reason ?? "unknown"}`,
              )}
            />
          )}

          {phase === "error" && (
            <Alert
              type="error"
              showIcon
              title={t("getnameValidation.loadError.title")}
              description={t("getnameValidation.loadError.description")}
            />
          )}

          {(phase === "ready" || phase === "running" || phase === "done") &&
            plan && (
              <>
                <p className="subtitle">{t("getnameValidation.subtitle")}</p>

                <dl className="target">
                  <dt>{t("getnameValidation.hospital")}</dt>
                  <dd>{plan.schema}</dd>
                  {plan.baseUrl && (
                    <>
                      <dt>{t("getnameValidation.address")}</dt>
                      <dd>{plan.baseUrl}</dd>
                    </>
                  )}
                  {plan.expiresAt && (
                    <>
                      <dt>{t("getnameValidation.expiresAt")}</dt>
                      <dd>
                        {new Date(plan.expiresAt).toLocaleString(i18n.language)}
                      </dd>
                    </>
                  )}
                </dl>

                {phase === "ready" && (
                  <Alert
                    className="notice"
                    type="info"
                    showIcon
                    title={t("getnameValidation.before.title")}
                    description={t("getnameValidation.before.description")}
                  />
                )}

                {permissionPrompt && (
                  <Alert
                    className="notice"
                    data-kb="getnameValidation.permissionPrompt"
                    type="warning"
                    showIcon
                    title={t("getnameValidation.permissionPrompt.title")}
                    description={t(
                      "getnameValidation.permissionPrompt.description",
                    )}
                  />
                )}

                {phase === "done" && renderVerdict()}

                {phase !== "ready" && renderChecks()}

                {phase === "done" && renderSaved()}

                <div className="actions">
                  {phase === "ready" && (
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={start}
                    >
                      {t("getnameValidation.start")}
                    </Button>
                  )}

                  {phase === "running" && (
                    <Button type="primary" loading>
                      {t("getnameValidation.running")}
                    </Button>
                  )}

                  {phase === "done" && (
                    <>
                      <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={start}
                        disabled={spent || saveState === "saving"}
                      >
                        {t("getnameValidation.again")}
                      </Button>
                      <Button icon={<CopyOutlined />} onClick={copyReceipt}>
                        {copied
                          ? t("getnameValidation.copied")
                          : t("getnameValidation.copy")}
                      </Button>
                    </>
                  )}
                </div>

                {phase === "done" && spent && (
                  <p className="saved">{t("getnameValidation.spent")}</p>
                )}
              </>
            )}
        </ValidationCard>
      </div>
    </PageContainer>
  );
}
