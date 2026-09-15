import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Tag } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import moment from "moment";

import Button from "components/Button";
import DefaultModal from "components/Modal";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { fetchCultureAlternatives } from "features/culture/CultureSlice";
import { RESULT_RESISTANT } from "features/culture/cultureResistance";
import {
  AWARE_LEVELS,
  AWARE_UNKNOWN,
  AWARE_COLORS,
  awareKey,
} from "features/culture/awareLevel";

import { Container, Specimen, LevelGroup } from "./CultureAlternatives.style";

// why the antibiogram suggests other drugs (backend
// CultureAlternativeModeEnum): the prescribed drug tested resistant, or it
// tested susceptible and a less aggressive option may do
export const MODE_ESCALATION = "escalation";
export const MODE_DEESCALATION = "deescalation";

const formatDate = (date) =>
  date ? moment(date).format("DD/MM/YYYY HH:mm") : "-";

/**
 * The AWaRe group of an antimicrobial, as a colored tag. Unclassified drugs
 * are said so instead of being guessed onto the scale.
 */
export const AwareTag = ({ level, t }) => {
  const key = awareKey(level);

  return (
    <Tooltip title={t("culture.awareLevel.hint")}>
      <Tag
        className={`culture-aware-level culture-aware-level-${key}`}
        color={AWARE_COLORS[key]}
        style={{ marginInlineEnd: 0 }}
      >
        {t("culture.awareLevel.label")}: {t(`culture.awareLevel.${key}`)}
      </Tag>
    </Tooltip>
  );
};

const groupByLevel = (alternatives) => {
  const groups = {};

  (alternatives || []).forEach((alternative) => {
    const key = awareKey(alternative.atbLevel);

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(alternative);
  });

  // the backend orders the options by level already; the groups keep the
  // same reading, the unclassified ones last
  return [...AWARE_LEVELS, AWARE_UNKNOWN]
    .filter((key) => groups[key])
    .map((key) => ({ key, alternatives: groups[key] }));
};

// what the empty list means depends on why it was asked: a resistant drug
// with nothing susceptible beside it, a susceptible one with nothing less
// aggressive, or a prescribed drug the scale does not place
const noneMessage = (culture, substance, t) => {
  if (culture.mode === MODE_ESCALATION) {
    return t("culture.alternatives.noneEscalation");
  }

  if (substance?.atbLevel == null) {
    return t("culture.alternatives.noneLevel");
  }

  return t("culture.alternatives.noneDeescalation");
};

const CultureAlternativesSpecimen = ({ culture, substance, t }) => {
  const resistant = culture.resultType === RESULT_RESISTANT;
  const groups = groupByLevel(culture.alternatives);

  return (
    <Specimen
      className={`culture-alternatives-specimen culture-alternatives-specimen-${culture.mode}`}
      $resistant={resistant}
    >
      <div className="culture-alternatives-specimen-header">
        <div>
          {t("culture.microorganism")}: {culture.microorganism || "-"}
        </div>
        <div>
          {t("culture.material")}: {culture.material || "-"}
        </div>
        <div>
          {t("culture.collectionDate")}: {formatDate(culture.collectionDate)}
        </div>
        <div>
          {t("culture.alternatives.prescribedResult")}:{" "}
          <span className="culture-alternatives-result">{culture.result}</span>
        </div>
      </div>

      <div className="culture-alternatives-mode">
        {t(`culture.alternatives.${culture.mode}Hint`)}
      </div>

      {groups.length === 0 ? (
        <div className="culture-alternatives-none">
          {noneMessage(culture, substance, t)}
        </div>
      ) : (
        groups.map((group) => (
          <LevelGroup
            key={group.key}
            className={`culture-alternatives-group culture-alternatives-group-${group.key}`}
            $level={group.key}
          >
            <div className="culture-alternatives-level">
              <span className="culture-alternatives-level-dot" />
              <span>{t(`culture.awareLevel.${group.key}`)}</span>
            </div>
            <div className="culture-alternatives-list">
              {group.alternatives.map((alternative) => (
                <div
                  className="culture-alternative-item"
                  key={alternative.drug}
                >
                  <span className="name" title={alternative.drug}>
                    {alternative.drug}
                  </span>
                  {alternative.resultDetail && (
                    <span className="detail">{alternative.resultDetail}</span>
                  )}
                </div>
              ))}
            </div>
          </LevelGroup>
        ))
      )}
    </Specimen>
  );
};

const CultureAlternativesContent = ({ data, t }) => {
  const name = data.drug || data.substance?.name;

  return (
    <Container className="culture-alternatives">
      <div className="culture-alternatives-substance">
        {name && <span className="culture-alternatives-drug">{name}</span>}
        <AwareTag level={data.substance?.atbLevel} t={t} />
      </div>

      {data.cultures.length === 0 ? (
        <div className="culture-alternatives-no-cultures">
          {t("culture.alternatives.noCultures")}
        </div>
      ) : (
        data.cultures.map((culture) => (
          <CultureAlternativesSpecimen
            key={`${culture.idExamItem}-${culture.collectionDate}`}
            culture={culture}
            substance={data.substance}
            t={t}
          />
        ))
      )}

      <div className="culture-alternatives-disclaimer">
        {t("culture.alternatives.disclaimer")}
      </div>
    </Container>
  );
};

/**
 * A button that fetches what the antibiograms suggest in place of a prescribed
 * antimicrobial and reads it in a modal.
 *
 * The comparison is not part of the prescription payload, nor of the culture
 * list: it is asked for by substance when the user wants it, from the culture
 * card (CultureTab) or from the culture alert of the item (DrugAlerts).
 *
 * @param mode which reading the button announces: MODE_ESCALATION for a drug
 *   that tested resistant, MODE_DEESCALATION for one that tested susceptible.
 *   The modal itself reads the mode of every specimen from the backend.
 */
export function CultureAlternatives({
  idPrescription,
  sctid,
  mode = MODE_ESCALATION,
  size = "small",
  type = "default",
  danger = mode === MODE_ESCALATION,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  if (!idPrescription || sctid == null) {
    return null;
  }

  const open = () => {
    setLoading(true);

    // the store middleware hands back the resolved action, not the thunk
    // promise, so the outcome is read from it (same as DrugAlerts)
    dispatch(fetchCultureAlternatives({ idPrescription, sctid })).then(
      (response) => {
        setLoading(false);

        if (response.error) {
          notification.error({
            message: t("culture.alternatives.loadError"),
            description: getErrorMessage(response, t),
          });
        } else {
          setData(response.payload);
        }
      },
    );
  };

  return (
    <>
      <Button
        size={size}
        type={type}
        danger={danger}
        icon={<SwapOutlined />}
        loading={loading}
        onClick={open}
        className={`culture-alternatives-button culture-alternatives-button-${mode}`}
      >
        {t(`culture.alternatives.${mode}Button`)}
      </Button>

      <DefaultModal
        open={!!data}
        title={t("culture.alternatives.title")}
        width="min(720px, 96vw)"
        centered
        destroyOnHidden
        footer={null}
        onCancel={() => setData(null)}
        className="culture-alternatives-modal"
      >
        {data && <CultureAlternativesContent data={data} t={t} />}
      </DefaultModal>
    </>
  );
}
