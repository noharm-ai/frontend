import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col } from "antd";

import BackTop from "components/BackTop";
import notification from "components/notification";
import Card from "components/Card";
import CustomForm from "components/Forms/CustomForm";
import { getErrorMessage } from "utils/errorHandler";
import Feature from "models/Feature";

import { fetchMemory, updateMemory, reset } from "../MemorySlice";
import { PageHeader } from "styles/PageHeader.style";

const KINDS = ["features"];

function MemoryFeatures() {
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
      }),
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
    features: [
      {
        group: "Geral",
        questions: [
          {
            id: "features",
            label: "",
            type: "checkbox",
            options: Feature.getFeatures(t),
          },
        ],
      },
    ],
  };
  const values = {
    features: data["features"]?.value,
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Features</h1>
          <div className="page-header-legend">
            Habilita/Desabilita funcionalidades da NoHarm
          </div>
        </div>
      </PageHeader>

      <Row gutter={[16, 24]}>
        <Col xs={{ span: 24 }} lg={{ span: 12 }} xxl={{ span: 12 }}>
          <Card loading={loading} title="Features Disponíveis">
            <CustomForm
              onSubmit={onSave}
              template={templates["features"]}
              isSaving={loading}
              values={values}
            />
          </Card>
          <p>
            *Para ativar as alterações, o usuário deve sair e efetuar login
            novamente na NoHarm.
          </p>
        </Col>
      </Row>

      <BackTop />
    </>
  );
}

export default MemoryFeatures;
