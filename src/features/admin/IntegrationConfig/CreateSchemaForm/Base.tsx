import { useFormikContext } from "formik";
import { useMemo } from "react";

import { useAppSelector } from "src/store";
import { Input, Select } from "components/Inputs";
import Switch from "src/components/Switch";
import Table from "src/components/Table";
import { ICreateSchemaForm } from "./CreateSchemaForm";
import { TpPepEnum } from "src/models/TpPepEnum";
import { formatDate, formatDateTime } from "src/utils/date";

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
      <div
        className={`form-row ${
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
          errors.schema_name && touched.schema_name ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>PEP do cliente:</label>
        </div>
        <div className="form-input">
          <Select
            options={TpPepEnum.getList()}
            onChange={(value) => onChangeTpPep(value)}
            value={values.tp_pep}
          />
        </div>
        {errors.schema_name && (
          <div className="form-error">{errors.schema_name}</div>
        )}
      </div>

      {values.tp_pep !== TpPepEnum.PEC && (
        <>
          <div
            className={`form-row ${
              errors.is_cpoe && touched.is_cpoe ? "error" : ""
            }`}
          >
            <div className="form-label">
              <label>CPOE:</label>
            </div>
            <div className="form-input">
              <Switch
                onChange={(value: boolean) => setFieldValue("is_cpoe", value)}
                checked={values.is_cpoe}
              />
            </div>
            {errors.is_cpoe && (
              <div className="form-error">{errors.is_cpoe}</div>
            )}
          </div>

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

          <div
            className={`form-row ${
              errors.create_sqs && touched.create_sqs ? "error" : ""
            }`}
          >
            <div className="form-label">
              <label>Criar fila SQS:</label>
            </div>
            <div className="form-input">
              <Switch
                onChange={(value: boolean) =>
                  setFieldValue("create_sqs", value)
                }
                checked={values.create_sqs}
              />
            </div>
            {errors.create_sqs && (
              <div className="form-error">{errors.create_sqs}</div>
            )}
          </div>

          <div
            className={`form-row ${
              errors.create_logstream && touched.create_logstream ? "error" : ""
            }`}
          >
            <div className="form-label">
              <label>Criar logstream:</label>
            </div>
            <div className="form-input">
              <Switch
                onChange={(value: boolean) =>
                  setFieldValue("create_logstream", value)
                }
                checked={values.create_logstream}
              />
            </div>
            {errors.create_logstream && (
              <div className="form-error">{errors.create_logstream}</div>
            )}
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
                      title: "Ação",
                      key: "action",
                      render: (_: string, record: any) => (
                        <button
                          type="button"
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
                            border: "1px solid #1890ff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          {values.template_id === record.schema
                            ? "Selecionado"
                            : "Copiar"}
                        </button>
                      ),
                    },
                  ]}
                  dataSource={filteredIntegrations}
                  rowKey={(record: any) => record.schema}
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
