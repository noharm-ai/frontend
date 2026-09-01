import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { SafetyCertificateOutlined } from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { formatDate } from "utils/date";

import { CertificatePage } from "./TrainingCertificate.style";
// @ts-expect-error ts 2307 (legacy code)
import { NoHarmLogoHorizontal as Brand } from "assets/NoHarmLogoHorizontal";

interface ITrainingCertificate {
  userName: string;
  trainingId: number;
  trainingTitle: string;
  // whole hours; 0 means the module declares no workload
  totalHours: number;
  totalLessons: number;
  completedAt: string;
  // already grouped as XXXX-XXXX-XXXX by the backend
  validationCode: string;
}

interface TrainingCertificateProps {
  idTraining: number;
  label?: string;
}

export function TrainingCertificate({
  idTraining,
  label,
}: TrainingCertificateProps) {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<ITrainingCertificate | null>(
    null,
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: certificate
      ? `${t("trainingCertificate.title")} - ${certificate.trainingTitle}`
      : t("trainingCertificate.title"),
    pageStyle: "@page { size: A4 landscape; margin: 0; }",
  });

  useEffect(() => {
    if (certificate) {
      handlePrint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificate]);

  const generate = () => {
    setLoading(true);
    api.training
      .getCertificate(idTraining)
      .then((response: any) => {
        // always a fresh object, so re-printing the same module works
        setCertificate({ ...response.data.data });
      })
      .catch((error: any) => {
        // the backend envelope carries the translatable error code
        notification.error({
          message: getErrorMessage({ payload: error.response?.data }, t),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Button
        icon={<SafetyCertificateOutlined />}
        loading={loading}
        onClick={generate}
      >
        {label ?? t("trainingCertificate.button")}
      </Button>

      <CertificatePage ref={printRef}>
        {certificate && (
          <div className="certificate-frame">
            <div className="certificate-brand">
              <Brand />
            </div>

            <h1>{t("trainingCertificate.title")}</h1>

            <p className="certificate-certify">
              {t("trainingCertificate.certify")}
            </p>
            <p className="certificate-user">{certificate.userName}</p>

            <p className="certificate-certify">
              {t("trainingCertificate.completedModule")}
            </p>
            <p className="certificate-module">
              &ldquo;{certificate.trainingTitle}&rdquo;
            </p>

            {certificate.totalHours > 0 && (
              <p className="certificate-workload">
                {t("trainingCertificate.workload", {
                  count: certificate.totalHours,
                })}
              </p>
            )}

            <p className="certificate-summary">
              {t("trainingCertificate.summary", {
                count: certificate.totalLessons,
                date: formatDate(certificate.completedAt),
              })}
            </p>

            <div className="certificate-footer">
              <div>{t("trainingCertificate.footer")}</div>
              <div className="certificate-validation-code">
                {t("trainingCertificate.validationCode")}{" "}
                <strong>{certificate.validationCode}</strong>
              </div>
              <div className="certificate-validation-url">
                {t("trainingCertificate.validationHint")}{" "}
                {`${window.location.origin}/validar-certificado`}
              </div>
            </div>
          </div>
        )}
      </CertificatePage>
    </>
  );
}
