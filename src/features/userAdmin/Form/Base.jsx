import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Flex, Tabs } from "antd";

import { Input, Select, Textarea, Checkbox } from "components/Inputs";
import Switch from "components/Switch";
import Button from "components/Button";
import Role from "models/Role";
import FeaturesService from "services/features";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getUserResetToken } from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";
import Permission from "models/Permission";
import PermissionService from "services/PermissionService";

function BaseForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const features = useSelector((state) => state.user.account.features);
  const segments = useSelector((state) => state.segments.list);
  const { values, errors, setFieldValue } = useFormikContext();
  const [pwLoading, setPWLoading] = useState(false);
  const featureService = FeaturesService(features);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notification.success({ message: "Link copiado!" });
  };

  const generateResetToken = () => {
    setPWLoading(true);

    dispatch(getUserResetToken({ idUser: values.id })).then((response) => {
      setPWLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        DefaultModal.info({
          title: "Link para Reset de Senha",
          content: (
            <>
              <p>
                Cuidado ao disponibilizar este link. Confira se o usuário é
                legítimo. Encaminhe este link somente para o email do usuário
                que irá utilizá-lo.
              </p>
              <Textarea
                onClick={() =>
                  copyToClipboard(
                    `${import.meta.env.VITE_APP_URL}/reset/${
                      response.payload.data
                    }`
                  )
                }
                style={{ minHeight: "300px" }}
                value={`${import.meta.env.VITE_APP_URL}/reset/${
                  response.payload.data
                }`}
              ></Textarea>
            </>
          ),
          icon: null,
          width: 500,
          okText: "Fechar",
          okButtonProps: { type: "default" },
          wrapClassName: "default-modal",
        });
      }
    });
  };

  const reportOptions = [
    {
      value: "PATIENT_DAY",
      label: "Pacientes-Dia",
    },
    {
      value: "PRESCRIPTION",
      label: "Prescrições",
    },
    {
      value: "INTERVENTION",
      label: "Intervenções",
    },
    {
      value: "PRESCRIPTION_AUDIT",
      label: "Auditoria",
    },
    {
      value: "ECONOMY",
      label: "Farmacoeconomia",
    },
    {
      value: "CUSTOM",
      label: "Relatórios customizados",
    },
  ];

  return (
    <Tabs
      defaultActiveKey="general"
      items={[
        {
          label: "Geral",
          key: "general",
          children: (
            <>
              <div className={`form-row ${errors.name ? "error" : ""}`}>
                <div className="form-label">
                  <label>{t("userAdminForm.name")}:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.name}
                    onChange={({ target }) =>
                      setFieldValue("name", target.value)
                    }
                    maxLength={250}
                  />
                </div>
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className={`form-row ${errors.email ? "error" : ""}`}>
                <div className="form-label">
                  <label>{t("userAdminForm.email")}:</label>
                </div>
                <div className="form-input">
                  <Input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={({ target }) =>
                      setFieldValue("email", target.value)
                    }
                    maxLength={50}
                    disabled={values.id != null}
                  />
                </div>
                {errors.email && (
                  <div className="form-error">{errors.email}</div>
                )}
              </div>

              <div className={`form-row ${errors.external ? "error" : ""}`}>
                <div className="form-label">
                  <label>{t("userAdminForm.id")}:</label>
                </div>
                <div className="form-input">
                  <Input
                    value={values.external}
                    onChange={({ target }) =>
                      setFieldValue("external", target.value)
                    }
                    maxLength={250}
                  />
                </div>
                <div className="form-info">
                  ID do usuário no sistema externo. Este campo é utilizado para
                  integrar com sistemas externos.
                </div>
                {errors.external && (
                  <div className="form-error">{errors.external}</div>
                )}
              </div>

              {featureService.hasAuthorizationSegment() && (
                <div className={`form-row ${errors.segments ? "error" : ""}`}>
                  <div className="form-label">
                    <label>{t("userAdminForm.segments")} (Beta):</label>
                  </div>
                  <div className="form-input">
                    <Select
                      id="reason"
                      mode="multiple"
                      optionFilterProp="children"
                      style={{ width: "100%" }}
                      value={values.segments}
                      onChange={(segments) =>
                        setFieldValue("segments", segments)
                      }
                    >
                      {segments.map(({ id, description }) => (
                        <Select.Option key={id} value={id}>
                          {description}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  {errors.segments && (
                    <div className="form-error">{errors.segments}</div>
                  )}
                </div>
              )}

              <div className={`form-row ${errors.roles ? "error" : ""}`}>
                <div className="form-label">
                  <label>{t("userAdminForm.roles")}:</label>
                </div>
                <div className="form-input-checkbox-single">
                  <Checkbox.Group
                    style={{ width: "100%" }}
                    value={values.roles}
                    onChange={(roles) => setFieldValue("roles", roles)}
                  >
                    {Role.getNewRoles(t, features).map(
                      ({ id, label, description }) => (
                        <Flex vertical style={{ width: "100%" }} key={id}>
                          <Checkbox style={{ fontWeight: 600 }} value={id}>
                            {label}
                          </Checkbox>
                          <div className="checkbox-description">
                            {description}
                          </div>
                        </Flex>
                      )
                    )}
                  </Checkbox.Group>
                </div>
                {errors.roles && (
                  <div className="form-error">{errors.roles}</div>
                )}
              </div>

              {PermissionService().has(Permission.ADMIN_USERS) && (
                <div className={`form-row ${errors.features ? "error" : ""}`}>
                  <div className="form-label">
                    <label>Features:</label>
                  </div>
                  <div className="form-input">
                    <Select
                      id="reason"
                      mode="multiple"
                      optionFilterProp="children"
                      style={{ width: "100%" }}
                      value={values.features}
                      onChange={(features) =>
                        setFieldValue("features", features)
                      }
                      allowClear
                    >
                      <Select.Option value="DISABLE_CPOE">
                        Desabilitar CPOE
                      </Select.Option>
                      <Select.Option value="STAGING_ACCESS">
                        Acesso ao ambiente de homologação
                      </Select.Option>
                    </Select>
                  </div>
                  <div className="form-info">
                    Features são definidas apenas pela NoHarm.
                  </div>
                  {errors.features && (
                    <div className="form-error">{errors.features}</div>
                  )}
                </div>
              )}

              <div className={`form-row ${errors.active ? "error" : ""}`}>
                <div className="form-label">
                  <label>{t("userAdminForm.active")}:</label>
                </div>
                <div className="form-input">
                  <Switch
                    onChange={(active) => setFieldValue("active", active)}
                    checked={values.active}
                  />
                </div>
                {errors.active && (
                  <div className="form-error">{errors.active}</div>
                )}
              </div>

              {PermissionService().has(Permission.ADMIN_USERS) && values.id && (
                <div className={`form-row`}>
                  <Button
                    danger
                    onClick={() => generateResetToken()}
                    loading={pwLoading}
                  >
                    Gerar link para reset de senha
                  </Button>
                </div>
              )}
            </>
          ),
        },
        {
          label: "Relatórios",
          key: "reports",
          children: (
            <>
              <div
                className={`form-row ${errors.ignoreReports ? "error" : ""}`}
              >
                <div className="form-label">
                  <label>Remover acesso aos relatórios:</label>
                </div>
                <div className="form-input">
                  <Select
                    mode="multiple"
                    options={reportOptions}
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    value={values.ignoreReports}
                    onChange={(value) => setFieldValue("ignoreReports", value)}
                    allowClear
                  />
                </div>
                <div className="form-info">
                  Lista de relatórios que o usuário não terá acesso.
                </div>
                {errors.ignoreReports && (
                  <div className="form-error">{errors.ignoreReports}</div>
                )}
              </div>
            </>
          ),
        },
      ]}
    />
  );
}

export default BaseForm;
