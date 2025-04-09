import "styled-components";
import React from "react";
import { isEmpty } from "lodash";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { Col } from "components/Grid";
import { Select } from "components/Inputs";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import Switch from "components/Switch";

import Interaction from "./Fields/Interaction";
import Observation from "./Fields/Observation";
import Transcription from "./Fields/Transcription";
import InterventionReasonRelationType from "models/InterventionReasonRelationType";

import { Box, FieldError, FieldHelp } from "../Form.style";

export default function Base({
  drugData,
  intervention,
  reasons,
  searchDrugs,
  drugs,
  reasonTextMemory,
  memorySaveReasonText,
  memoryFetchReasonText,
  drugSummary,
  fetchDrugSummary,
  featureService,
  prescriptionStatus,
  prescriptionHeaders,
}) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { t } = useTranslation();
  const { item: itemToSave } = intervention;
  const {
    error,
    cost,
    idInterventionReason,
    interactions,
    observation,
    transcription,
  } = values;
  const layout = { label: 8, input: 16 };
  const hasTranscription = featureService.hasTranscription();

  const hasRelationships = (reasonList, selectedReasons = []) => {
    if (!selectedReasons || values.idPrescriptionDrugList) return false;

    const reasonsWithRelationshipsRegEx =
      /duplicidade|interaç|incompatib|apresentaç|forma|subst|alterna/g;

    return hasReason(
      reasonList,
      selectedReasons,
      reasonsWithRelationshipsRegEx
    );
  };

  const getIntvDescription = (intv) => {
    return intv.parenName ? `${intv.parenName} = ${intv.name}` : intv.name;
  };

  const hasReason = (reasonList, selectedReasons = [], regex) => {
    if (!selectedReasons) return false;

    let hasRelation = false;

    selectedReasons.forEach((itemId) => {
      const reasonIndex = reasonList.findIndex(
        (reason) => reason.id === itemId
      );

      if (reasonIndex !== -1) {
        // TODO: remove regex test after review
        const reason = getIntvDescription(
          reasonList[reasonIndex]
        ).toLowerCase();
        if (reason.match(regex)) {
          hasRelation = true;
        }

        if (
          InterventionReasonRelationType.getTypesWithRelation().indexOf(
            reasonList[reasonIndex].relationType
          ) !== -1
        ) {
          hasRelation = true;
        }
      }
    });

    return hasRelation;
  };

  const hasSuspOrSubst = (reasonList, selectedReasons = []) => {
    if (!selectedReasons) return false;

    for (let i = 0; i < selectedReasons.length; i++) {
      const reasonIndex = reasonList.findIndex(
        (reason) => reason.id === selectedReasons[i]
      );

      if (reasonIndex !== -1) {
        if (reasonList[reasonIndex].suspension) {
          return "suspension";
        }

        if (reasonList[reasonIndex].substitution) {
          return "substitution";
        }

        if (reasonList[reasonIndex].substitution) {
          return "substitution";
        }

        if (reasonList[reasonIndex].customEconomy) {
          return "customEconomy";
        }
      }
    }

    return false;
  };

  const hasBlockingAlert = (reasonList, selectedReasons = []) => {
    if (!selectedReasons) return false;

    if (itemToSave?.intervention?.idIntervention) {
      return false;
    }

    let status;

    if (prescriptionHeaders && prescriptionHeaders[drugData.idPrescription]) {
      status = intervention?.item?.headers[drugData.idPrescription].status;
    } else {
      status = prescriptionStatus;
    }

    if (status !== "s") {
      return false;
    }

    for (let i = 0; i < selectedReasons.length; i++) {
      const reasonIndex = reasonList.findIndex(
        (reason) => reason.id === selectedReasons[i]
      );

      if (reasonIndex !== -1 && reasonList[reasonIndex].blocking) {
        return true;
      }
    }

    return false;
  };

  const handleReasonChange = (idInterventionReason) => {
    const joinReasons = (ids, reasons) => {
      if (isEmpty(ids)) return "";

      const selectedReasons = ids.map((id) => {
        const index = reasons.findIndex((item) => item.id === id);
        return getIntvDescription(reasons[index]);
      });

      return selectedReasons.join(", ");
    };
    const reasonDescription = joinReasons(idInterventionReason, reasons.list);
    if (!hasRelationships(reasons.list, idInterventionReason)) {
      setFieldValue("idInterventionReason", idInterventionReason);
      setFieldValue("interactions", null);
      setFieldValue("reasonDescription", reasonDescription);
    } else {
      setFieldValue("idInterventionReason", idInterventionReason);
      setFieldValue("reasonDescription", reasonDescription);
    }

    if (!hasSuspOrSubst(reasons.list, idInterventionReason)) {
      setFieldValue("economyDays", null);
    }
  };

  return (
    <>
      <Box hasError={errors.error && touched.error}>
        <Col xs={layout.label}>
          <Heading as="label" $size="14px">
            <Tooltip
              title={t("interventionForm.labelPrescriptionErrorHint")}
              underline
            >
              {t("interventionForm.labelPrescriptionError")}:
            </Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Switch
            onChange={(value) => setFieldValue("error", value)}
            checked={error}
          />
          {errors.error && touched.error && (
            <FieldError>{errors.error}</FieldError>
          )}
        </Col>
      </Box>

      <Box hasError={errors.cost && touched.cost}>
        <Col xs={layout.label}>
          <Heading as="label" $size="14px">
            <Tooltip
              title={t("interventionForm.labelCostReductionHint")}
              underline
            >
              {t("interventionForm.labelCostReduction")}:
            </Tooltip>
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Switch
            onChange={(value) => setFieldValue("cost", value)}
            checked={cost}
          />
          {errors.cost && touched.cost && (
            <FieldError>{errors.cost}</FieldError>
          )}
        </Col>
      </Box>

      <Box
        hasError={errors.idInterventionReason && touched.idInterventionReason}
      >
        <Col xs={layout.label}>
          <Heading as="label" $size="14px">
            {t("interventionForm.labelReasons")}:
          </Heading>
        </Col>
        <Col xs={layout.input}>
          <Select
            id="reason"
            mode="multiple"
            optionFilterProp="children"
            style={{ width: "100%" }}
            placeholder={t("interventionForm.labelReasonsPlaceholder")}
            loading={reasons.isFetching}
            value={idInterventionReason}
            onChange={handleReasonChange}
          >
            {reasons.list &&
              reasons.list.map(({ id, parentName, name }) => (
                <Select.Option key={id} value={id}>
                  {parentName ? `${parentName} - ${name}` : name}
                </Select.Option>
              ))}
          </Select>
          {`${drugData.idPrescriptionDrug}` !== "0" && (
            <>
              {hasSuspOrSubst(reasons.list, idInterventionReason) ===
                "substitution" && (
                <FieldHelp style={{ opacity: 0.7 }}>
                  <Tooltip
                    underline
                    title="Farmacoeconomia: Será aplicado o cálculo de Substituição para o motivo selecionado"
                  >
                    Tipo economia: Substituição
                  </Tooltip>
                </FieldHelp>
              )}
              {hasSuspOrSubst(reasons.list, idInterventionReason) ===
                "suspension" && (
                <FieldHelp style={{ opacity: 0.7 }}>
                  <Tooltip
                    underline
                    title="Farmacoeconomia: Será aplicado o cálculo de Suspensão para o motivo selecionado"
                  >
                    Tipo economia: Suspensão
                  </Tooltip>
                </FieldHelp>
              )}
            </>
          )}
          {hasSuspOrSubst(reasons.list, idInterventionReason) ===
            "customEconomy" && (
            <FieldHelp style={{ opacity: 0.7 }}>
              <Tooltip
                underline
                title="Farmacoeconomia: No tipo de economia customizado, você deve informar economia/dia e dias de economia manualmente."
              >
                Tipo economia: Customizado
              </Tooltip>
            </FieldHelp>
          )}
          {hasBlockingAlert(reasons.list, idInterventionReason) && (
            <FieldError>
              A intervenção de bloqueio não terá efeito, pois a prescrição já
              foi checada/liberada.
            </FieldError>
          )}
          {errors.idInterventionReason && touched.idInterventionReason && (
            <FieldError>{errors.idInterventionReason}</FieldError>
          )}
        </Col>
      </Box>
      {hasRelationships(reasons.list, idInterventionReason) && (
        <Box hasError={errors.interactions && touched.interactions}>
          <Col xs={layout.label}>
            <Heading as="label" $size="14px">
              {hasSuspOrSubst(reasons.list, idInterventionReason) ===
              "substitution" ? (
                <Tooltip
                  title={t("interventionForm.labelSubstitutionHint")}
                  underline
                >
                  {t("interventionForm.labelSubstitution")}:
                </Tooltip>
              ) : (
                <Tooltip
                  title={t("interventionForm.labelRelationsHint")}
                  underline
                >
                  {t("interventionForm.labelRelations")}:
                </Tooltip>
              )}
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Interaction
              interactions={interactions}
              interactionsList={itemToSave.intervention.interactionsList}
              setFieldValue={setFieldValue}
              searchDrugs={searchDrugs}
              idSegment={
                itemToSave.intervention.idSegment || itemToSave.idSegment
              }
              drugs={drugs}
              uniqueDrugList={itemToSave.uniqueDrugList}
            />
            {errors.interactions && touched.interactions && (
              <FieldError>{errors.interactions}</FieldError>
            )}
          </Col>
        </Box>
      )}
      {hasTranscription && (
        <>
          <Box hasError={errors.transcription && touched.transcription}>
            <Col xs={layout.label}>
              <Heading as="label" $size="14px">
                <Tooltip
                  title={t("interventionForm.labelTranscriptionHint")}
                  underline
                >
                  {t("interventionForm.labelTranscription")}:
                </Tooltip>
              </Heading>
            </Col>
            <Col xs={layout.input}>
              <Switch
                onChange={(value) => setFieldValue("transcription", value)}
                checked={transcription}
              />
              {errors.transcription && touched.transcription && (
                <FieldError>{errors.transcription}</FieldError>
              )}
            </Col>
          </Box>
          {transcription && (
            <Transcription
              fetchDrugSummary={fetchDrugSummary}
              drugSummary={drugSummary}
              drugData={drugData}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
              values={values}
              layout={layout}
              searchDrugs={searchDrugs}
              drugs={drugs}
            ></Transcription>
          )}
        </>
      )}
      <Box hasError={errors.observation && touched.observation}>
        <Observation
          content={observation}
          setFieldValue={setFieldValue}
          memory={reasonTextMemory}
          fetchMemory={memoryFetchReasonText}
          saveMemory={memorySaveReasonText}
          currentReason={idInterventionReason}
          drugData={drugData}
          interactions={values.interactions}
          interactionsList={values.interactionsList}
          uniqueDrugList={itemToSave.uniqueDrugList}
        />
        {errors.observation && touched.observation && (
          <FieldError>{errors.observation}</FieldError>
        )}
      </Box>

      {values.idIntervention && (
        <Box hasError={errors.expendedDose && touched.expendedDose}>
          <Col xs={layout.label}>
            <Heading as="label" $size="14px">
              <Tooltip
                title="Quando selecionado, o responsável pela intervenção passa a ser o seu usuário"
                underline
              >
                Alterar responsável:
              </Tooltip>
            </Heading>
          </Col>
          <Col xs={layout.input}>
            <Switch
              onChange={(value) => setFieldValue("updateResponsible", value)}
              checked={values.updateResponsible}
            />
          </Col>
        </Box>
      )}
    </>
  );
}
