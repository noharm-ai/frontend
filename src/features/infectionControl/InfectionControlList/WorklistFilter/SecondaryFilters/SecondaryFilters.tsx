import { useContext } from "react";
import { useTranslation } from "react-i18next";

import Heading from "components/Heading";
import { Col, Row } from "components/Grid";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { Select } from "components/Inputs";
import Switch from "components/Switch";

/** The filters under "see more": admissions and overdue review */
export function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(AdvancedFilterContext) as any;

  return (
    <Row gutter={[20, 20]}>
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
