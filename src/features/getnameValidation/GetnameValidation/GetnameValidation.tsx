import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Alert, Tag } from "antd";
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CopyOutlined,
  ExclamationCircleFilled,
  ExportOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";

import {
  CheckId,
  ICheck,
  IReceipt,
  IValidationPlan,
  Observation,
  observationOptions,
  receiptToText,
  runGetnameValidation,
  serverOf,
  watchPermissions,
} from "../getnameDiagnostics";
import {
  Brand,
  CheckIcon,
  CheckList,
  Guide,
  PageContainer,
  Resolution,
  ValidationCard,
} from "./GetnameValidation.style";

type Phase = "loading" | "invalid" | "error" | "ready" | "running" | "done";
type SaveState = "idle" | "saving" | "saved" | "error";
type Owner = "you" | "it" | "noharm";

// every step the test can run, in the order it runs them
const CHECK_ORDER: CheckId[] = [
  "config",
  "environment",
  "manual",
  "reachability",
  "health",
  "database",
  "auth_config",
  "lookup",
];

// Who has to act on each diagnosis. The person in front of the page is told
// to do something only when it is theirs to do; what the NoHarm team fixes
// already reached it with the saved result.
const OWNERS: Record<string, Owner> = {
  legacy_version: "noharm",
  certificate_accepted: "noharm",
  not_configured: "noharm",
  mixed_content: "noharm",
  local_network_denied: "you",
  unreachable_timeout: "it",
  unreachable: "you",
  certificate: "noharm",
  connection_refused: "noharm",
  dns: "it",
  blocked_by_browser: "you",
  cors: "noharm",
  http_error: "noharm",
  unhealthy_database: "noharm",
  auth_mismatch: "noharm",
  auth_secret_mismatch: "noharm",
  lookup_error: "noharm",
};

const OWNER_COLORS: Record<Owner, string> = {
  you: "gold",
  it: "blue",
  noharm: "green",
};

