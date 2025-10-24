import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import BackTop from "components/BackTop";
import notification from "components/notification";
import Card from "components/Card";
import CustomForm from "components/Forms/CustomForm";
import { getErrorMessage } from "utils/errorHandler";

import {
  fetchGlobalMemory,
  updateGlobalMemory,
  reset,
} from "../GlobalMemorySlice";
import { PageHeader } from "styles/PageHeader.style";

const KINDS = ["n0-agent"];

export function GlobalMemoryNZero() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.admin.globalMemory.data);
  const status = useAppSelector((state) => state.admin.globalMemory.status);
  const statusSaving = useAppSelector(
    (state) => state.admin.globalMemory.single.status
  );
  const loading = status === "loading" || statusSaving === "loading";

  useEffect(() => {
    dispatch(
      fetchGlobalMemory({
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

  const onSave = (params: any) => {
    const values = params.values;

    const payload: any = {
      key: data["n0-agent"].key,
      kind: data["n0-agent"].kind,
      value: {
        n0prompt: values.n0prompt,
        n0formprompt: values.n0formprompt,
        bedrock_model: {
          model_id: values.bedrock_model__model_id,
          region_name: values.bedrock_model__region_name,
          guardrail_id: values.bedrock_model__guardrail_id,
          guardrail_version: values.bedrock_model__guardrail_version,
        },
        embedding_model: {
          model_id: values.embedding_model__model_id,
          region_name: values.embedding_model__region_name,
        },
        vector_index: {
          bucket_name: values.vector_index__bucket_name,
          index_name: values.vector_index__index_name,
          region_name: values.vector_index__region_name,
          max_articles: values.vector_index__max_articles,
        },
        knowledge_base: {
          bucket_name: values.knowledge_base__bucket_name,
          path: values.knowledge_base__path,
        },
      },
    };

    dispatch(updateGlobalMemory(payload)).then((response: any) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: t("success.generic"),
        });

        dispatch(
          fetchGlobalMemory({
            kinds: KINDS,
          })
        );
      }
    });
  };

  const templates = {
    "n0-agent": [
      {
        group: "NZero",
        questions: [
          {
            id: "n0prompt",
            label: "Prompt NZero",
            type: "textarea",
          },
        ],
      },
      {
        group: "NZero Form",
        questions: [
          {
            id: "n0formprompt",
            label: "Prompt NZero Form",
            type: "textarea",
          },
        ],
      },
      {
        group: "Configurações",
        questions: [
          {
            id: "bedrock_model__model_id",
            label: "Bedrock model",
            type: "plaintext",
          },
          {
            id: "bedrock_model__region_name",
            label: "Bedrock model region",
            type: "plaintext",
          },
          {
            id: "bedrock_model__guardrail_id",
            label: "Guardrail ID",
            type: "plaintext",
          },
          {
            id: "bedrock_model__guardrail_version",
            label: "Guardrail Version",
            type: "plaintext",
          },
          {
            id: "embedding_model__model_id",
            label: "Embedding model",
            type: "plaintext",
          },
          {
            id: "embedding_model__region_name",
            label: "Embedding model region",
            type: "plaintext",
          },
          {
            id: "vector_index__bucket_name",
            label: "S3Vector bucket",
            type: "plaintext",
          },
          {
            id: "vector_index__index_name",
            label: "S3Vector index",
            type: "plaintext",
          },
          {
            id: "vector_index__region_name",
            label: "S3Vector region",
            type: "plaintext",
          },
          {
            id: "vector_index__max_articles",
            label: "Número máximo de artigos buscados",
            type: "number",
          },
          {
            id: "knowledge_base__bucket_name",
            label: "Knowledge Base bucket",
            type: "plaintext",
          },
          {
            id: "knowledge_base__path",
            label: "Knowledge Base path",
            type: "plaintext",
          },
        ],
      },
    ],
  };
  const values = {
    n0prompt: data["n0-agent"]?.value.n0prompt,
    n0formprompt: data["n0-agent"]?.value.n0formprompt,
    bedrock_model__model_id: data["n0-agent"]?.value.bedrock_model.model_id,
    bedrock_model__region_name:
      data["n0-agent"]?.value.bedrock_model.region_name,
    bedrock_model__guardrail_id:
      data["n0-agent"]?.value.bedrock_model.guardrail_id,
    bedrock_model__guardrail_version:
      data["n0-agent"]?.value.bedrock_model.guardrail_version,
    embedding_model__model_id: data["n0-agent"]?.value.embedding_model.model_id,
    embedding_model__region_name:
      data["n0-agent"]?.value.embedding_model.region_name,
    vector_index__bucket_name: data["n0-agent"]?.value.vector_index.bucket_name,
    vector_index__index_name: data["n0-agent"]?.value.vector_index.index_name,
    vector_index__region_name: data["n0-agent"]?.value.vector_index.region_name,
    vector_index__max_articles:
      data["n0-agent"]?.value.vector_index.max_articles,
    knowledge_base__bucket_name:
      data["n0-agent"]?.value.knowledge_base.bucket_name,
    knowledge_base__path: data["n0-agent"]?.value.knowledge_base.path,
  };

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">Configuração NZero</h1>
          <div className="page-header-legend">
            Configurações gerais do Agente NZero
          </div>
        </div>
      </PageHeader>

      <Row gutter={[16, 24]}>
        <Col xs={{ span: 24 }} lg={{ span: 12 }} xxl={{ span: 12 }}>
          <Card loading={loading} title="NZero">
            <CustomForm
              onSubmit={onSave}
              onCancel={null}
              onChange={() => {}}
              template={templates["n0-agent"]}
              isSaving={loading}
              values={values}
              startClosed={false}
              horizontal={false}
              btnSaveText="Salvar"
            />
          </Card>
        </Col>
      </Row>

      <BackTop />
    </>
  );
}
