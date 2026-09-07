import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "antd";
import { debounce } from "lodash";

import { useAppDispatch, useAppSelector } from "src/store";
import { Col, Row } from "components/Grid";
import { Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import notification from "components/notification";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { searchUsers } from "features/lists/ListsSlice";
import { fetchReasonsListThunk } from "store/ducks/intervention/thunk";
import { getErrorMessage } from "utils/errorHandler";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";
import { HIDDEN_NAME } from "utils/report";
import { Form } from "styles/Form.style";

import { STATUS_OPTIONS } from "../options";

export function SecondaryFilters() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);
  const hideNames = FeatureService.has(Feature.HIDE_NAMES);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [reasonsRequested, setReasonsRequested] = useState(false);
  const reasons = useAppSelector(
    (state: any) => state.intervention.reasons.list,
  );
  const reasonsFetching = useAppSelector(
    (state: any) => state.intervention.reasons.isFetching,
  );

  const handleChange = (key: string, value: any) => {
    setFieldValue({ [key]: value });
  };

  const fetchUsers = (term: string) => {
    setLoadingUsers(true);

    dispatch(searchUsers({ term } as any) as any).then((response: any) => {
      setLoadingUsers(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setUserOptions(response.payload.data || []);
      }
    });
  };

  const searchUser = debounce((term: string) => {
    if (term.length < 3) return;
    fetchUsers(term);
  }, 800);

  // the dataset stores the reason as "Parent - Name" (or just "Name")
  const reasonOptions: string[] = (reasons || [])
    .map((r: any) => (r.parentName ? `${r.parentName} - ${r.name}` : r.name))
    .sort();

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      <Col md={12}>
        <Card
          title="Intervenção"
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>Desfecho:</label>
              </div>
              <div className="form-input">
                <Select
                  style={{ width: "100%" }}
                  value={values.status}
                  onChange={(val: any) => handleChange("status", val)}
                  showSearch
                  optionFilterProp="children"
                  mode="multiple"
                  allowClear
                  maxTagCount="responsive"
                  autoClearSearchValue={false}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <Select.Option key={s.value} value={s.value}>
                      {s.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>Motivo:</label>
              </div>
              <div className="form-input">
                <Select
                  style={{ width: "100%" }}
                  value={values.reason}
                  onChange={(val: any) => handleChange("reason", val)}
                  showSearch
                  optionFilterProp="children"
                  mode="multiple"
                  allowClear
                  maxTagCount="responsive"
                  loading={reasonsRequested && reasonsFetching}
                  autoClearSearchValue={false}
                  onDropdownVisibleChange={(open: boolean) => {
                    if (open) {
                      setReasonsRequested(true);
                      dispatch(fetchReasonsListThunk());
                    }
                  }}
                >
                  {reasonOptions.map((r) => (
                    <Select.Option key={r} value={r}>
                      {r}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>Convênio:</label>
              </div>
              <div className="form-input">
                <Select
                  style={{ width: "100%" }}
                  value={values.insurance}
                  onChange={(val: any) => handleChange("insurance", val)}
                  mode="tags"
                  allowClear
                  maxTagCount="responsive"
                  placeholder="Digite o nome do convênio e pressione Enter"
                  notFoundContent={null}
                />
              </div>
            </div>
          </Form>
        </Card>
      </Col>
      <Col md={12}>
        <Card
          title="Pessoas"
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>Responsável:</label>
              </div>
              <div className="form-input">
                <Select
                  style={{ width: "100%" }}
                  value={values.responsible}
                  onChange={(val: any) => handleChange("responsible", val)}
                  mode="multiple"
                  allowClear
                  maxTagCount="responsive"
                  loading={loadingUsers}
                  notFoundContent={loadingUsers ? <LoadBox /> : null}
                  placeholder="Digite ao menos 3 letras para buscar"
                  showSearch={{
                    onSearch: (term: string) => searchUser(term),
                    filterOption: false,
                    autoClearSearchValue: false,
                  }}
                >
                  {userOptions.map((u: any) => (
                    <Select.Option key={u.id} value={u.name}>
                      {hideNames ? HIDDEN_NAME : u.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>Prescritor:</label>
              </div>
              <div className="form-input">
                <Select
                  style={{ width: "100%" }}
                  value={values.prescriber}
                  onChange={(val: any) => handleChange("prescriber", val)}
                  mode="tags"
                  allowClear
                  maxTagCount="responsive"
                  placeholder="Digite o nome do prescritor e pressione Enter"
                  notFoundContent={null}
                />
              </div>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
