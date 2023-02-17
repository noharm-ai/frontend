import "styled-components/macro";
import React from "react";
import isEmpty from "lodash.isempty";
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

import { Box, FieldError } from "../Form.style";

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
  security,
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
  const hasTranscription =
    security.hasTranscription() &&
    drugData.intervention.id + "" !== "0" &&
    drugData.intervention.idPrescriptionDrug + "" !== "0";

  const hasRelationships = (reasonList, selectedReasons = []) => {
    if (!selectedReasons) return false;

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
  };

  return (
    <>
      <Box hasError={errors.error && touched.error}>
        <Col xs={layout.label}>
          <Heading as="label" size="14px">
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
          <Heading as="label" size="14px">
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
          <Heading as="label" size="14px">
            <Tooltip title={t("interventionForm.labelReasonsHint")} underline>
              {t("interventionForm.labelReasons")}:
            </Tooltip>
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
            {reasons.list.map(({ id, parentName, name }) => (
              <Select.Option key={id} value={id}>
                {parentName ? `${parentName} - ${name}` : name}
              </Select.Option>
            ))}
          </Select>
          {errors.idInterventionReason && touched.idInterventionReason && (
            <FieldError>{errors.idInterventionReason}</FieldError>
          )}
        </Col>
      </Box>
      {hasRelationships(reasons.list, idInterventionReason) && (
        <Box hasError={errors.interactions && touched.interactions}>
          <Col xs={layout.label}>
            <Heading as="label" size="14px">
              <Tooltip
                title={t("interventionForm.labelRelationsHint")}
                underline
              >
                {t("interventionForm.labelRelations")}:
              </Tooltip>
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
              <Heading as="label" size="14px">
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
        />
        {errors.observation && touched.observation && (
          <FieldError>{errors.observation}</FieldError>
        )}
      </Box>
    </>
  );
}
