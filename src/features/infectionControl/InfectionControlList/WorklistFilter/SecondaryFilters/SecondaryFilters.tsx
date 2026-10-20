import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Card } from "antd";

import { Col, Row } from "components/Grid";
import { HelpTextIcon } from "components/HelpTextIcon/HelpTextIcon";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select } from "components/Inputs";
import Switch from "components/Switch";
import { AWARE_LEVELS } from "features/culture/awareLevel";
import { InfectionControlPendingTypeEnum } from "models/InfectionControlEnum";
import { Form } from "styles/Form.style";

import {
  CLOSED_DAYS_OPTIONS,
  isClosedOnly,
  listsClosed,
} from "../../../InfectionControlListSlice";
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
 * the AWaRe level) and the follow-up (how far back the closed ones go, pending
 * reason, non-conformity and overdue review). The cards are not forms, nothing submits on Enter.
 *
 * A closed admission has nothing running, no open reason and no evaluation in
 * force, so with only the closed ones chosen those filters are disabled
 */
export function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;
  const closedOnly = isClosedOnly(values.status);

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      {closedOnly && (
        <Col xs={24}>
          <Alert
            type="info"
            showIcon
            message={t("infectionControl.worklist.filters.closedOnlyHint")}
          />
        </Col>
      )}
      <Col xs={24} md={12}>
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
                disabled={closedOnly}
              />
            </div>

            <div className="form-row">
              <div className="form-label-actions">
                <label htmlFor="awareLevels">
                  {t("infectionControl.worklist.filters.awareLevels")}:
                </label>{" "}
                <HelpTextIcon pageKey="controle-infeccao-aware" />
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
                  disabled={closedOnly}
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
            </div>
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
              <div className="form-label-actions">
                <label htmlFor="closedDays">
                  {t("infectionControl.worklist.filters.closedDays")}:
                </label>
              </div>
              <div className="form-input">
                <Select
                  id="closedDays"
                  // the closed ones are listed only within this many days of
                  // closing
                  disabled={!listsClosed(values.status)}
                  value={values.closedDays}
                  onChange={(closedDays: any) => setFieldValue({ closedDays })}
                >
                  {CLOSED_DAYS_OPTIONS.map((days) => (
                    <Select.Option key={days} value={days}>
                      {t("infectionControl.worklist.filters.closedDaysOption", {
                        count: days,
                      })}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-label-actions">
                <label htmlFor="pendingTypes">
                  {t("infectionControl.worklist.filters.pendingTypes")}:
                </label>{" "}
                <HelpTextIcon pageKey="controle-infeccao-motivo-pendencia" />
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
                  disabled={closedOnly}
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
              <div className="form-label-actions">
                <label htmlFor="nonConforming">
                  {t("infectionControl.worklist.filters.nonConforming")}:
                </label>{" "}
                <HelpTextIcon pageKey="controle-infeccao-nao-conforme" />
              </div>
              <div className="form-input">
                <Switch
                  id="nonConforming"
                  checked={!!values.nonConforming}
                  disabled={closedOnly}
                  onChange={(nonConforming: boolean) =>
                    setFieldValue({ nonConforming })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-label-actions">
                <label htmlFor="overdueReview">
                  {t("infectionControl.worklist.filters.overdueReview")}:
                </label>{" "}
                <HelpTextIcon pageKey="controle-infeccao-revisao-atrasada" />
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
