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

const KINDS = ["map-schedules-fasting", "map-schedules"];

function MemorySchedules() {
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
    "map-schedules-fasting": [
      {
        group: "Geral",
        questions: [
          {
            id: "map-schedules-fasting",
            label: "Lista com os horários de administração em Jejum:",
            type: "options-key-value-multiple",
            options: data["map-schedules"]?.value || [],
            optionsType: "key-value",
            required: false,
            style: { width: "100%" },
            help: "A lista de horários é retirada dos últimos 2 dias de prescrições e limitada em 500 registros.",
          },
        ],
      },
    ],
  };
  const values = {
    "map-schedules-fasting": data["map-schedules-fasting"]?.value,
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Horários</h1>
          <div className="page-header-legend">
            Configurações de horários de administração
          </div>
        </div>
      </PageHeader>

      <Row gutter={[16, 24]}>
        <Col xs={{ span: 24 }} lg={{ span: 12 }} xxl={{ span: 12 }}>
          <Card loading={loading} title="Horários de administração em Jejum">
            <CustomForm
              onSubmit={onSave}
              template={templates["map-schedules-fasting"]}
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

export default MemorySchedules;
