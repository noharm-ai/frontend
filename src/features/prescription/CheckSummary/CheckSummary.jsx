import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Tag } from "antd";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import {
  ExclamationCircleFilled,
  CheckOutlined,
  WarningOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from "@ant-design/icons";

import RichTextView from "components/RichTextView";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import notification from "components/notification";
import Button from "components/Button";
import { getErrorMessageFromException } from "utils/errorHandler";
import { formatDate } from "utils/date";
import { setCheckSummary } from "../PrescriptionSlice";
import AlertTags from "components/Screening/PrescriptionDrug/components/AlertTags";

import { Form } from "styles/Form.style";
import { DrugAlertsCollapse } from "components/Screening/PrescriptionDrug/PrescriptionDrug.style";
import { CheckSummaryContainer } from "./CheckSummary.style";

export default function CheckSummary({
  hasCpoe,
  checkScreening,
  headers,
  alerts,
  interventions,
}) {
  const dispatch = useDispatch();
  const prescription = useSelector(
    (state) => state.prescriptionv2.checkSummary.prescription
  );
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState([]);

  const validationSchema = Yup.object().shape({
    accept: Yup.boolean().oneOf(
      [true],
      "Você precisa aceitar para confirmar a checagem"
    ),
  });

  if (!prescription) {
    return null;
  }

  const activeKeyChange = (keys) => {
    setActiveKey(keys);
  };

  const toggleAll = (groups) => {
    if (activeKey.length) {
      setActiveKey([]);
    } else {
      const keys = [];
      Object.keys(groups).forEach((dt) => {
        groups[dt].forEach((i) => {
          keys.push(i.idPrescriptionDrug);
        });
      });

      setActiveKey(keys);
    }
  };

  let highRiskAlerts = [];

  if (alerts && alerts.length) {
    if (prescription.agg) {
      highRiskAlerts = alerts.filter((a) => a.level === "high");
    } else {
      highRiskAlerts = alerts.filter(
        (a) =>
          a.level === "high" && a.idPrescription === prescription.idPrescription
      );
    }
  }

  const initialValues = {
    accept: true,
  };

  const onCancel = () => {
    setLoading(false);
    dispatch(setCheckSummary(null));
  };

  const getHeader = (item) => {
    return (
      <div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {item.drugName}
        </div>
        {getExtra(item)}
      </div>
    );
  };

  const getExtra = (item) => {
    return (
      <div style={{ paddingLeft: "5px" }}>
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

  const onSave = () => {
    setLoading(true);
    const auditAlerts = highRiskAlerts.map(({ idPrescriptionDrug, type }) => ({
      idPrescriptionDrug,
      type,
    }));

    checkScreening(prescription.idPrescription, "s", {
      alerts: auditAlerts,
    })
      .then(() => {
        setLoading(false);
        dispatch(setCheckSummary(null));
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
  if (prescription?.agg && !hasCpoe) {
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

  const AlertStatus = ({ idPrescription, idPrescriptionDrug }) => {
    const header = headers[idPrescription];
    const intervention = interventions.find(
      (i) => i.id === idPrescriptionDrug && i.status !== "0"
    );

    return (
      <>
        {header && header.status === "s" && (
          <div style={{ marginTop: "15px" }}>
            <CheckOutlined
              style={{ fontSize: "18px", color: "#52c41a", marginRight: "5px" }}
            />{" "}
            {header.user ? <>Checado por {header.user}</> : <>Checado</>}
          </div>
        )}
        {intervention && (
          <div style={{ marginTop: "15px" }}>
            <WarningOutlined style={{ fontSize: "18px", marginRight: "5px" }} />{" "}
            {intervention.user ? (
              <>Intervenção registrada por {intervention.user}</>
            ) : (
              <>Intervenção registrada</>
            )}
          </div>
        )}
      </>
    );
  };

  const getItemsByGroup = (g) => {
    return {
      key: g.idPrescriptionDrug,
      label: getHeader(g),
      extra: <AlertTags prescription={g} itemAlerts={g.alerts} bag={null} />,
      showArrow: false,
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
          <AlertStatus
            idPrescription={hasCpoe ? g.cpoe : g.idPrescription}
            idPrescriptionDrug={g.idPrescriptionDrug}
          />
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
          open={prescription}
          width={highRiskAlerts.length > 0 ? 900 : 350}
          centered
          destroyOnClose
          onCancel={() => onCancel()}
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
          maskClosable={false}
        >
          <header>
            <Heading margin="0 0 11px" style={{ fontSize: "1.2rem" }}>
              <ExclamationCircleFilled
                style={{
                  marginRight: "5px",
                  color: "#faad14",
                  fontSize: "1.2rem",
                }}
              />{" "}
              Confirmar a checagem
            </Heading>
          </header>
          {highRiskAlerts.length > 0 && (
            <>
              <p>
                Revise os alertas de <strong>Nível Alto</strong> e confirme para
                finalizar a checagem.
              </p>

              <Form>
                <CheckSummaryContainer className="custom-scroll-danger">
                  {Object.keys(dateGroups)
                    .sort()
                    .map((dt, index) => (
                      <React.Fragment key={dt}>
                        {dt !== "uniq" && (
                          <div
                            className="group-header"
                            style={{
                              marginTop: index > 0 ? "20px" : 0,
                            }}
                            onClick={() => toggleAll(dateGroups)}
                          >
                            <Tooltip
                              title={
                                activeKey.length
                                  ? "Recolher todos"
                                  : "Expandir todos"
                              }
                            >
                              <Button
                                size="small"
                                type="link"
                                danger
                                className="expand-button"
                                onClick={() => toggleAll(dateGroups)}
                                icon={
                                  activeKey.length ? (
                                    <MinusSquareOutlined />
                                  ) : (
                                    <PlusSquareOutlined />
                                  )
                                }
                              />
                            </Tooltip>
                            Fim da vigência: {formatDate(dt)}
                          </div>
                        )}

                        <DrugAlertsCollapse
                          showArrow={false}
                          items={dateGroups[dt].map((group) =>
                            getItemsByGroup(group)
                          )}
                          style={{ marginBottom: "10px" }}
                          activeKey={activeKey}
                          onChange={activeKeyChange}
                        />
                      </React.Fragment>
                    ))}
                </CheckSummaryContainer>
                <div className={`form-row`}>
                  <div
                    className="form-input-checkbox-single"
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    *Ao confirmar, você declara ciência dos alertas
                    apresentados.
                  </div>
                </div>
              </Form>
            </>
          )}
        </DefaultModal>
      )}
    </Formik>
  );
}
