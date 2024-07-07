import React, { useState } from "react";
import { Alert, Tag } from "antd";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { ExclamationCircleFilled } from "@ant-design/icons";

import RichTextView from "components/RichTextView";
import Tooltip from "components/Tooltip";
import { DrugAlertsCollapse } from "../PrescriptionDrug.style";
import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import { Checkbox } from "components/Inputs";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";
import { formatDate } from "utils/date";

import { Form } from "styles/Form.style";

export default function CheckSummary({
  prescription,
  open,
  setOpen,
  checkScreening,
  hasCpoe,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    accept: Yup.boolean().oneOf(
      [true],
      "Você precisa aceitar para confirmar a checagem"
    ),
  });
  const initialValues = {
    accept: false,
  };

  let highRiskAlerts = [];

  if (
    prescription?.content?.alertsList &&
    prescription.content.alertsList.length
  ) {
    highRiskAlerts = prescription.content.alertsList.filter(
      (a) => a.level === "high"
    );
  }

  if (highRiskAlerts.length === 0) {
    return <p>Nenhum alerta de alto risco encontrado.</p>;
  }

  const getHeader = (item) => {
    return (
      <div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {item.drugName}
        </div>
      </div>
    );
  };

  const getExtra = (item) => {
    return (
      <div>
        <Tooltip title="Dose">
          <Tag style={{ fontSize: "11px" }}>
            {" "}
            {item.dose}{" "}
            {item.measureUnit?.label
              ? item.measureUnit.label
              : item.measureUnit.value}
          </Tag>
        </Tooltip>
        <Tooltip title="Frequência">
          <Tag style={{ fontSize: "11px" }}>
            {item.frequency?.label
              ? item.frequency.label
              : item.frequency.value}
          </Tag>
        </Tooltip>
        <Tooltip title="Via">
          <Tag style={{ fontSize: "11px", marginRight: 0 }}>{item.route}</Tag>
        </Tooltip>
      </div>
    );
  };

  const onSave = (params) => {
    setLoading(true);

    checkScreening(prescription.content.idPrescription, "s")
      .then(() => {
        setLoading(false);
        setOpen(false);
        notification.success({
          message: "Checagem efetuada com sucesso!",
        });
      })
      .catch((err) => {
        setLoading(false);
        console.error("error", err);
        notification.error({
          message: t("error.title"),
          description: getErrorMessageFromException(err, t),
        });
      });
  };

  const groups = {};
  highRiskAlerts.forEach((a) => {
    if (groups[a.idPrescriptionDrug]) {
      groups[a.idPrescriptionDrug]["alerts"].push(a);
    } else {
      groups[a.idPrescriptionDrug] = {
        ...a,
        alerts: [a],
      };
    }
  });

  const dateGroups = {};
  if (prescription?.content.agg && !hasCpoe) {
    Object.keys(groups).forEach((g) => {
      const dt = groups[g].expire
        ? groups[g].expire.substr(0, 10)
        : groups[g].date.substr(0, 10);

      if (dateGroups[dt]) {
        dateGroups[dt].push(groups[g]);
      } else {
        dateGroups[dt] = [groups[g]];
      }
    });
  } else {
    dateGroups["uniq"] = [];
    Object.keys(groups).forEach((g) => {
      dateGroups["uniq"].push(groups[g]);
    });
  }

  const getItemsByGroup = (g) => {
    return {
      key: g.idPrescriptionDrug,
      label: getHeader(g),
      extra: getExtra(g),
      children: (
        <>
          {g.alerts.map((a, index) => (
            <Alert
              key={index}
              type="error"
              message={<RichTextView text={a.text} />}
              style={{ marginTop: "5px", background: "#fff" }}
              showIcon
            />
          ))}
        </>
      ),
    };
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={onSave}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors, values, setFieldValue }) => (
        <DefaultModal
          open={open}
          width={900}
          centered
          destroyOnClose
          onCancel={() => setOpen(false)}
          onOk={handleSubmit}
          okText="Confirmar"
          cancelText={t("actions.cancel")}
          confirmLoading={loading}
          okButtonProps={{
            disabled: loading,
          }}
          cancelButtonProps={{
            disabled: loading,
          }}
        >
          <header>
            <Heading margin="0 0 11px" style={{ fontSize: "1.125rem" }}>
              <ExclamationCircleFilled
                style={{
                  marginRight: "5px",
                  color: "#faad14",
                  fontSize: "1.125rem",
                }}
              />{" "}
              Confirmar a checagem
            </Heading>
          </header>
          <p>
            Revise os alertas de <strong>Nível Alto</strong> e confirme para
            finalizar a checagem.
          </p>

          <Form>
            <div
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
                padding: "0 15px",
                background: "#fafafa",
                borderRadius: "8px",
              }}
              className="custom-scroll-danger"
            >
              {Object.keys(dateGroups)
                .sort()
                .map((dt, index) => (
                  <React.Fragment key={dt}>
                    {dt !== "uniq" && (
                      <div
                        style={{
                          position: "sticky",
                          top: 0,
                          left: 0,
                          fontSize: "16px",
                          fontWeight: 600,
                          marginBottom: "10px",
                          marginTop: index > 0 ? "20px" : 0,
                          padding: "0 4px",
                          zIndex: 99,
                          background: "#fafafa",
                          color: "#2e3c5a",
                        }}
                      >
                        Fim da vigência: {formatDate(dt)}
                      </div>
                    )}

                    <DrugAlertsCollapse
                      expandIconPosition="start"
                      items={dateGroups[dt].map((group) =>
                        getItemsByGroup(group)
                      )}
                      defaultActiveKey={dateGroups[dt].map(
                        (i) => i.idPrescriptionDrug
                      )}
                      style={{ marginBottom: "10px" }}
                    />
                  </React.Fragment>
                ))}
            </div>
            <div className={`form-row`}>
              <div className="form-input-checkbox-single">
                <Checkbox
                  checked={values.accept}
                  value={values.accept}
                  onChange={({ target }) =>
                    setFieldValue("accept", !target.value)
                  }
                >
                  Estou ciente dos alertas apresentados.
                </Checkbox>
              </div>
              {errors.accept && (
                <div className="form-error">{errors.accept}</div>
              )}
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}
