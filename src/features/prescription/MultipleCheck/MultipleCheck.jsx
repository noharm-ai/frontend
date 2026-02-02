import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckCircleOutlined, CheckOutlined } from "@ant-design/icons";
import { Result, Alert } from "antd";

import DefaultModal from "components/Modal";
import { CardTable } from "components/Table";
import Heading from "components/Heading";
import DrugAlertLevelTag from "components/DrugAlertLevelTag";
import Tooltip from "components/Tooltip";
import Progress from "components/Progress";
import {
  fastCheckPrescription,
  setSelectedRows,
  setSelectedRowsActive,
} from "../PrescriptionSlice";
import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import { multipleCheckUpdateStatusThunk } from "store/ducks/prescriptions/thunk";

import { Form } from "styles/Form.style";

export default function MultipleCheck({ open, setOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector((state) => state.prescriptionv2.multipleCheck.list);
  const [checkStatus, setCheckStatus] = useState("idle");
  const [checkErrorMessage, setCheckErrorMessage] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState("idle");

  useEffect(() => {
    if (!open) {
      setCheckStatus("idle");
      setProgressPercentage(0);
      setCheckErrorMessage([]);
    }
  }, [open]);

  const columns = [
    {
      title: "Atendimento",
      align: "center",
      render: (entry, record) => {
        return (
          <Tooltip title="Clique para visualizar a Prescrição-Dia do paciente">
            <a
              href={`/prescricao/${record.idPrescription}`}
              rel="noreferrer"
              target="_blank"
            >
              {record.admissionNumber}
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: "Idade",
      align: "center",
      render: (entry, record) => record.age,
    },
    {
      title: "Exames Alterados",
      align: "center",
      render: (entry, record) => record.alertExams,
    },
    {
      title: "Intervenções Pendentes",
      align: "center",
      render: (entry, record) => record.interventions,
    },
    {
      title: "Diferentes",
      align: "center",
      render: (entry, record) => record.diff,
    },
    {
      title: "Alertas",
      align: "center",
      render: (entry, record) => record.alerts,
    },
    {
      title: (
        <Tooltip
          title="Exibe o maior nível entre os alertas do paciente"
          underline
        >
          Alertas: Maior Nível
        </Tooltip>
      ),
      align: "center",
      render: (entry, record) => {
        if (record.alerts === 0) {
          return "-";
        }

        return (
          <DrugAlertLevelTag
            levels={[record.alertLevel]}
            count={record.alerts}
            allergy={record.allergy}
            showDescription
            showTooltip={false}
          />
        );
      },
    },
    {
      title: "Escore Global",
      align: "center",
      render: (entry, record) => record.globalScore,
    },
  ];

  const checkAll = async () => {
    setCheckStatus("loading");

    const progressStep = 100 / list.length;
    let progressTotal = 0;
    const errors = [];
    const checkedPrescriptions = [];

    for (let i = 0; i < list.length; i++) {
      const idPrescription = list[i].idPrescription;

      const response = await dispatch(
        fastCheckPrescription({
          idPrescription,
        })
      );

      if (response.payload?.status !== "success") {
        errors.push(
          `Prescrição ${idPrescription}: ${getErrorMessage(response, t)}`
        );
      } else {
        checkedPrescriptions.push(idPrescription);
      }

      if (i === list.length - 1) {
        progressTotal = 100;
      } else {
        progressTotal += progressStep;
      }

      setProgressPercentage(progressTotal);
    }

    dispatch(multipleCheckUpdateStatusThunk(checkedPrescriptions, "s"));
    dispatch(setSelectedRows([]));
    dispatch(setSelectedRowsActive(false));

    if (errors.length === 0) {
      setTimeout(() => {
        setCheckStatus("succeeded");
        setCheckErrorMessage([]);
      }, 1000);
    } else {
      setCheckStatus("error");
      setCheckErrorMessage(errors);

      notification.error({
        message: "Não foi possível checar todas as prescrições.",
      });
    }
  };

  return (
    <DefaultModal
      open={open}
      width={1000}
      centered
      destroyOnHidden
      onCancel={() => setOpen(false)}
      onOk={checkAll}
      okText="Checar selecionados"
      cancelText={
        checkStatus === "succeeded" || checkStatus === "error"
          ? t("actions.close")
          : t("actions.cancel")
      }
      confirmLoading={checkStatus === "loading"}
      okButtonProps={{
        disabled: checkStatus === "succeeded" || checkStatus === "error",
        icon: <CheckOutlined />,
      }}
      maskClosable={false}
    >
      <Heading $margin="0 0 20px" style={{ fontSize: "1.2rem" }}>
        <CheckCircleOutlined
          style={{
            marginRight: "5px",
            color: "#7ebe9a",
            fontSize: "1.2rem",
          }}
        />{" "}
        Checagem Rápida
      </Heading>

      {checkStatus === "idle" && (
        <>
          <p>Os registros abaixo serão checados:</p>

          <CardTable
            bordered
            columns={columns}
            rowKey="idPrescription"
            dataSource={list}
            pagination={false}
            size="small"
            scroll={{
              y: 400,
            }}
          />
          <Form>
            <div className={`form-row`}>
              <div
                className="form-input-checkbox-single"
                style={{ padding: "0.5rem 1rem", marginTop: "20px" }}
              >
                *Ao confirmar, você declara ciência da ação de checagem rápida,
                sem análise detalhada da situação atual do paciente.
              </div>
            </div>
          </Form>
        </>
      )}

      {(checkStatus === "loading" || checkStatus === "succeeded") && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Progress
              type="circle"
              percent={Math.round(progressPercentage)}
              strokeColor={{
                "0%": "rgb(112, 189, 196)",
                "100%": "rgb(126, 190, 154)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              marginTop: "15px",
              marginBottom: "20px",
            }}
          >
            <Heading $size="16px">
              {checkStatus === "loading"
                ? "Efetuando checagem..."
                : "Checagem finalizada com sucesso"}
            </Heading>
          </div>
        </>
      )}

      {checkStatus === "error" && (
        <Result
          status="error"
          title="Não foi possível checar todas as prescrições."
          subTitle="Abaixo a lista de prescrições em que a checagem não foi efetuada:"
        >
          {checkErrorMessage.map((e, i) => (
            <Alert
              message={e}
              type="error"
              key={i}
              style={{ marginTop: "10px" }}
            />
          ))}
        </Result>
      )}
    </DefaultModal>
  );
}
