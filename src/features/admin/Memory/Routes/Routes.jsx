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

const KINDS = ["map-routes", "map-iv", "map-tube"];

function MemoryRoutes() {
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
    "map-tube": [
      {
        group: "Geral",
        questions: [
          {
            id: "map-tube",
            label: "Lista com as vias que ativam a flag SONDA:",
            type: "options-key-value-multiple",
            options: data["map-routes"]?.value || [],
            optionsType: "key-value",
            required: true,
            style: { width: "100%" },
          },
        ],
      },
    ],
    "map-iv": [
      {
        group: "Geral",
        questions: [
          {
            id: "map-iv",
            label: "Lista com as vias que ativam a flag INTRAVENOSA:",
            type: "options-key-value-multiple",
            options: data["map-routes"]?.value || [],
            optionsType: "key-value",
            required: true,
            style: { width: "100%" },
          },
        ],
      },
    ],
  };
  const values = {
    "map-tube": data["map-tube"]?.value,
    "map-iv": data["map-iv"]?.value,
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Vias</h1>
          <div className="page-header-legend">Configurações das vias</div>
        </div>
      </PageHeader>

      <Row gutter={[16, 24]}>
        <Col xs={{ span: 24 }} lg={{ span: 8 }} xxl={{ span: 8 }}>
          <Card loading={loading} title="Sonda">
            <CustomForm
              onSubmit={onSave}
              template={templates["map-tube"]}
              isSaving={loading}
              values={values}
            />
          </Card>
        </Col>

        <Col xs={{ span: 24 }} lg={{ span: 8 }} xxl={{ span: 8 }}>
          <Card loading={loading} title="Intravenosa">
            <CustomForm
              onSubmit={onSave}
              template={templates["map-iv"]}
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

export default MemoryRoutes;
