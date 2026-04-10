import { motion } from "motion/react";
import { Alert, Divider, Space, Upload, notification } from "antd";
import type { RadioChangeEvent } from "antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { Input, Radio, Textarea } from "components/Inputs";
import Button from "components/Button";

import {
  ReportsSection,
  ColumnBuilderRow,
  ColumnBuilderHeader,
} from "./ReportsForm.style";

interface IColumn {
  name: string;
  example: string;
}

interface IReportFields {
  requestType: "novo" | "erro" | "duvida" | "alteracao" | null;
  objective: string | null;
  similarReport: "sim" | "nao" | null;
  similarReportName: string | null;
  similarReportDiff: string | null;
  periodPreset: "24h" | "7dias" | "30dias" | "outro" | null;
  period: string | null;
  extraFilters: string | null;
  columns: IColumn[];
  reportName: string | null;
  errorDescription: string | null;
  question: string | null;
  changeDescription: string | null;
  changeReason: string | null;
  additionalInfo: string | null;
}

interface IFormValues {
  reportFields: IReportFields;
  fileList: File[];
}

const ENTER_ANIM = {
  initial: { opacity: 0, transform: "translate3d(0, 10px, 0)" },
  animate: { opacity: 1, transform: "translate3d(0, 0, 0)" },
  transition: { duration: 0.3, ease: "easeOut" },
};

const BLANK_FIELDS: IReportFields = {
  requestType: null,
  objective: null,
  similarReport: null,
  similarReportName: null,
  similarReportDiff: null,
  periodPreset: null,
  period: null,
  extraFilters: null,
  columns: [],
  reportName: null,
  errorDescription: null,
  question: null,
  changeDescription: null,
  changeReason: null,
  additionalInfo: null,
};

function ColumnBuilder() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<IFormValues>();
  const columns: IColumn[] = values.reportFields.columns ?? [];

  const addColumn = () =>
    setFieldValue("reportFields.columns", [
      ...columns,
      { name: "", example: "" },
    ]);

  const removeColumn = (idx: number) =>
    setFieldValue(
      "reportFields.columns",
      columns.filter((_, i) => i !== idx)
    );

  const updateColumn = (idx: number, field: keyof IColumn, value: string) =>
    setFieldValue(
      "reportFields.columns",
      columns.map((col, i) => (i === idx ? { ...col, [field]: value } : col))
    );

  return (
    <div>
      {columns.length > 0 && (
        <ColumnBuilderHeader>
          <span>{t("support.reports.novo.columnName")}</span>
          <span>{t("support.reports.novo.columnExample")}</span>
          <span />
        </ColumnBuilderHeader>
      )}
      {columns.map((col, idx) => (
        <ColumnBuilderRow key={idx}>
          <Input
            value={col.name}
            placeholder={t("support.reports.novo.columnName")}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
              updateColumn(idx, "name", target.value)
            }
          />
          <Input
            value={col.example}
            placeholder={t("support.reports.novo.columnExample")}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
              updateColumn(idx, "example", target.value)
            }
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeColumn(idx)}
            size="small"
          >
            {t("support.reports.novo.removeColumn")}
          </Button>
        </ColumnBuilderRow>
      ))}
      <Button
        icon={<PlusOutlined />}
        onClick={addColumn}
        type="dashed"
        block
        style={{ marginTop: columns.length > 0 ? 4 : 0 }}
      >
        {t("support.reports.novo.addColumn")}
      </Button>
    </div>
  );
}

function PrintUploadField() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<IFormValues>();
  const fileList = values.fileList ?? [];

  const uploadProps = {
    onRemove: (file: File) => {
      const index = fileList.indexOf(file);
      const next = fileList.slice();
      next.splice(index, 1);
      setFieldValue("fileList", next);
    },
    beforeUpload: (file: File) => {
      if (fileList.length >= 2) {
        notification.error({ message: "Máximo de arquivos anexos atingido." });
      } else {
        setFieldValue("fileList", [...fileList, file]);
      }
      return false;
    },
    listType: "picture" as const,
    multiple: true,
    accept: "image/*",
    fileList,
  };

  return (
    <div className="form-row">
      <div className="form-label">
        <label>{t("support.reports.printRequest")}:</label>
      </div>
      <div className="form-input">
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>
            {t("support.reports.printUploadButton")}
          </Button>
        </Upload>
      </div>
    </div>
  );
}