// diagnoses with something for who runs the hospital's network: the page
// writes the message, with the server and the port, ready to be sent
const IT_MESSAGE_DIAGNOSES = [
  "local_network_denied",
  "unreachable_timeout",
  "connection_refused",
  "dns",
  "blocked_by_browser",
  "unhealthy_database",
];

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
  const [copied, setCopied] = useState<"receipt" | "it" | null>(null);
  // the getname was opened in a tab of its own (guided step of "unreachable")
  const [opened, setOpened] = useState(false);

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

  const start = async (observation?: Observation) => {
    if (!plan || !token) return;

    setPhase("running");
    setChecks([]);
    setReceipt(null);
    setPermissionPrompt(false);
    setSaveState("idle");
    setCopied(null);
    setOpened(false);

    const result = await runGetnameValidation(plan, {
      observation,
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

  const spent = plan?.maxRuns !== undefined && runs >= plan.maxRuns;
  const canRetest = phase === "done" && !spent && saveState !== "saving";

  // the person was told to allow the local network in the site settings: the
  // test starts again by itself when the browser reports the change
  const retest = useRef<() => void>(() => {});
  useEffect(() => {
    retest.current = () => {
      if (canRetest) start();
    };
  });
  const blockedByPermission =
    phase === "done" && receipt?.diagnosis === "local_network_denied";
  useEffect(() => {
    if (!blockedByPermission) return;

    return watchPermissions(() => retest.current());
  }, [blockedByPermission]);

  const copy = (text: string, kind: "receipt" | "it") => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => setCopied(kind))
      .catch(() => setCopied(null));
  };

  // host, port and origin, for the texts that name them
  const context = () => ({
    origin: window.location.origin,
    host: (plan && serverOf(plan)?.host) ?? "",
    port: (plan && serverOf(plan)?.port) ?? "",
    protocol: (plan && serverOf(plan)?.protocol) ?? "",
  });

  const itMessage = (diagnosis: string) =>
    t("getnameValidation.itMessage.body", {
      ...context(),
      problem: t(`getnameValidation.it.${diagnosis}.problem`, context()),
      request: t(`getnameValidation.it.${diagnosis}.request`, context()),
      date: new Date().toLocaleString(i18n.language),
      ticketLine: ticket
        ? t("getnameValidation.itMessage.ticketLine", { ticket })
        : "",
    });

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
      (id) => done.has(id) || (phase === "running" && id !== "manual"),
    );

    return (
      <CheckList data-kb="getnameValidation.checks">
        {visible.map((id) => {
          const check = done.get(id);
          const status =
            check?.status ?? (running === id ? "running" : "pending");

          return (
            <li key={id} data-check={id} data-status={status}>
              <CheckIcon $status={status}>{STATUS_ICONS[status]}</CheckIcon>
              <span className="check-label">
                {t(`getnameValidation.checks.${id}`)}
              </span>
              <span className="check-time">
                {check?.durationMs !== undefined
                  ? `${check.durationMs} ms`
                  : ""}
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

  // "unreachable": the browser hides the reason from the page and shows it in
  // a tab. Two clicks: open the getname, say what showed up; the test runs
  // again with the answer, which names the cause and goes with the receipt
  const renderGuide = () => {
    if (!plan?.baseUrl) return null;

    return (
      <Guide data-kb="getnameValidation.guide">
        <div className="guide-step">
          <span className="guide-number">1</span>
          {t("getnameValidation.guide.step1")}
        </div>
        <Button
          type="primary"
          icon={<ExportOutlined />}
          href={plan.baseUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => setOpened(true)}
        >
          {t("getnameValidation.guide.open")}
        </Button>

        <div className="guide-step">
          <span className="guide-number">2</span>
          {t("getnameValidation.guide.step2")}
        </div>
        <div className="guide-options">
          {observationOptions(plan).map((option) => (
            <button
              key={option}
              type="button"
              className="guide-option"
              data-observation={option}
              disabled={!opened || !canRetest}
              onClick={() => start(option)}
            >
              <span className="guide-option-label">
                {t(`getnameValidation.guide.options.${option}.label`)}
              </span>
              <span className="guide-option-hint">
                {t(`getnameValidation.guide.options.${option}.hint`)}
              </span>
            </button>
          ))}
        </div>
        <p className="guide-note">{t("getnameValidation.guide.afterAnswer")}</p>
      </Guide>
    );
  };

  const renderResolution = (diagnosis: string) => {
    const owner = OWNERS[diagnosis];
    const steps = t(`getnameValidation.diagnosis.${diagnosis}.steps`, {
      ...context(),
      returnObjects: true,
      defaultValue: [],
    }) as string[];

    if (!owner) return null;

    return (
      <Resolution data-owner={owner}>
        <div className="owner">
          {t("getnameValidation.owner.label")}:
          <Tag color={OWNER_COLORS[owner]}>
            {t(`getnameValidation.owner.${owner}`)}
          </Tag>
        </div>

        {owner === "noharm" && (
          <p className="owner-notice">
            {saveState === "saved"
              ? ticket
                ? t("getnameValidation.noharm.saved", { ticket })
                : t("getnameValidation.noharm.savedNoTicket")
              : saveState === "error"
                ? t("getnameValidation.noharm.unsaved")
                : t("getnameValidation.saving")}
          </p>
        )}

        {/* a single step is a remark, not a sequence */}
        {Array.isArray(steps) && steps.length === 1 && (
          <p className="owner-notice">{steps[0]}</p>
        )}
        {Array.isArray(steps) && steps.length > 1 && (
          <ol>
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}

        {diagnosis === "unreachable" && renderGuide()}

        {IT_MESSAGE_DIAGNOSES.includes(diagnosis) && (
          <div className="resolution-actions">
            <Button
              icon={<CopyOutlined />}
              data-kb="getnameValidation.itMessage"
              onClick={() => copy(itMessage(diagnosis), "it")}
            >
              {copied === "it"
                ? t("getnameValidation.itMessage.copied")
                : t("getnameValidation.itMessage.button")}
            </Button>
          </div>
        )}
      </Resolution>
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
          ...context(),
          defaultValue: receipt.diagnosis,
        })}
        description={
          <>
            <div>
              {t(
                `getnameValidation.diagnosis.${receipt.diagnosis}.description`,
                { ...context(), defaultValue: "" },
              )}
            </div>
            {renderResolution(receipt.diagnosis)}
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

  return (
    <PageContainer>
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
                    onClick={() => start()}
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
                      type={
                        receipt?.diagnosis === "unreachable"
                          ? "default"
                          : "primary"
                      }
                      icon={<ReloadOutlined />}
                      onClick={() => start()}
                      disabled={!canRetest}
                    >
                      {t("getnameValidation.again")}
                    </Button>
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() =>
                        plan &&
                        receipt &&
                        copy(receiptToText(plan, receipt, ticket), "receipt")
                      }
                    >
                      {copied === "receipt"
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
    </PageContainer>
  );
}
