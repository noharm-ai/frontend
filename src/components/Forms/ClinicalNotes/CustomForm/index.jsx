import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CloseOutlined } from "@ant-design/icons";

import CustomForm from "components/Forms/CustomForm";
import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";
import Button from "components/Button";
import Tooltip from "components/Tooltip";

import ChooseForm from "./ChooseForm";
import { ChoicePanel } from "components/Forms/Form.style";

export default function ClinicalNotes({
  prescription,
  save,
  afterSave,
  account,
  signature,
  action,
  fetchMemory,
  memory,
  visible,
  type,
  onCancel,
  ...props
}) {
  const [template, setTemplate] = useState(null);
  const { t } = useTranslation();
  const { isSaving, data } = prescription;

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
        notification.success({
          message: "Uhu! Evolução salva com sucesso! :)",
        });
        if (afterSave) {
          setTemplate(null);
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
    onCancel();
  };

  return (
    <DefaultModal
      width={700}
      centered
      destroyOnClose
      visible={visible}
      onCancel={cancel}
      maskClosable={false}
      {...props}
      footer={null}
    >
      <header>
        <Heading margin="0 0 11px">Evolução</Heading>
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
                onClick={() => setTemplate(null)}
              />
            </Tooltip>
          </>
        )}
      </ChoicePanel>
      <CustomForm
        onSubmit={submit}
        onCancel={onCancel}
        isSaving={isSaving}
        template={template ? template.data : null}
      />
    </DefaultModal>
  );
}
