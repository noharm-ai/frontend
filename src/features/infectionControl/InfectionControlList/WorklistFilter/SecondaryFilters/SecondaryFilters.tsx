import { useContext } from "react";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select } from "components/Inputs";
import Switch from "components/Switch";
import { AWARE_LEVELS } from "features/culture/awareLevel";

import { AntimicrobialCriteria } from "../AntimicrobialCriteria/AntimicrobialCriteria";

/**
 * The filters under "see more": what runs (the antimicrobials asked for, each
 * on its treatment days, and the AWaRe level), non-conformity, admissions and
 * overdue review
 */
export function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  return (
    <Row gutter={[20, 20]}>
      <Col md={24} xxl={20}>
        <AntimicrobialCriteria
          value={values.antimicrobials ?? []}
          onChange={(antimicrobials) => setFieldValue({ antimicrobials })}
        />
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading
          {...({ as: "label", htmlFor: "awareLevels", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.awareLevels")}:
        </Heading>
        <Select
          id="awareLevels"
          style={{ width: "100%" }}
          mode="multiple"
          allowClear
          placeholder={t(
            "infectionControl.worklist.filters.awareLevelsPlaceholder",
          )}
          value={values.awareLevels}
          onChange={(awareLevels: any) => setFieldValue({ awareLevels })}
        >
          {AWARE_LEVELS.map((level) => (
            <Select.Option key={level} value={level}>
              {t(`culture.awareLevel.${level}`)}
            </Select.Option>
          ))}
        </Select>
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading
          {...({ as: "label", htmlFor: "nonConforming", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.nonConforming")}:
        </Heading>
        <div>
          <Switch
            id="nonConforming"
            checked={!!values.nonConforming}
            onChange={(nonConforming: boolean) =>
              setFieldValue({ nonConforming })
            }
          />
        </div>
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading
          {...({
            as: "label",
            htmlFor: "admissionNumbers",
            $size: "14px",
          } as any)}
        >
          {t("infectionControl.worklist.filters.admissionNumbers")}:
        </Heading>
        <Select
          id="admissionNumbers"
          style={{ width: "100%" }}
          mode="tags"
          allowClear
          tokenSeparators={[",", " "]}
          placeholder={t(
            "infectionControl.worklist.filters.admissionNumbersPlaceholder",
          )}
          notFoundContent={t(
            "infectionControl.worklist.filters.admissionNumbersPlaceholder",
          )}
          value={(values.admissionNumbers ?? []).map(String)}
          onChange={(list: any) =>
            setFieldValue({
              admissionNumbers: list
                .filter((value: string) => /^\d+$/.test(value))
                .map(Number),
            })
          }
        />
      </Col>

      <Col md={24} xl={18} xxl={14}>
        <Heading
          {...({ as: "label", htmlFor: "overdueReview", $size: "14px" } as any)}
        >
          {t("infectionControl.worklist.filters.overdueReview")}:
        </Heading>
        <div>
          <Switch
            id="overdueReview"
            checked={!!values.overdueReview}
            onChange={(overdueReview: boolean) =>
              setFieldValue({ overdueReview })
            }
          />
        </div>
      </Col>
    </Row>
  );
}