export function ReportsForm() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<IFormValues>();
  const rf = values.reportFields;

  const set = (field: string, value: unknown) =>
    setFieldValue(`reportFields.${field}`, value);

  const handleRequestTypeChange = (value: string) => {
    setFieldValue("reportFields", { ...BLANK_FIELDS, requestType: value });
  };

  return (
    <ReportsSection>
      <Alert
        type="warning"
        showIcon
        message={t("support.reports.alertMessage")}
        style={{ marginBottom: 16 }}
      />

      <div className="form-row">
        <div className="form-label">
          <label>{t("support.reports.requestType")}:</label>
        </div>
        <div className="form-input">
          <Radio.Group
            value={rf.requestType}
            onChange={(e: RadioChangeEvent) =>
              handleRequestTypeChange(e.target.value)
            }
          >
            <Space direction="vertical">
              <Radio value="novo">
                {t("support.reports.requestTypeOptions.novo")}
              </Radio>
              <Radio value="erro">
                {t("support.reports.requestTypeOptions.erro")}
              </Radio>
              <Radio value="duvida">
                {t("support.reports.requestTypeOptions.duvida")}
              </Radio>
              <Radio value="alteracao">
                {t("support.reports.requestTypeOptions.alteracao")}
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      </div>

      {rf.requestType === "novo" && (
        <motion.div key="report-novo" {...ENTER_ANIM}>
          <Divider />

          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.novo.objective")}:</label>
            </div>
            <div className="form-input">
              <Textarea
                value={rf.objective ?? ""}
                onChange={({
                  target,
                }: React.ChangeEvent<HTMLTextAreaElement>) =>
                  set("objective", target.value)
                }
                rows={3}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.novo.similarReport")}:</label>
            </div>
            <div className="form-input">
              <Radio.Group
                value={rf.similarReport}
                onChange={(e: RadioChangeEvent) =>
                  set("similarReport", e.target.value)
                }
              >
                <Radio value="sim">{t("labels.yes")}</Radio>
                <Radio value="nao">{t("labels.no")}</Radio>
              </Radio.Group>
            </div>
          </div>

          {rf.similarReport === "sim" && (
            <motion.div key="similar-detail" {...ENTER_ANIM}>
              <div className="form-row">
                <div className="form-label">
                  <label>{t("support.reports.novo.similarReportName")}:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={rf.similarReportName ?? ""}
                    onChange={({
                      target,
                    }: React.ChangeEvent<HTMLInputElement>) =>
                      set("similarReportName", target.value)
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-label">
                  <label>{t("support.reports.novo.similarReportDiff")}:</label>
                </div>
                <div className="form-input">
                  <Textarea
                    value={rf.similarReportDiff ?? ""}
                    onChange={({
                      target,
                    }: React.ChangeEvent<HTMLTextAreaElement>) =>
                      set("similarReportDiff", target.value)
                    }
                    rows={3}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.novo.period")}:</label>
            </div>
            <div className="form-input">
              <Radio.Group
                value={rf.periodPreset}
                onChange={(e: RadioChangeEvent) => {
                  set("periodPreset", e.target.value);
                  if (e.target.value !== "outro") {
                    set("period", e.target.value);
                  } else {
                    set("period", null);
                  }
                }}
              >
                <Space direction="vertical">
                  <Radio value="24h">24h</Radio>
                  <Radio value="7dias">7 {t("support.reports.novo.periodDays")}</Radio>
                  <Radio value="30dias">30 {t("support.reports.novo.periodDays")}</Radio>
                  <Radio value="outro">{t("support.reports.novo.periodOther")}</Radio>
                </Space>
              </Radio.Group>
              {rf.periodPreset === "outro" && (
                <motion.div
                  key="period-custom"
                  {...ENTER_ANIM}
                  style={{ marginTop: 8 }}
                >
                  <Input
                    value={rf.period ?? ""}
                    placeholder={t("support.reports.novo.periodOtherPlaceholder")}
                    onChange={({
                      target,
                    }: React.ChangeEvent<HTMLInputElement>) =>
                      set("period", target.value)
                    }
                  />
                </motion.div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.novo.extraFilters")}:</label>
            </div>
            <div className="form-input">
              <Textarea
                value={rf.extraFilters ?? ""}
                onChange={({
                  target,
                }: React.ChangeEvent<HTMLTextAreaElement>) =>
                  set("extraFilters", target.value)
                }
                rows={2}
              />
            </div>
          </div>

          <Divider style={{ fontSize: "13px" }}>
            {t("support.reports.novo.columnsTitle")}
          </Divider>
          <div className="form-info" style={{ marginBottom: 12 }}>
            {t("support.reports.novo.columnsDescription")}
          </div>
          <ColumnBuilder />
        </motion.div>
      )}

      {rf.requestType === "erro" && (
        <motion.div key="report-erro" {...ENTER_ANIM}>
          <Divider />
          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.erro.reportName")}:</label>
            </div>
            <div className="form-input">
              <Input
                value={rf.reportName ?? ""}
                onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                  set("reportName", target.value)
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.erro.errorDescription")}:</label>
            </div>
            <div className="form-input">
              <Textarea
                value={rf.errorDescription ?? ""}
                onChange={({
                  target,
                }: React.ChangeEvent<HTMLTextAreaElement>) =>
                  set("errorDescription", target.value)
                }
                rows={4}
              />
            </div>
          </div>
          <PrintUploadField />
        </motion.div>
      )}

      {rf.requestType === "duvida" && (
        <motion.div key="report-duvida" {...ENTER_ANIM}>
          <Divider />
          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.duvida.reportName")}:</label>
            </div>
            <div className="form-input">
              <Input
                value={rf.reportName ?? ""}
                onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                  set("reportName", target.value)
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.duvida.question")}:</label>
            </div>
            <div className="form-input">
              <Textarea
                value={rf.question ?? ""}
                onChange={({
                  target,
                }: React.ChangeEvent<HTMLTextAreaElement>) =>
                  set("question", target.value)
                }
                rows={4}
              />
            </div>
          </div>
        </motion.div>
      )}

      {rf.requestType === "alteracao" && (
        <motion.div key="report-alteracao" {...ENTER_ANIM}>
          <Divider />
          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.alteracao.reportName")}:</label>
            </div>
            <div className="form-input">
              <Input
                value={rf.reportName ?? ""}
                onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                  set("reportName", target.value)
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.alteracao.changeDescription")}:</label>
            </div>
            <div className="form-input">
              <Textarea
                value={rf.changeDescription ?? ""}
                onChange={({
                  target,
                }: React.ChangeEvent<HTMLTextAreaElement>) =>
                  set("changeDescription", target.value)
                }
                rows={3}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.alteracao.changeReason")}:</label>
            </div>
            <div className="form-input">
              <Textarea
                value={rf.changeReason ?? ""}
                onChange={({
                  target,
                }: React.ChangeEvent<HTMLTextAreaElement>) =>
                  set("changeReason", target.value)
                }
                rows={3}
              />
            </div>
          </div>
          <PrintUploadField />
        </motion.div>
      )}

      {rf.requestType && (
        <motion.div key="additional-info" {...ENTER_ANIM}>
          <Divider />
          <div className="form-row">
            <div className="form-label">
              <label>{t("support.reports.additionalInfo")}:</label>
            </div>
            <div className="form-input">
              <Textarea
                value={rf.additionalInfo ?? ""}
                onChange={({
                  target,
                }: React.ChangeEvent<HTMLTextAreaElement>) =>
                  set("additionalInfo", target.value)
                }
                rows={3}
                placeholder={t("support.reports.additionalInfoPlaceholder")}
              />
            </div>
          </div>
        </motion.div>
      )}
    </ReportsSection>
  );
}
