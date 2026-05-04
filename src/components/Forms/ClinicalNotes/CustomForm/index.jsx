import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CloseOutlined, HistoryOutlined } from "@ant-design/icons";
import { List, Drawer } from "antd";

import CustomForm from "components/Forms/CustomForm";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Badge from "components/Badge";
import Empty from "components/Empty";
import { saveEntry, getEntries } from "utils/clinicalNotesHistory";
import { formatDateTime } from "utils/date";

import ChooseForm from "./ChooseForm";
import { ChoicePanel } from "components/Forms/Form.style";

export default function ClinicalNotes({
  prescription,
  save,
  afterSave,
  fetchMemory,
  memory,
  visible,
  onCancel,
  ...props
}) {
  const [template, setTemplate] = useState(null);
  const [restoredValues, setRestoredValues] = useState(null);
  const [restorationKey, setRestorationKey] = useState(0);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState(() => getEntries());
  const debounceRef = useRef(null);
  const { t } = useTranslation();
  const { isSaving, data } = prescription;

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const onValuesChange = useCallback(
    (values) => {
      if (!template) return;
      const hasValue = Object.values(values).some(
        (v) =>
          v !== null &&
          v !== undefined &&
          !(typeof v === "string" && v.trim() === "") &&
          !(Array.isArray(v) && v.length === 0),
      );
      if (!hasValue) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveEntry({
          tplName: template.name,
          templateData: template.data,
          admissionNumber: data.admissionNumber,
          idPrescription: data.idPrescription,
          formValues: values,
        });
        setHistoryEntries(getEntries());
      }, 1500);
    },
    [template, data.admissionNumber, data.idPrescription],
  );

  const handleOpenHistory = useCallback(() => {
    setHistoryEntries(getEntries());
    setHistoryDrawerOpen(true);
  }, []);

  const admissionEntries = historyEntries.filter(
    (e) => e.admissionNumber === data.admissionNumber,
  );

  const handleRestoreEntry = useCallback((entry) => {
    setTemplate({ name: entry.tplName, data: entry.templateData });
    setRestoredValues(entry.formValues);
    setRestorationKey((k) => k + 1);
    setHistoryDrawerOpen(false);
  }, []);

  const submit = (form) => {
    const params = {
      idPrescription: data.idPrescription,
      admissionNumber: data.admissionNumber,
      formValues: form.values,
      template: form.template,
      tplName: template.name,
    };

    save(params)
      .then(() => {
        saveEntry({
          tplName: template.name,
          templateData: template.data,
          admissionNumber: data.admissionNumber,
          idPrescription: data.idPrescription,
          formValues: form.values,
        });
        notification.success({
          message: "Uhu! Evolução salva com sucesso! :)",
        });
        if (afterSave) {
          setTemplate(null);
          setRestoredValues(null);
          afterSave();
        }
      })
      .catch((err) => {
        console.error("error", err);
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  const cancel = () => {
    setTemplate(null);
    setRestoredValues(null);
    onCancel();
  };

  return (
    <>
      <DefaultModal
        width={700}
        centered
        destroyOnHidden
        open={visible}
        onCancel={cancel}
        maskClosable={false}
        {...props}
        footer={null}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 11,
            paddingRight: "30px",
          }}
        >
          <Heading $margin="0">Evolução</Heading>
          <Tooltip title="Histórico de preenchimentos">
            <Badge count={admissionEntries.length} size="small">
              <Button
                shape="circle"
                icon={<HistoryOutlined />}
                onClick={handleOpenHistory}
              />
            </Badge>
          </Tooltip>
        </header>
        <ChoicePanel>
          {!template ? (
            <>
              <div className="panel-title">Selecione o formulário:</div>
              <ChooseForm
                fetchMemory={fetchMemory}
                memory={memory}
                onChange={setTemplate}
              />
            </>
          ) : (
            <>
              <div className="panel-title">{template.name}</div>
              <Tooltip title="Alterar formulário">
                <Button
                  shape="circle"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setTemplate(null);
                    setRestoredValues(null);
                  }}
                />
              </Tooltip>
            </>
          )}
        </ChoicePanel>
        <CustomForm
          key={restorationKey}
          onSubmit={submit}
          onCancel={onCancel}
          isSaving={isSaving}
          template={template ? template.data : null}
          values={restoredValues}
          onValuesChange={onValuesChange}
        />
      </DefaultModal>

      <Drawer
        title="Histórico de preenchimentos"
        placement="right"
        width={420}
        onClose={() => setHistoryDrawerOpen(false)}
        open={historyDrawerOpen}
        destroyOnClose
      >
        {admissionEntries.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhum preenchimento salvo."
          />
        ) : (
          <List itemLayout="horizontal">
            {admissionEntries.map((entry) => (
              <List.Item
                key={entry.id}
                actions={[
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleRestoreEntry(entry)}
                  >
                    Restaurar
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={entry.tplName}
                  description={
                    <>
                      <div>Atendimento: {entry.admissionNumber}</div>
                      <div>
                        {formatDateTime(
                          new Date(entry.timestamp).toISOString(),
                        )}
                      </div>
                    </>
                  }
                />
              </List.Item>
            ))}
          </List>
        )}
      </Drawer>
    </>
  );
}
