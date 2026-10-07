import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Flex, Progress, Radio } from "antd";
import { FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import slugify from "slugify";

import { useAppDispatch } from "src/store";
import Button from "src/components/Button";
import Modal from "src/components/Modal";
import notification from "src/components/notification";
import { downloadReport } from "src/features/reports/ReportsSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import { exportCSV } from "src/utils/report";
import { TrackedReport, trackReport } from "src/utils/tracker";
import { LoadResult } from "../patientNames/loadPatientNames";
import { enrichRowsWithNames } from "../patientNames/patientNames.utils";
import {
  ReportNames,
  usePatientNamesLoad,
} from "../patientNames/usePatientNamesLoad";
import { NamesLoadProgress } from "../NamesLoadProgress/NamesLoadProgress";

type Format = "csv" | "xlsx";
type Phase = "choose" | "loading" | "failed" | "generating";
type Row = Record<string, unknown>;

export interface ExportNames {
  report: ReportNames;
  /** Patient id column of the dataset. */
  idKey: string;
  /** Column the names are exported in, right after the id. */
  nameKey: string;
}

interface ExportReportProps {
  open: boolean;
  onClose: () => void;
  idReport: string;
  /** Report file date (yyyymmdd), the base name of the server files. */
  filename: string;
  title: string;
  /** The full dataset: exports never apply the screen filters. */
  rows: Row[];
  /** Present when the report can be exported with patient names. */
  names?: ExportNames;
  onExportingChange?: (exporting: boolean) => void;
}

const EXTENSION: Record<Format, string> = { csv: ".csv", xlsx: ".xlsx" };

// exportCSV translates headers as `${namespace}.${column}`; custom report
// columns keep their own names, so the "translation" drops the namespace
const COLUMN_NAMESPACE = "column";
const columnHeader = (path: string) =>
  path.slice(COLUMN_NAMESPACE.length + 1);

const EMPTY_REPORT: ReportNames = {
  ids: [],
  known: {},
  notFound: new Set(),
  onLoaded: () => undefined,
};

/**
 * Export of a custom report. Without names it downloads the file the server
 * generated. With names it is always a CSV, built in the browser by the
 * app's CSV export (in a web worker), after loading the missing names.
 */
export function ExportReport({
  open,
  onClose,
  idReport,
  filename,
  title,
  rows,
  names,
  onExportingChange,
}: ExportReportProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("choose");
  const [withNames, setWithNames] = useState<boolean | undefined>();
  const [toLoad, setToLoad] = useState(0);
  const [failure, setFailure] = useState<LoadResult | null>(null);
  const [generated, setGenerated] = useState(0);
  const [serverExporting, setServerExporting] = useState(false);
  const load = usePatientNamesLoad(names?.report ?? EMPTY_REPORT, "export");

  const busy = phase === "loading" || phase === "generating";
  const mustChoose = !!names && withNames === undefined;

  const reset = () => {
    setPhase("choose");
    setWithNames(undefined);
    setFailure(null);
  };

  const close = () => {
    if (busy || serverExporting) return;
    onClose();
  };

  const chooseNames = (value: boolean) => {
    setWithNames(value);
    if (value) {
      const plan = load.plan();
      setToLoad(plan.cached + plan.pending);
    }
  };

  const exportFromServer = (selected: Format) => {
    setServerExporting(true);
    onExportingChange?.(true);
    trackReport(TrackedReport.CUSTOM, {
      title: `exportar: ${title} - ${selected}`,
    });

    const formattedFilename = filename.includes(".")
      ? filename.replace(/\.[^/.]+$/, EXTENSION[selected])
      : filename + EXTENSION[selected];

    dispatch(
      // @ts-expect-error ts 2554 (legacy code)
      downloadReport({ idReport, filename: formattedFilename }),
    ).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else if (response.payload.data.data.url) {
        window.open(response.payload.data.data.url);
      }

      setServerExporting(false);
      onExportingChange?.(false);
      onClose();
    });
  };

  const exportWithNames = async (force = false) => {
    if (!names) return;
    setFailure(null);
    // the names known when the export was asked; a load below adds to them
    let known = names.report.known;

    if (toLoad > 0 && !force) {
      setPhase("loading");
      const result = await load.run();
      if (!result) return;

      if (result.cancelled) {
        setPhase("choose");
        return;
      }
      known = { ...known, ...result.names };
      if (!result.complete) {
        setFailure(result);
        setToLoad(result.failed + result.remaining);
        setPhase("failed");
        return;
      }
      setToLoad(0);
    }

    setPhase("generating");
    setGenerated(0);
    onExportingChange?.(true);

    try {
      const baseName = slugify(title || "relatorio", {
        lower: true,
        strict: true,
      });
      await exportCSV(
        enrichRowsWithNames(rows, names.idKey, names.nameKey, known),
        columnHeader,
        COLUMN_NAMESPACE,
        {
          filename: `${baseName}-${filename}-com-nomes.csv`,
          onProgress: ({ percentage }: { percentage: number }) =>
            setGenerated(percentage),
        },
      );

      trackReport(TrackedReport.CUSTOM, {
        title: `exportar: ${title} - csv - com nomes`,
      });
      onClose();
    } catch (error) {
      console.error(error);
      notification.error({ message: "Não foi possível gerar o arquivo." });
      setPhase("choose");
    } finally {
      onExportingChange?.(false);
    }
  };

  const exportAs = (selected: Format) => {
    if (names && withNames) {
      exportWithNames();
    } else {
      exportFromServer(selected);
    }
  };

  const footer = (() => {
    if (phase === "loading") {
      return [
        <Button key="stop" danger onClick={load.cancel}>
          Cancelar
        </Button>,
      ];
    }
    if (phase === "failed") {
      return [
        <Button key="retry" onClick={() => exportWithNames()}>
          Tentar novamente
        </Button>,
        <Button
          key="anyway"
          type="primary"
          onClick={() => exportWithNames(true)}
        >
          Exportar mesmo assim
        </Button>,
      ];
    }
    return null;
  })();

  const missingCount = failure ? failure.failed + failure.remaining : 0;

  return (
    <Modal
      title="Exportar relatório"
      open={open}
      onCancel={close}
      closable={!busy && !serverExporting}
      maskClosable={!busy && !serverExporting}
      keyboard={!busy && !serverExporting}
      afterClose={reset}
      footer={footer}
      destroyOnHidden
      width={460}
    >
      <div data-kb="reports.file.export">
        {phase === "choose" && (
          <>
            {names && (
              <Flex vertical gap={8} style={{ marginBottom: 16 }}>
                <strong>Nomes dos pacientes</strong>
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  value={withNames}
                  onChange={(e) => chooseNames(e.target.value)}
                  options={[
                    { label: "Sem nomes", value: false },
                    { label: "Com nomes", value: true },
                  ]}
                />
                {withNames && toLoad > 0 && (
                  <Alert
                    type="info"
                    showIcon
                    message={`Antes da exportação, serão carregados os nomes de ${toLoad.toLocaleString("pt-BR")} pacientes.`}
                  />
                )}
              </Flex>
            )}

            <strong>Formato</strong>
            <Flex justify="center" gap={20} style={{ padding: "16px 0" }}>
              <Button
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => exportAs("csv")}
                loading={serverExporting}
                disabled={mustChoose}
              >
                CSV
              </Button>
              {!withNames && (
                <Button
                  size="large"
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={() => exportAs("xlsx")}
                  loading={serverExporting}
                  disabled={mustChoose}
                >
                  XLSX
                </Button>
              )}
            </Flex>
            {mustChoose && (
              <p>Escolha se o arquivo terá os nomes dos pacientes.</p>
            )}
            {withNames && <p>*Com nomes, o arquivo é exportado em CSV.</p>}
            <p>
              *Os filtros não são aplicados no arquivo exportado. Ele sempre
              possui os dados completos.
            </p>
          </>
        )}

        {phase === "loading" && (
          <NamesLoadProgress
            current={load.progress.current}
            total={load.progress.total}
          />
        )}

        {phase === "failed" && (
          <Alert
            type="error"
            showIcon
            message={`Não foi possível buscar os nomes de ${missingCount.toLocaleString("pt-BR")} pacientes.`}
            description="Você pode tentar novamente ou exportar assim mesmo. Esses pacientes ficam sem nome no arquivo."
          />
        )}

        {phase === "generating" && (
          <Flex vertical gap={8} style={{ padding: "16px 0" }}>
            <span>Gerando arquivo...</span>
            <Progress percent={generated} showInfo={false} />
          </Flex>
        )}
      </div>
    </Modal>
  );
}
