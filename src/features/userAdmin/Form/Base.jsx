import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { Input, Select, Textarea } from "components/Inputs";
import Switch from "components/Switch";
import Button from "components/Button";
import Role from "models/Role";
import securityService from "services/security";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getUserResetToken } from "features/serverActions/ServerActionsSlice";
import { getErrorMessage } from "utils/errorHandler";

function BaseForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.user.account.roles);
  const segments = useSelector((state) => state.segments.list);
  const { values, errors, setFieldValue } = useFormikContext();
  const [pwLoading, setPWLoading] = useState(false);
  const security = securityService(roles);

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
                    `${process.env.REACT_APP_URL}/reset/${response.payload.data}`
                  )
                }
                style={{ minHeight: "300px" }}
                value={`${process.env.REACT_APP_URL}/reset/${response.payload.data}`}
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

  return (
    <>
      <div className={`form-row ${errors.name ? "error" : ""}`}>
        <div className="form-label">
          <label>{t("userAdminForm.name")}:</label>
        </div>
        <div className="form-input">
          <Input
            value={values.name}
            onChange={({ target }) => setFieldValue("name", target.value)}
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
            onChange={({ target }) => setFieldValue("email", target.value)}
            maxLength={50}
            disabled={values.id != null}
          />
        </div>
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>

      <div className={`form-row ${errors.external ? "error" : ""}`}>
        <div className="form-label">
          <label>{t("userAdminForm.id")}:</label>
        </div>
        <div className="form-input">
          <Input
            value={values.external}
            onChange={({ target }) => setFieldValue("external", target.value)}
            maxLength={250}
          />
        </div>
        {errors.external && <div className="form-error">{errors.external}</div>}
      </div>

      {security.isMaintainer() && (
        <div className={`form-row ${errors.roles ? "error" : ""}`}>
          <div className="form-label">
            <label>{t("userAdminForm.roles")}:</label>
          </div>
          <div className="form-input">
            <Select
              id="reason"
              mode="multiple"
              optionFilterProp="children"
              style={{ width: "100%" }}
              value={values.roles}
              onChange={(roles) => setFieldValue("roles", roles)}
            >
              {Role.getRoles(t).map(({ id, label }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </div>
          {errors.roles && <div className="form-error">{errors.roles}</div>}
        </div>
      )}

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
            onChange={(segments) => setFieldValue("segments", segments)}
          >
            {segments.map(({ id, description }) => (
              <Select.Option key={id} value={id}>
                {description}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.segments && <div className="form-error">{errors.segments}</div>}
      </div>

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
        {errors.active && <div className="form-error">{errors.active}</div>}
      </div>

      {security.isAdmin() && values.id && (
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
  );
}

export default BaseForm;
