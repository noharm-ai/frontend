import { useFormikContext } from "formik";
import { useMemo } from "react";
import { CheckOutlined } from "@ant-design/icons";

import { useAppSelector } from "src/store";
import { Input, Select } from "components/Inputs";
import Switch from "src/components/Switch";
import Table from "src/components/Table";
import Button from "components/Button";
import { ICreateSchemaForm } from "./CreateSchemaForm";
import { TpPepEnum } from "src/models/TpPepEnum";
import { formatDate, formatDateTime } from "src/utils/date";
import Tooltip from "src/components/Tooltip";
import { CrmStageEnum } from "src/models/CrmStageEnum";

export function Base() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<ICreateSchemaForm>();

  const templateList = useAppSelector(
    (state) => state.admin.integrationConfig.templateList.data,
  );
  const integrationList = useAppSelector(
    (state) => state.admin.integrationConfig.list,
  );

  // Filter integrations by selected tp_pep
  const filteredIntegrations = useMemo(() => {
    if (!values.tp_pep || !integrationList.length) return [];

    return integrationList
      .filter((integration: any) => integration.tp_pep === values.tp_pep)
      .map((integration: any) => ({
        label: integration.schema,
        schema: integration.schema,
        crm_data: integration.crm_data,
        created_at: integration.createdAt,
        backup_date:
          templateList &&
          typeof templateList === "object" &&
          integration.schema in templateList
            ? (templateList as Record<string, any>)[integration.schema]
                ?.backup_date
            : null,
      }))
      .filter((integration: any) => integration.backup_date !== null)
      .sort((a, b) => {
        // Sort by created_at desc, then by backup_date desc
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        if (dateB !== dateA) {
          return dateB - dateA; // created_at desc
        }

        // If created_at is the same, sort by backup_date desc
        if (a.backup_date && b.backup_date) {
          const backupA = new Date(a.backup_date).getTime();
          const backupB = new Date(b.backup_date).getTime();
          return backupB - backupA; // backup_date desc
        }

        // Handle null backup_date cases - nulls go to the end
        if (a.backup_date && !b.backup_date) return -1;
        if (!a.backup_date && b.backup_date) return 1;

        return 0;
      });
  }, [values.tp_pep, integrationList, templateList]);

  const onChangeTpPep = (value: any) => {
    setFieldValue("tp_pep", value);
    // Reset other fields when tp_pep changes
    setFieldValue("template_id", null);
  };

  return (
    <>
      <div className={`form-row form-row-flex`}>
        <div
          className={`form-row  ${
            errors.schema_name && touched.schema_name ? "error" : ""
          }`}
        >
          <div className="form-label">
            <label>Schema:</label>
          </div>
          <div className="form-input">
            <Input
              onChange={({ target }) =>
                setFieldValue("schema_name", target.value)
              }
              value={values.schema_name}
              style={{ width: "100%" }}
            />
          </div>
          {errors.schema_name && (
            <div className="form-error">{errors.schema_name}</div>
          )}
        </div>

        <div
          className={`form-row ${
            errors.tp_pep && touched.tp_pep ? "error" : ""
          }`}
        >
          <div className="form-label">
            <label>PEP do cliente:</label>
          </div>
          <div className="form-input">
            <Select
              options={TpPepEnum.getList()}
              showSearch={{ optionFilterProp: ["label"] }}
              onChange={(value) => onChangeTpPep(value)}
              value={values.tp_pep}
            />
          </div>
          {errors.tp_pep && <div className="form-error">{errors.tp_pep}</div>}
        </div>
      </div>

      {values.tp_pep && filteredIntegrations.length > 0 && (
        <div className="form-row">
          <div className="form-label">
            <label>Copiar template de:</label>
          </div>
          <div className="form-input" style={{ width: "100%" }}>
            <Table
              columns={[
                {
                  title: "",
                  key: "action",
                  render: (_: string, record: any) => (
                    <Tooltip title="Selecionar este template">
                      <Button
                        icon={
                          values.template_id === record.schema ? (
                            <CheckOutlined style={{ fontSize: "16px" }} />
                          ) : (
                            <></>
                          )
                        }
                        shape="circle"
                        onClick={() => {
                          setFieldValue("template_id", record.schema);
                        }}
                        style={{
                          background:
                            values.template_id === record.schema
                              ? "#1890ff"
                              : "transparent",
                          color:
                            values.template_id === record.schema
                              ? "#fff"
                              : "#1890ff",

                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  ),
                },
                {
                  title: "Schema",
                  dataIndex: "schema",
                  key: "schema",
                  render: (_: string, record: any) => record.schema,
                },
                {
                  title: "Criado em",
                  align: "center",
                  dataIndex: "created_at",
                  key: "created_at",
                  sorter: (a: any, b: any) => {
                    const dateA = new Date(a.created_at).getTime();
                    const dateB = new Date(b.created_at).getTime();
                    return dateA - dateB;
                  },
                  defaultSortOrder: "descend",
                  render: (_: string, record: any) => {
                    return formatDate(record.created_at);
                  },
                },
                {
                  title: "Backup",
                  align: "center",
                  sorter: (a: any, b: any) => {
                    if (!a.backup_date && !b.backup_date) return 0;
                    if (!a.backup_date) return 1;
                    if (!b.backup_date) return -1;
                    const dateA = new Date(a.backup_date).getTime();
                    const dateB = new Date(b.backup_date).getTime();
                    return dateA - dateB;
                  },
                  render: (_: string, record: any) => {
                    return formatDateTime(record.backup_date);
                  },
                },
                {
                  title: "Acesso",
                  align: "center",

                  render: (_: string, record: any) => {
                    return record.crm_data?.x_studio_acesso;
                  },
                },
                {
                  title: "Estágio",
                  align: "center",

                  render: (_: string, record: any) => {
                    return CrmStageEnum.getName(
                      record.crm_data?.x_studio_estagio_projeto,
                    );
                  },
                },
                {
                  title: "Responsável",
                  align: "left",
                  render: (_: string, record: any) => {
                    return record.crm_data?.x_studio_responsavel_integracao;
                  },
                },
              ]}
              dataSource={filteredIntegrations}
              rowKey={(record: any) => record.schema}
              pagination={{ pageSize: 5 }}
              size="small"
              rowClassName={(record: any) =>
                values.template_id === record.schema ? "highlight" : ""
              }
            />
          </div>
        </div>
      )}

      {values.tp_pep !== TpPepEnum.PEC && (
        <>
          <div
            className={`form-row ${
              errors.create_user && touched.create_user ? "error" : ""
            }`}
          >
            <div className="form-label">
              <label>Criar usuário de banco:</label>
            </div>
            <div className="form-input">
              <Switch
                onChange={(value: boolean) =>
                  setFieldValue("create_user", value)
                }
                checked={values.create_user}
              />
            </div>
            {errors.create_user && (
              <div className="form-error">{errors.create_user}</div>
            )}
          </div>

          {!values.create_user && (
            <div
              className={`form-row ${
                errors.db_user && touched.db_user ? "error" : ""
              }`}
            >
              <div className="form-label">
                <label>Nome do usuário de banco de dados:</label>
              </div>
              <div className="form-input">
                <Input
                  onChange={({ target }) =>
                    setFieldValue("db_user", target.value)
                  }
                  value={values.db_user}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="form-info">
                Este usuário receberá permissão de acesso ao novo schema
              </div>
              {errors.db_user && (
                <div className="form-error">{errors.db_user}</div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
