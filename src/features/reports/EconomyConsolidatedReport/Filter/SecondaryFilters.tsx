import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "antd";
import { debounce } from "lodash";

import { useAppDispatch } from "src/store";
import { Col, Row } from "components/Grid";
import { Radio, Select } from "components/Inputs";
import LoadBox from "components/LoadBox";
import notification from "components/notification";
import { AdvancedFilterContext } from "components/AdvancedFilter";
import { searchUsers } from "features/lists/ListsSlice";
import { getErrorMessage } from "utils/errorHandler";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";
import { HIDDEN_NAME } from "utils/report";
import { Form } from "styles/Form.style";

import {
  ECONOMY_TYPE_OPTIONS,
  ECONOMY_VALUE_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from "../options";

export default function SecondaryFilters() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { values, setFieldValue }: any = useContext(AdvancedFilterContext);
  const hideNames = FeatureService.has(Feature.HIDE_NAMES);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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

  return (
    <Row gutter={[20, 20]} style={{ marginTop: "15px", padding: "10px 0" }}>
      <Col md={12}>
        <Card
          title="Economia"
          size="small"
          type="inner"
          style={{ background: "#fafafa" }}
        >
          <Form>
            <div className="form-row">
              <div className="form-label">
                <label>Tipo economia:</label>
              </div>
              <div className="form-input">
                <Radio.Group
                  style={{ marginTop: "5px" }}
                  options={ECONOMY_TYPE_OPTIONS}
                  onChange={({ target: { value } }) =>
                    handleChange("economy_type", value)
                  }
                  value={values.economy_type}
                  optionType="button"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-label">
                <label>Valor Economia/Dia:</label>
              </div>
              <div className="form-input">
                <Radio.Group
                  style={{ marginTop: "5px" }}
                  options={ECONOMY_VALUE_TYPE_OPTIONS}
                  onChange={({ target: { value } }) =>
                    handleChange("economy_value_type", value)
                  }
                  value={values.economy_value_type}
                  optionType="button"
                />
              </div>
            </div>
          </Form>
        </Card>
      </Col>
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
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
