import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "antd";
import { debounce } from "lodash";

import { useAppDispatch } from "src/store";
import { Col, Row } from "components/Grid";
import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import notification from "components/notification";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { searchSubstances, searchUsers } from "features/lists/ListsSlice";
import { AWARE_LEVELS } from "features/culture/awareLevel";
import { getErrorMessage } from "utils/errorHandler";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";
import { HIDDEN_NAME } from "utils/report";
import { Form } from "styles/Form.style";

import { IFilterContext, IOption } from "../infectionControlReportTypes";

// letters typed before searching
const MIN_SEARCH = 3;

/**
 * Searches as the user types; the chosen options keep their labels
 * (labelInValue), so the printed filter list can name them.
 */
// what the search thunks of features/lists (JS) resolve to
interface ISearchResponse<T> {
  error?: unknown;
  payload: { data?: T[] };
}

function useSearch<T>(
  thunk: typeof searchSubstances | typeof searchUsers,
  toOption: (item: T) => IOption,
) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [options, setOptions] = useState<IOption[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useMemo(
    () =>
      debounce((term: string) => {
        if (term.trim().length < MIN_SEARCH) return;

        setLoading(true);
        // the JS thunks are typed without their params
        const params = { term: term.trim() } as unknown as undefined;
        (dispatch(thunk(params)) as Promise<unknown>).then((result) => {
          const response = result as ISearchResponse<T>;
          setLoading(false);
          if (response.error) {
            notification.error({ message: getErrorMessage(response, t) });
          } else {
            setOptions((response.payload.data || []).map(toOption));
          }
        });
      }, 800),
    [dispatch, thunk, toOption, t],
  );

  return { options, loading, search };
}

const toSubstance = (s: { sctid: string; name: string }) => ({
  value: Number(s.sctid),
  label: s.name,
});
const toUser = (u: { id: number; name: string }) => ({
  value: u.id,
  label: u.name,
});

/** AWaRe classification, substance and reviewer. */
export function SecondaryFilters() {
  const { t } = useTranslation();
  const { values, setFieldValue } = useContext(
    AdvancedFilterContext,
  ) as IFilterContext;
  const tk = (key: string) => t(`infectionControlConsolidated.filter.${key}`);
  const hideNames = FeatureService.has(Feature.HIDE_NAMES);
  const substances = useSearch(searchSubstances, toSubstance);
  const users = useSearch(searchUsers, toUser);

  const searchSelect = (
    key: "substance" | "reviewer",
    found: {
      options: IOption[];
      loading: boolean;
      search: (term: string) => void;
    },
    mask = false,
  ) => (
    <Select
      style={{ width: "100%" }}
      value={values[key]}
      onChange={(val) =>
        setFieldValue(
          key === "substance"
            ? { substance: val as IOption[] }
            : { reviewer: val as IOption[] },
        )
      }
      mode="multiple"
      labelInValue
      allowClear
      maxTagCount="responsive"
      loading={found.loading}
      notFoundContent={found.loading ? <LoadBox /> : null}
      placeholder={tk("searchPlaceholder")}
      showSearch={{
        onSearch: (term: string) => found.search(term),
        filterOption: false,
        autoClearSearchValue: false,
      }}
    >
      {found.options.map((o) => (
        <Select.Option key={o.value} value={o.value}>
          {mask ? HIDDEN_NAME : o.label}
        </Select.Option>
      ))}
    </Select>
  );

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      <Col md={12}>
        <Card
          title={tk("antimicrobial")}
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>{tk("aware")}:</label>
              </div>
              <div className="form-input">
                <Select
                  style={{ width: "100%" }}
                  value={values.aware_level}
                  onChange={(val) =>
                    setFieldValue({ aware_level: val as number[] })
                  }
                  mode="multiple"
                  allowClear
                  maxTagCount="responsive"
                >
                  {AWARE_LEVELS.map((level) => (
                    <Select.Option key={level} value={level}>
                      {t(`culture.awareLevel.${level}`)}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>{tk("substance")}:</label>
              </div>
              <div className="form-input">
                {searchSelect("substance", substances)}
              </div>
            </div>
          </Form>
        </Card>
      </Col>
      <Col md={12}>
        <Card
          title={tk("review")}
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>{tk("reviewer")}:</label>
              </div>
              <div className="form-input">
                {searchSelect("reviewer", users, hideNames)}
              </div>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
