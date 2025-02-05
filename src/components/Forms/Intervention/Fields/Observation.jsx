import React, { useEffect, useState } from "react";
import isEmpty from "lodash.isempty";
import { useTranslation } from "react-i18next";
import { SaveOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { Col } from "components/Grid";
import { Textarea } from "components/Inputs";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import notification from "components/notification";
import { ObservationDefaultText } from "./ObservationDefaultText";
import { formatDate } from "utils/date";

import { EditorBox } from "components/Forms/Form.style";

export default function Observations({
  content,
  setFieldValue,
  memory,
  fetchMemory,
  saveMemory,
  currentReason,
  drugData,
  interactions,
  interactionsList,
  uniqueDrugList,
}) {
  const { t } = useTranslation();
  const [saveTextModal, setSaveTextModal] = useState(false);
  const isMemoryDisabled = currentReason == null || currentReason.length !== 1;

  useEffect(() => {
    if (!isMemoryDisabled) {
      fetchMemory(`reasonsDefaultText-${currentReason[0]}`);
    }
  }, [fetchMemory, currentReason, isMemoryDisabled]);

  useEffect(() => {
    if (memory.save.success) {
      notification.success({ message: t("success.defaultObservation") });
    }
  }, [memory.save.success, t]);

  const applyVariables = (text) => {
    let newText = text;

    newText = newText.replaceAll("{{nome_medicamento}}", getDrugName());
    newText = newText.replaceAll(
      "{{nome_medicamento_substituto}}",
      getRelatedDrug()?.name ?? "(indefinido)"
    );
    newText = newText.replaceAll("{{data_atual}}", formatDate(dayjs()));

    return newText;
  };

  const getDrugName = () => {
    if (drugData.idPrescriptionDrugList) {
      return "Múltiplos medicamentos selecionados";
    }

    return drugData?.drug ?? "(indefinido)";
  };

  const getRelatedDrug = () => {
    let relatedDrugId = null;
    if (interactions && interactions.length > 0) {
      relatedDrugId = `${interactions[0]}`;
    } else {
      return null;
    }

    const normalizedList = (interactionsList ?? [])
      .concat(uniqueDrugList ?? [])
      .map((i) => ({
        ...i,
        idDrug: `${i.idDrug}`,
      }));

    return normalizedList.find((d) => d.idDrug === relatedDrugId);
  };

  const saveDefaultText = (value) => {
    const payload = {
      type: `reasonsDefaultText-${currentReason[0]}`,
      value: { text: value },
    };

    if (!isEmpty(memory.list)) {
      payload.id = memory.list[0].key;
    }
    saveMemory(payload);

    setFieldValue("observation", applyVariables(value));
    notification.success({ message: t("success.applyDefaultObservation") });
  };

  const loadDefaultText = () => {
    setFieldValue("observation", applyVariables(memory.list[0].value.text));
    notification.success({ message: t("success.applyDefaultObservation") });
  };

  const onEdit = (observation) => {
    setFieldValue("observation", observation);
  };

  const getMemoryTooltip = () => {
    const config = {
      save: t("interventionForm.btnModelSave"),
      apply: t("interventionForm.btnModelApply"),
    };

    if (currentReason && currentReason.length > 1) {
      const msg = t("interventionForm.btnModelInvalid");
      return {
        save: msg,
        apply: msg,
      };
    }

    if (isMemoryDisabled) {
      const msg = t("interventionForm.btnModelDisabled");
      return {
        save: msg,
        apply: msg,
      };
    }

    if (isEmpty(memory.list) || !content) {
      return {
        save: content ? config.save : t("interventionForm.btnModelSaveHint"),
        apply: !isEmpty(memory.list)
          ? config.apply
          : t("interventionForm.btnModelEmpty"),
      };
    }

    return config;
  };

  const memoryTooltip = getMemoryTooltip();

  return (
    <>
      <Col xs={20} style={{ alignSelf: "flex-end" }}>
        <Heading as="h4" htmlFor="reason" size="14px">
          {t("interventionForm.labelObservations")}:
        </Heading>
      </Col>
      <Col xs={4}>
        <div style={{ textAlign: "right" }}>
          <Tooltip title={memoryTooltip.save}>
            <Button
              shape="circle"
              icon={<SaveOutlined />}
              loading={memory.isFetching || memory.save.isSaving}
              onClick={() => setSaveTextModal(true)}
              disabled={isMemoryDisabled}
              style={{ marginRight: "5px" }}
              type="primary nda gtm-bt-interv-mem-save"
            />
          </Tooltip>
          <Tooltip title={memoryTooltip.apply}>
            <Button
              shape="circle"
              icon={<DownloadOutlined />}
              loading={memory.isFetching || memory.save.isSaving}
              onClick={loadDefaultText}
              disabled={isMemoryDisabled || isEmpty(memory.list)}
              className={
                !isEmpty(memory.list) ? "primary gtm-bt-interv-mem-apply" : ""
              }
              type="primary"
            />
          </Tooltip>
        </div>
      </Col>
      <Col xs={24}>
        <EditorBox>
          <Textarea
            autoFocus
            value={content || ""}
            onChange={({ target }) => onEdit(target.value)}
            style={{ minHeight: "200px", marginTop: "10px" }}
          />
        </EditorBox>
      </Col>

      <ObservationDefaultText
        open={saveTextModal}
        setOpen={setSaveTextModal}
        initialContent={
          memory.list && memory.list.length > 0 ? memory.list[0].value.text : ""
        }
        saveDefaultText={saveDefaultText}
      />
    </>
  );
}
