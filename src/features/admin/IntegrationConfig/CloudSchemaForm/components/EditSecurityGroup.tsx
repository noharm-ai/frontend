import { useState } from "react";
import { Flex, Space } from "antd";
import { Formik } from "formik";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

import { useAppDispatch } from "src/store";
import { Input } from "src/components/Inputs";
import Button from "components/Button";
import notification from "components/notification";
import { getErrorMessage } from "src/utils/errorHandler";
import { upsertSecurityGroup } from "../../IntegrationConfigSlice";

interface IEditSecurityGroupProps {
  onSave: () => void;
  ruleId: string;
  sgId: string;
  source: string;
  schema: string;
}

interface IEditSecurityGroupFields {
  ip: string;
}

export function EditSecurityGroup({
  onSave,
  ruleId,
  sgId,
  source,
  schema,
}: IEditSecurityGroupProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [editSecurityGroup, setEditSecurityGroup] = useState<boolean>(false);

  const initialValues = {
    ip: source,
  };

  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[12][0-9]|3[0-2])$/;

  const validationSchema = Yup.object().shape({
    ip: Yup.string().matches(ipv4Regex, "IP inválido").required("Obrigatório"),
  });

  const onSubmit = (params: IEditSecurityGroupFields) => {
    setLoading(true);

    const payload = {
      new_cidr: params.ip,
      schema_name: schema,
      rule_id: ruleId,
      sg_id: sgId,
    };

    dispatch(
      // @ts-expect-error ts 2554 (legacy code)
      upsertSecurityGroup(payload)
    ).then((response: any) => {
      setLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Sucesso!",
        });

        onSave();
      }
    });
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
            placeholder="Informe o IP Range"
            onChange={({ target }) => setFieldValue("ip", target.value)}
            value={values.ip}
            status={errors.ip ? "error" : ""}
            disabled={loading || !editSecurityGroup}
          />
          <div>
            <Space>
              {editSecurityGroup ? (
                <>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => setEditSecurityGroup(false)}
                    loading={loading}
                  />
                  <Button
                    icon={<CheckOutlined />}
                    type="primary"
                    onClick={() => handleSubmit()}
                    loading={loading}
                  />
                </>
              ) : (
                <Button
                  icon={ruleId ? <EditOutlined /> : <PlusOutlined />}
                  type="primary"
                  onClick={() => setEditSecurityGroup(true)}
                />
              )}
            </Space>
          </div>
        </Flex>
      )}
    </Formik>
  );
}
