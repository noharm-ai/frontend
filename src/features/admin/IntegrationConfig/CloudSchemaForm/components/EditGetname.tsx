import { useState } from "react";
import { Flex, Space } from "antd";
import { Formik } from "formik";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

import { useAppDispatch } from "src/store";
import { Input } from "src/components/Inputs";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import { upsertGetname } from "../../IntegrationConfigSlice";

interface IEditGetnameProps {
  onCancel: () => void;
  onSave: () => void;
  initialIP: string;
  schema: string;
}

interface IEditGetnameFields {
  ip: string;
}

export function EditGetname({
  onCancel,
  onSave,
  initialIP,
  schema,
}: IEditGetnameProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const initialValues = {
    ip: initialIP,
  };

  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  const validationSchema = Yup.object().shape({
    ip: Yup.string().matches(ipv4Regex, "IP inválido").required("Obrigatório"),
  });

  const onSubmit = (params: IEditGetnameFields) => {
    setLoading(true);
    // @ts-expect-error ts 2554 (legacy code)
    dispatch(upsertGetname({ ...params, schema_name: schema })).then(
      (response: any) => {
        setLoading(false);

        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        } else {
          notification.success({
            message: "Alteração de DNS enviada com sucesso!",
            description:
              "A alteração pode demorar alguns minutos para ter efeito.",
          });

          onSave();
        }
      }
    );
  };
  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, setFieldValue, values, errors }) => (
        <Flex align="center" justify="space-between" gap="middle">
          <Input
            placeholder="Informe o IP"
            onChange={({ target }) => setFieldValue("ip", target.value)}
            value={values.ip}
            status={errors.ip ? "error" : ""}
            disabled={loading}
          />
          <div>
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={() => onCancel()}
                loading={loading}
              />
              <Button
                icon={<CheckOutlined />}
                type="primary"
                onClick={() => handleSubmit()}
                loading={loading}
              />
            </Space>
          </div>
        </Flex>
      )}
    </Formik>
  );
}
