import React, { useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { Button as AntButton } from "antd";
import {
  SaveOutlined,
  DownloadOutlined,
  SignatureOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { Col } from "components/Grid";
import { Textarea } from "components/Inputs";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import Button from "components/Button";
import notification from "components/notification";
import { ObservationDefaultText } from "./ObservationDefaultText";
import Dropdown from "components/Dropdown";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import stripHtml from "utils/stripHtml";
import { formatDate } from "utils/date";
import {
  trackInterventionAction,
  TrackedInterventionAction,
} from "src/utils/tracker";

import { EditorBox } from "components/Forms/Form.style";
import { useSlashMenu } from "components/SlashMenu/SlashMenu";

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
  const textareaRef = useRef(null);
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

  const getAlerts = (type = null, level = null) => {
    const alerts = drugData.alertsComplete;
    if (!alerts || !alerts.length) return "Nenhum alerta registrado";

    const filtered = alerts.filter((a) => {
      if (type && a.type !== type) return false;
      if (level && a.level !== level) return false;
      return true;
    });

    if (!filtered.length) return "Nenhum alerta registrado";

    const seen = new Set();
    return filtered
      .filter((a) => {
        if (seen.has(a.text)) return false;
        seen.add(a.text);
        return true;
      })
      .map((a) => `- ${stripHtml(a.text)}`)
      .join("\n");
  };

  const buildVariableMenuItems = () => {
    const items = [];

    items.push({ key: "var_data_atual", label: "Data atual" });
    items.push({ key: "var_medicamento", label: "Medicamento" });

    if (getRelatedDrug()) {
      items.push({
        key: "var_medicamento_substituto",
        label: "Med. substituto/relacionado",
      });
    }

    const alertChildren = [];

    if (getAlerts() !== "Nenhum alerta registrado") {
      alertChildren.push({ key: "alert_all", label: "Todos" });
    }

    const levels = [
      { key: "alert_level_low", label: "Nível baixo" },
      { key: "alert_level_medium", label: "Nível médio" },
      { key: "alert_level_high", label: "Nível alto" },
    ].filter((l) => {
      const level = l.key.replace("alert_level_", "");
      return getAlerts(null, level) !== "Nenhum alerta registrado";
    });

    if (levels.length) {
      alertChildren.push({
        key: "alert_nivel",
        label: "Por nível",
        children: levels,
      });
    }

    const types = DrugAlertTypeEnum.getAlertTypes(t)
      .filter((a) => getAlerts(a.id) !== "Nenhum alerta registrado")
      .map((a) => ({ key: `alert_type_${a.id}`, label: a.label }));

    if (types.length) {
      alertChildren.push({
        key: "alert_tipo",
        label: "Por tipo",
        children: types,
      });
    }

    if (alertChildren.length) {
      items.push({ key: "alertas", label: "Alertas", children: alertChildren });
    }

    return items;
  };

  const { onTextChange, onKeyDown, portal } = useSlashMenu({
    textareaRef,
    items: buildVariableMenuItems(),
    onSelect: ({ key, slashIndex }) => {
      const text = resolveVariable(key);
      const cur = content || "";
      setFieldValue(
        "observation",
        cur.substring(0, slashIndex) + text + cur.substring(slashIndex + 1),
      );
    },
  });

  const resolveVariable = (key) => {
    if (key === "var_data_atual") return formatDate(dayjs());
    if (key === "var_medicamento") return getDrugName();
    if (key === "var_medicamento_substituto")
      return getRelatedDrug()?.name ?? "(indefinido)";
    if (key === "alert_all") return getAlerts();
    if (key.startsWith("alert_type_"))
      return getAlerts(key.replace("alert_type_", ""));
    if (key.startsWith("alert_level_"))
      return getAlerts(null, key.replace("alert_level_", ""));
    return "";
  };

  const onApplyVariable = ({ key }) => {
    const text = resolveVariable(key);
    const newContent = content ? `${content}\n${text}` : text;
    setFieldValue("observation", newContent);
  };

  const handleTextChange = ({ target }) => {
    onTextChange(target);
    onEdit(target.value);
  };

  const applyVariables = (text) => {
    let newText = text;

    newText = newText.replaceAll("{{nome_medicamento}}", getDrugName());
    newText = newText.replaceAll(
      "{{nome_medicamento_substituto}}",
      getRelatedDrug()?.name ?? "(indefinido)",
    );
    newText = newText.replaceAll("{{data_atual}}", formatDate(dayjs()));
    newText = newText.replaceAll("{{alertas}}", getAlerts());

    const typeVars = newText.match(/\{\{(alerta_tipo.*?)\}\}/g);
    if (typeVars) {
      typeVars.forEach((item) => {
        const type = item.replace("{{", "").replace("}}", "").split(".")[1];
        newText = newText.replace(item, getAlerts(type));
      });
    }

    const levelVars = newText.match(/\{\{(alerta_nivel.*?)\}\}/g);
    if (levelVars) {
      levelVars.forEach((item) => {
        const level = item.replace("{{", "").replace("}}", "").split(".")[1];
        newText = newText.replace(item, getAlerts(null, level));
      });
    }

    return newText;
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

    trackInterventionAction(TrackedInterventionAction.SAVE_DEFAULT_TEXT);
  };

  const loadDefaultText = () => {
    setFieldValue("observation", applyVariables(memory.list[0].value.text));
    notification.success({ message: t("success.applyDefaultObservation") });

    trackInterventionAction(TrackedInterventionAction.LOAD_DEFAULT_TEXT);
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
      <Col xs={16} style={{ alignSelf: "flex-end" }}>
        <Heading as="h4" htmlFor="reason" $size="14px">
          {t("interventionForm.labelObservations")}:
        </Heading>
      </Col>
      <Col xs={8}>
        <div style={{ textAlign: "right" }}>
          <Tooltip title={memoryTooltip.save}>
            <Button
              shape="circle"
              icon={<SaveOutlined />}
              loading={memory.isFetching || memory.save.isSaving}
              onClick={() => setSaveTextModal(true)}
              disabled={isMemoryDisabled}
              style={{ marginRight: "5px" }}
              type="primary"
              className="gtm-bt-interv-mem-save"
            />
          </Tooltip>
          <Tooltip title={memoryTooltip.apply}>
            <Button
              shape="circle"
              icon={<DownloadOutlined />}
              loading={memory.isFetching || memory.save.isSaving}
              onClick={loadDefaultText}
              disabled={isMemoryDisabled || isEmpty(memory.list)}
              style={{ marginRight: "5px" }}
              className={
                !isEmpty(memory.list) ? "primary gtm-bt-interv-mem-apply" : ""
              }
              type="primary"
            />
          </Tooltip>
          <Tooltip title={t("interventionForm.btnInsertVariable")}>
            <Dropdown
              menu={{
                items: buildVariableMenuItems(),
                onClick: onApplyVariable,
              }}
              trigger={["click"]}
            >
              <AntButton
                shape="circle"
                icon={<SignatureOutlined />}
                type="primary"
              />
            </Dropdown>
          </Tooltip>
        </div>
      </Col>
      <Col xs={24}>
        <EditorBox>
          <Textarea
            autoFocus
            ref={textareaRef}
            value={content || ""}
            onChange={handleTextChange}
            onKeyDown={onKeyDown}
            style={{ minHeight: "200px", marginTop: "10px" }}
          />
          {portal}
        </EditorBox>
        <div style={{ marginTop: "4px", fontSize: "12px", color: "#aaa" }}>
          {t("interventionForm.slashMenuHint")}
        </div>
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
