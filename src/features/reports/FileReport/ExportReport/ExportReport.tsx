import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Flex, Radio, Spin } from "antd";
import { FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import slugify from "slugify";

import { useAppDispatch } from "src/store";
import Button from "src/components/Button";
import Modal from "src/components/Modal";
import notification from "src/components/notification";
import { downloadReport } from "src/features/reports/ReportsSlice";
import { getErrorMessage } from "src/utils/errorHandler";
import { TrackedReport, trackReport } from "src/utils/tracker";
import {
  LoadAllResult,
  PatientNameStore,
} from "../patientNames/patientNameStore";
import { usePatientNamesLoad } from "../patientNames/usePatientNamesLoad";
import { NamesLoadProgress } from "../NamesLoadProgress/NamesLoadProgress";
import {
  buildCsv,
  buildXlsx,
  downloadBlob,
  ExportColumn,
} from "./exportFile";

type Format = "csv" | "xlsx";
type Phase = "choose" | "loading" | "failed" | "generating";
type Row = Record<string, unknown>;

export interface ExportNames {
  store: PatientNameStore;
  /** Patient id column of the dataset. */
  idKey: string;
  /** Column the names are exported in, right after the id. */
  nameKey: string;
  allLoaded: boolean;
  onFinished: (result: { complete: boolean }) => void;
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

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Dataset columns, with the name column right after the patient id. */
const columnsWithNames = (
  rows: Row[],
  { idKey, nameKey }: ExportNames,
  names: Record<string, string>,
): ExportColumn[] => {
  const columns: ExportColumn[] = [];

  Object.keys(rows[0] ?? {}).forEach((key) => {
    columns.push({ key, value: (row) => row[key] });
    if (key === idKey) {
      columns.push({
        key: nameKey,
        value: (row) => {
          const id = row[idKey];
          return id === null || id === undefined ? null : names[String(id)];
        },
      });
    }
  });

  return columns;
};

/**
 * Export of a custom report. Without names it downloads the file the server
 * generated; with names the file is built in the browser, after loading the
 * names that are still missing.
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
  const [format, setFormat] = useState<Format>("xlsx");
  const [failure, setFailure] = useState<LoadAllResult | null>(null);
  const [serverExporting, setServerExporting] = useState(false);
  const load = usePatientNamesLoad(names?.store ?? null, {
    onFinished: (result) => names?.onFinished(result),
    source: "export",
  });

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
    if (value && names && !names.allLoaded) {
      const plan = names.store.plan();
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

  const exportWithNames = async (selected: Format, force = false) => {
    if (!names) return;
    setFormat(selected);
    setFailure(null);

    if (!names.allLoaded && !force) {
      setPhase("loading");
      const result = await load.run();
      if (!result) return;

      if (result.cancelled) {
        setPhase("choose");
        return;
      }
      if (!result.complete) {
        setFailure(result);
        setPhase("failed");
        return;
      }
    }

    setPhase("generating");
    onExportingChange?.(true);
    await nextFrame();

    try {
      const columns = columnsWithNames(rows, names, names.store.getNames());
      const blob =
        selected === "csv"
          ? await buildCsv(rows, columns)
          : await buildXlsx(rows, columns, title);

      const baseName = slugify(title || "relatorio", {
        lower: true,
        strict: true,
      });
      downloadBlob(blob, `${baseName}-${filename}-com-nomes${EXTENSION[selected]}`);

      trackReport(TrackedReport.CUSTOM, {
        title: `exportar: ${title} - ${selected} - com nomes`,
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
      exportWithNames(selected);
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
        <Button key="retry" onClick={() => exportWithNames(format)}>
          Tentar novamente
        </Button>,
        <Button
          key="anyway"
          type="primary"
          onClick={() => exportWithNames(format, true)}
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
                {withNames && !names.allLoaded && (
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
            </Flex>
            {mustChoose && (
              <p>Escolha se o arquivo terá os nomes dos pacientes.</p>
            )}
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
          <Flex vertical align="center" gap={12} style={{ padding: "24px 0" }}>
            <Spin />
            <span>Gerando arquivo...</span>
          </Flex>
        )}
      </div>
    </Modal>
  );
}
