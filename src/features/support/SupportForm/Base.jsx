import React from "react";
import { useSelector } from "react-redux";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Upload, notification, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { Select, Input } from "components/Inputs";
import Editor from "components/Editor";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import IntegrationStatus from "models/IntegrationStatus";

function BaseForm() {
  const { t } = useTranslation();
  const integrationStatus = useSelector(
    (state) => state.app.config.integrationStatus
  );
  const { values, errors, touched, setFieldValue } = useFormikContext();

  const uploadProps = {
    onRemove: (file) => {
      const index = values.fileList.indexOf(file);
      const newFileList = values.fileList.slice();
      newFileList.splice(index, 1);
      setFieldValue("fileList", newFileList);
    },
    beforeUpload: (file) => {
      if (values.fileList.length >= 2) {
        notification.error({ message: "Máximo de arquivos anexos atingido." });
      } else {
        setFieldValue("fileList", [...values.fileList, file]);
      }

      return false;
    },
    listType: "picture",
    multiple: true,
    accept: "image/*, .doc, .docx, .pdf",
    fileList: values.fileList,
  };

  return (
    <>
      <div
        className={`form-row ${
          errors.category && touched.category ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label style={{ paddingBottom: "5px", display: "block" }}>
            <Tooltip
              title="Selecione o “Tipo de chamado” da forma que
                mais se parecer com sua demanda. Isso também irá auxiliar a darmos o
                correto direcionamento ao seu chamado."
              underline
            >
              {t("labels.ticketType")}:
            </Tooltip>
          </label>
        </div>
        <div className="form-input">
          <Select
            onChange={(value) => setFieldValue("category", value)}
            value={values.category}
            optionFilterProp="children"
            showSearch
            placeholder="Selecione"
            status={
              values.category === "Integração fora do ar" ? "warning" : ""
            }
          >
            <Select.Option key={0} value="Dúvida">
              Dúvida
            </Select.Option>
            <Select.Option key={1} value="Erro">
              Erro
            </Select.Option>
            <Select.Option key={2} value="Integração fora do ar">
              Integração fora do ar
            </Select.Option>
            <Select.Option key={3} value="Solicitação">
              Solicitação
            </Select.Option>
            <Select.Option key={4} value="Sugestão">
              Sugestão
            </Select.Option>
            {integrationStatus === IntegrationStatus.INTEGRATION && (
              <Select.Option key={5} value="Validação">
                Validação
              </Select.Option>
            )}
          </Select>
        </div>
        <div className="form-info">
          {values.category === "Dúvida" && (
            <>
              Dúvidas sobre uso ou configuração da plataforma, tanto na parte a
              nível de sistema, quanto na área de farmácia. Sempre consulte
              nossa base de conhecimento antes, caso não ache sua pergunta, abra
              o chamado.
            </>
          )}

          {values.category === "Erro" && (
            <>
              Erro devido a algum comportamento inesperado da plataforma, como
              tela em branco, mensagem de erro ou outro problema na interface.
              Ou relacionado a dados incorretos ou faltando, como em
              prescrições, exames, ou relatórios.
            </>
          )}

          {values.category === "Integração fora do ar" && (
            <span style={{ color: "#c68609" }}>
              Nenhuma prescrição aparecendo na plataforma, acesso indisponível,
              ou problemas na integração de retorno.
            </span>
          )}

          {values.category === "Solicitação" && (
            <>
              Solicitação de ajustes na configuração ou inclusão de novos itens
              na plataforma, como setores, relatórios, documentos de evolução,
              entre outros.
            </>
          )}

          {values.category === "Sugestão" && (
            <>
              Sugestão de melhorias ou ajustes na plataforma, como novas
              funcionalidades ou relatórios personalizados - para esse tipo, não
              temos prazo para atendimento da demanda (backlog).
            </>
          )}
          {values.category === "Validação" && (
            <>
              Demandas referentes ao processo de validação dos dados de
              curadoria (Orientação de Validação), realizado durante a
              implantação da plataforma. Não utilizar após período de validação.
            </>
          )}
        </div>
        {errors.category && touched.category && (
          <div className="form-error">{errors.category}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.category && touched.category ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>{t("labels.subject")}:</label>
        </div>
        <div className="form-input">
          <Input
            placeholder="Ex: Erro ao checar prescrição"
            value={values.title}
            onChange={({ target }) => setFieldValue("title", target.value)}
            maxLength={90}
          />
        </div>
        {errors.title && touched.title && (
          <div className="form-error">{errors.title}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.description && touched.description ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>{t("labels.message")}:</label>
        </div>
        <div className="form-input">
          <Editor
            onEdit={(value) => setFieldValue("description", value)}
            content={values.description || ""}
          />
        </div>

        {errors.description && touched.description && (
          <div className="form-error">{errors.description}</div>
        )}
      </div>

      {(values.category === "Integração fora do ar" ||
        values.category === "Erro") && (
        <div className={`form-row`}>
          <div className="form-label">
            <label>Exemplos:</label>
          </div>
          <div className="form-input">
            <Space.Compact block>
              <Space.Addon>Números de Atendimento:</Space.Addon>
              <Input
                onChange={({ target }) =>
                  setFieldValue("admissionNumberExamples", target.value)
                }
              />
            </Space.Compact>
          </div>
          <div className="form-input" style={{ marginTop: "5px" }}>
            <Space.Compact block>
              <Space.Addon>Números de Prescrição::</Space.Addon>
              <Input
                onChange={({ target }) =>
                  setFieldValue("prescriptionNumberExamples", target.value)
                }
              />
            </Space.Compact>
          </div>
          <div className="form-info">
            Forneça exemplos de números de atendimento e/ou de prescrição para
            auxiliar a resolução do seu chamado.
          </div>
        </div>
      )}

      <div className={`form-row ${errors.fileList ? "error" : ""}`}>
        <div className="form-label"></div>
        <div className="form-input">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Anexar arquivo</Button>
          </Upload>
        </div>
        <div className="form-info">
          <ul>
            <li>
              * Até 2 anexos são permitidos (mais anexos podem ser enviados após
              a abertura do chamado)
            </li>
            <li>* Tamanho máximo do arquivo: 2mb</li>
            <li>* Extensões permitidas: .png, .jpg, .doc, .docx, .pdf</li>
          </ul>
        </div>
        {errors.fileList && <div className="form-error">{errors.fileList}</div>}
      </div>
    </>
  );
}

export default BaseForm;
