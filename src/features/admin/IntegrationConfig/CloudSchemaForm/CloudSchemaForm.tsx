import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Descriptions, Skeleton, Tag, Flex } from "antd";
import { EditOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import DefaultModal from "components/Modal";
import Button from "components/Button";
import { getErrorMessage } from "utils/errorHandler";
import {
  fetchCloudConfig,
  setCloudConfigSchema,
} from "../IntegrationConfigSlice";
import { EditGetname } from "./components/EditGetname";

export function CloudSchemaForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [editGetname, setEditGetname] = useState<boolean>(false);
  const schema = useAppSelector(
    (state) => state.admin.integrationConfig.cloudConfig.schema
  );
  const status = useAppSelector(
    (state) => state.admin.integrationConfig.cloudConfig.status
  );
  const data: any = useAppSelector(
    (state) => state.admin.integrationConfig.cloudConfig.data
  );

  useEffect(() => {
    if (schema) {
      // @ts-expect-error ts 2554 (legacy code)
      dispatch(fetchCloudConfig({ schema })).then((response: any) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        }
      });
    }

    return () => {
      setCloudConfigSchema(null);
    };
  }, [schema, dispatch, t]);

  const onCancel = () => {
    dispatch(setCloudConfigSchema(null));
    setEditGetname(false);
  };

  const afterSave = () => {
    // @ts-expect-error ts 2554 (legacy code)
    dispatch(fetchCloudConfig({ schema }));
    setEditGetname(false);
  };

  return (
    <DefaultModal
      open={!!schema}
      width={700}
      centered
      destroyOnClose
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
    >
      {status === "loading" ? (
        <Skeleton />
      ) : (
        <>
          <header>
            <h2 className="modal-title">Infraestrutura: {schema}</h2>
          </header>
          <Descriptions bordered size="small">
            <Descriptions.Item label="Getname" span={3}>
              {editGetname ? (
                <EditGetname
                  onCancel={() => setEditGetname(false)}
                  onSave={() => afterSave()}
                  initialIP={data.getname?.ResourceRecords[0].Value}
                  schema={schema!}
                />
              ) : (
                <Flex justify="space-between" align="center">
                  <div>
                    {data && data.getname ? (
                      <>
                        {data.getname?.Name} (
                        {data.getname?.ResourceRecords[0].Value})
                      </>
                    ) : (
                      <Tag color="red">Não configurado</Tag>
                    )}
                  </div>
                  <Button
                    icon={<EditOutlined />}
                    type="primary"
                    onClick={() => setEditGetname(true)}
                  />
                </Flex>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="SQS" span={3}>
              {data && data.sqs ? (
                <>{data.sqs}</>
              ) : (
                <Tag color="red">Não configurado</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Logstream" span={3}>
              {data && data.logstream ? (
                <>nifi/{schema}</>
              ) : (
                <Tag color="red">Não configurado</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </DefaultModal>
  );
}
