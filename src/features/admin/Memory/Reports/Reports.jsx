import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col } from "antd";

import BackTop from "components/BackTop";
import notification from "components/notification";
import Card from "components/Card";
import CustomForm from "components/Forms/CustomForm";
import { getErrorMessage } from "utils/errorHandler";

import { fetchMemory, updateMemory, reset } from "../MemorySlice";
import { PageHeader } from "styles/PageHeader.style";

const KINDS = ["reports", "reports-internal", "admission-reports"];

function MemoryReports() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.admin.memory.data);
  const status = useSelector((state) => state.admin.memory.status);
  const statusSaving = useSelector((state) => state.admin.memory.single.status);
  const loading = status === "loading" || statusSaving === "loading";

  useEffect(() => {
    dispatch(
      fetchMemory({
        kinds: KINDS,
      })
    );

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (status === "failed") {
    notification.error({
      message: t("error.title"),
      description: t("error.description"),
    });
  }

  const onSave = (params) => {
    const values = {};
    Object.keys(params.values).forEach((k) => {
      values.kind = k;
      values.value = params.values[k];
      values.unique = true;
    });

    dispatch(updateMemory(values)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: t("success.generic"),
        });
        dispatch(fetchMemory({ kinds: KINDS }));
      }
    });
  };

  const templates = {
    "reports-internal": [
      {
        group: "Geral",
        questions: [
          {
            id: "reports-internal",
            label: "",
            type: "options-key-value-multiple",
            options: [
              {
                id: "PATIENT_DAY",
                value: "Pacientes-Dia",
              },
              {
                id: "PRESCRIPTION",
                value: "Prescrições",
              },
              {
                id: "INTERVENTION",
                value: "Intervenções",
              },
              {
                id: "PRESCRIPTION_AUDIT",
                value: "Auditoria",
              },
            ],
            optionsType: "key-value",
            style: { width: "100%" },
          },
        ],
      },
    ],
    reports: [
      {
        group: "Geral",
        questions: [
          {
            id: "reports",
            label: "Lista de relatórios (JSON):",
            type: "json",
            required: true,
          },
        ],
      },
    ],
    "admission-reports": [
      {
        group: "Geral",
        questions: [
          {
            id: "admission-reports",
            label: "Lista de relatórios exibidos no card do paciente (JSON):",
            type: "json",
            required: true,
          },
        ],
      },
    ],
  };
  const values = {
    reports: data["reports"]?.value,
    "reports-internal": data["reports-internal"]?.value,
    "admission-reports": data["admission-reports"]?.value,
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Relatórios</h1>
          <div className="page-header-legend">Configuração de relatórios</div>
        </div>
      </PageHeader>

      <Row gutter={[16, 24]}>
        <Col xs={{ span: 24 }} lg={{ span: 12 }} xxl={{ span: 12 }}>
          <Card loading={loading} title="Relatórios Internos" type="inner">
            <CustomForm
              onSubmit={onSave}
              template={templates["reports-internal"]}
              isSaving={loading}
              values={values}
            />
          </Card>
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 12 }} xxl={{ span: 12 }}></Col>

        <Col xs={{ span: 24 }} lg={{ span: 12 }} xxl={{ span: 12 }}>
          <Card loading={loading} title="Relatórios Externos" type="inner">
            <CustomForm
              onSubmit={onSave}
              template={templates["reports"]}
              isSaving={loading}
              values={values}
            />
          </Card>
        </Col>

        <Col xs={{ span: 24 }} lg={{ span: 12 }} xxl={{ span: 12 }}>
          <Card loading={loading} title="Relatórios do Paciente" type="inner">
            <CustomForm
              onSubmit={onSave}
              template={templates["admission-reports"]}
              isSaving={loading}
              values={values}
            />
          </Card>
        </Col>
      </Row>

      <BackTop />
    </>
  );
}

export default MemoryReports;
