import { useRef } from "react";
import { useFormikContext } from "formik";
import { DownOutlined } from "@ant-design/icons";

import { useAppSelector } from "src/store";
import { Input, Select, Textarea } from "components/Inputs";
import Dropdown from "components/Dropdown";
import { MenuProps, Space } from "antd";
import { IReportFormBaseFields } from "./ReportForm";

interface SavedQuery {
  title: string;
  sql_report: string;
}

export function MainTab() {
  const previewIntentRef = useRef(false);
  const originalValues = useRef<{ name: string; sql: string }>({
    name: "",
    sql: "",
  });
  const savedQueries = useAppSelector(
    (state) => state.admin.report.saved_queries
  );
  const { values, errors, touched, setFieldValue } =
    useFormikContext<IReportFormBaseFields>();

  const activeOptions = [
    {
      value: true,
      label: "Ativo",
    },
    {
      value: false,
      label: "Inativo",
    },
  ];

  const handlePreviewQuery = (query: SavedQuery) => {
    if (!previewIntentRef.current) {
      originalValues.current = {
        name: values.name || "",
        sql: values.sql || "",
      };
      previewIntentRef.current = true;
    }
    setFieldValue("name", query.title);
    setFieldValue("sql", query.sql_report);
  };

  const handleResetPreview = () => {
    if (previewIntentRef.current) {
      setFieldValue("name", originalValues.current.name);
      setFieldValue("sql", originalValues.current.sql);
      previewIntentRef.current = false;
    }
  };

  const handleSelectQuery = (query: SavedQuery) => {
    setFieldValue("name", query.title);
    setFieldValue("sql", query.sql_report);
    previewIntentRef.current = false;
  };

  const dropdownItems: MenuProps["items"] = savedQueries.map(
    (query: SavedQuery, index: number) => ({
      key: index,
      label: (
        <div
          onMouseEnter={() => handlePreviewQuery(query)}
          onClick={() => handleSelectQuery(query)}
          style={{ cursor: "pointer", padding: "8px 0" }}
        >
          <div style={{ fontWeight: 500, marginBottom: "4px" }}>
            {query.title}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              maxWidth: "300px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {query.sql_report?.substring(0, 100)}
            {query.sql_report?.length > 100 && "..."}
          </div>
        </div>
      ),
    })
  );

  return (
    <>
      <div className={`form-row ${errors.name && touched.name ? "error" : ""}`}>
        <div className="form-label-actions">
          <label>Nome:</label>
          <Dropdown
            menu={{ items: dropdownItems }}
            placement="bottomLeft"
            onOpenChange={(open) => {
              if (!open) {
                handleResetPreview();
              }
            }}
          >
            <Space>
              <a onClick={(e) => e.preventDefault()}>
                Vanna Reports <DownOutlined />
              </a>
            </Space>
          </Dropdown>
        </div>
        <div className="form-input">
          <Input
            onChange={({ target }) => setFieldValue("name", target.value)}
            value={values.name}
            maxLength={150}
          />
        </div>
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div
        className={`form-row ${
          errors.description && touched.description ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Descrição:</label>
        </div>
        <div className="form-input">
          <Textarea
            onChange={({ target }) =>
              setFieldValue("description", target.value)
            }
            value={values.description}
            maxLength={250}
          />
        </div>
        {errors.description && (
          <div className="form-error">{errors.description}</div>
        )}
      </div>

      <div className={`form-row ${errors.sql && touched.sql ? "error" : ""}`}>
        <div className="form-label-actions">
          <label>SQL:</label>
        </div>
        <div className="form-input">
          <Textarea
            onChange={({ target }) => setFieldValue("sql", target.value)}
            value={values.sql}
            rows={10}
          />
        </div>
        {errors.sql && <div className="form-error">{errors.sql}</div>}
      </div>

      <div
        className={`form-row ${errors.active && touched.active ? "error" : ""}`}
      >
        <div className="form-label">
          <label>Status:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="label"
            showSearch
            value={values.active}
            onChange={(value) => setFieldValue("active", value)}
            allowClear
            options={activeOptions}
          />
        </div>
        {errors.active && <div className="form-error">{errors.active}</div>}
      </div>
    </>
  );
}
