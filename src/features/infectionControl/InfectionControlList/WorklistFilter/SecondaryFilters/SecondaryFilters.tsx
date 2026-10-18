import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "antd";

import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select } from "components/Inputs";
import Switch from "components/Switch";
import { AWARE_LEVELS } from "features/culture/awareLevel";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";
import { Form } from "styles/Form.style";

import { AntimicrobialCriteria } from "../AntimicrobialCriteria/AntimicrobialCriteria";

const CARD_STYLE = { background: "#fafafa" };

const PENDING_TYPES = [
  InfectionControlPendingTypeEnum.NEVER_REVIEWED,
  InfectionControlPendingTypeEnum.NO_EVALUATION,
  InfectionControlPendingTypeEnum.EXPIRED,
  InfectionControlPendingTypeEnum.POSOLOGY_CHANGED,
  InfectionControlPendingTypeEnum.SCHEDULED_DATE,
  InfectionControlPendingTypeEnum.ALERT_FIRED,
];

/**
 * The filters under "see more", in group cards like the prescription
 * prioritization: the antimicrobials running (each on its treatment days, and
 * the AWaRe level) and the follow-up (pending reason, non-conformity and
 * overdue review). The cards are not forms, nothing submits on Enter
 */
export function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      <Col xs={24}>
        <Card
          title={t("infectionControl.worklist.filters.groups.antimicrobials")}
          size="small"
          type="inner"
          style={CARD_STYLE}
          data-kb="infectionControl.worklist.filters.antimicrobials"
        >
          <Form as="div">
            <div className="form-row">
              <AntimicrobialCriteria
                value={values.antimicrobials ?? []}
                onChange={(antimicrobials) => setFieldValue({ antimicrobials })}
                matchAll={!!values.antimicrobialsMatchAll}
                onMatchAllChange={(antimicrobialsMatchAll) =>
                  setFieldValue({ antimicrobialsMatchAll })
                }
              />
            </div>

            <Row className="form-row">
              <Col xs={24} md={12}>
                <div className="form-label">
                  <label htmlFor="awareLevels">
                    {t("infectionControl.worklist.filters.awareLevels")}:
                  </label>
                </div>
                <div className="form-input">
                  <Select
                    id="awareLevels"
                    mode="multiple"
                    allowClear
                    placeholder={t(
                      "infectionControl.worklist.filters.awareLevelsPlaceholder",
                    )}
                    value={values.awareLevels}
                    onChange={(awareLevels: any) =>
                      setFieldValue({ awareLevels })
                    }
                  >
                    {AWARE_LEVELS.map((level) => (
                      <Select.Option key={level} value={level}>
                        {t(`culture.awareLevel.${level}`)}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>
          </Form>
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card
          title={t("infectionControl.worklist.filters.groups.followUp")}
          size="small"
          type="inner"
          style={CARD_STYLE}
          data-kb="infectionControl.worklist.filters.followUp"
        >
          <Form as="div">
            <div className="form-row">
              <div className="form-label">
                <label htmlFor="pendingTypes">
                  {t("infectionControl.worklist.filters.pendingTypes")}:
                </label>
              </div>
              <div className="form-input">
                <Select
                  id="pendingTypes"
                  mode="multiple"
                  allowClear
                  maxTagCount="responsive"
                  optionFilterProp="children"
                  placeholder={t(
                    "infectionControl.worklist.filters.pendingTypesPlaceholder",
                  )}
                  value={values.pendingTypes}
                  onChange={(pendingTypes: any) =>
                    setFieldValue({ pendingTypes })
                  }
                >
                  {PENDING_TYPES.map((type) => (
                    <Select.Option key={type} value={type}>
                      {t(`infectionControl.worklist.pendingType.${type}`)}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label htmlFor="nonConforming">
                  {t("infectionControl.worklist.filters.nonConforming")}:
                </label>
              </div>
              <div className="form-input">
                <Switch
                  id="nonConforming"
                  checked={!!values.nonConforming}
                  onChange={(nonConforming: boolean) =>
                    setFieldValue({ nonConforming })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label htmlFor="overdueReview">
                  {t("infectionControl.worklist.filters.overdueReview")}:
                </label>
              </div>
              <div className="form-input">
                <Switch
                  id="overdueReview"
                  checked={!!values.overdueReview}
                  onChange={(overdueReview: boolean) =>
                    setFieldValue({ overdueReview })
                  }
                />
              </div>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
