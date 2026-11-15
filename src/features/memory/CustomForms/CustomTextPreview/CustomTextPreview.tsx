import { useState } from "react";
import DOMPurify from "dompurify";
import { Col, Row, Tag } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

import Button from "components/Button";
import DefaultModal from "components/Modal";
import CustomFormView from "components/Forms/CustomForm";

import { PreviewText } from "../CustomTextBody/CustomTextBody.style";
import { allQuestions, isBlockIncluded, renderCustomText } from "../customText";
import { CustomForm } from "../types";

interface CustomTextPreviewProps {
  form: CustomForm;
}

// the clinical note variables stay as they are until a prescription
// resolves them: the preview only marks them
const markNoteVariables = (html: string) =>
  html.replace(
    /\{\{([^{}]+)\}\}/g,
    (match) => `<span class="note-variable">${match}</span>`,
  );

/**
 * Fills the form with test answers and shows the text they produce, with
 * the blocks that made it in.
 */
export function CustomTextPreview({ form }: CustomTextPreviewProps) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const blocks = form.customText?.blocks ?? [];
  const questions = allQuestions(form);
  const included = blocks
    .map((block, bIdx) => ({ block, bIdx }))
    .filter(({ block }) => isBlockIncluded(block, questions, answers));
  const html = DOMPurify.sanitize(
    markNoteVariables(renderCustomText(form, answers)),
  );

  const close = () => {
    setOpen(false);
    setAnswers({});
  };

  return (
    <>
      <Button
        icon={<FileTextOutlined />}
        onClick={() => setOpen(true)}
        disabled={blocks.length === 0}
      >
        Testar texto
      </Button>
      <DefaultModal
        open={open}
        onCancel={close}
        footer={null}
        title="Testar texto personalizado"
        width={1100}
        centered
        destroyOnHidden
      >
        <Row gutter={[24, 16]} data-kb="customForms.editor.customTextPreview">
          <Col xs={24} md={12}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              Responda o formulário:
            </div>
            <CustomFormView
              template={form.data}
              values={{}}
              onSubmit={close}
              onCancel={close}
              onChange={() => {}}
              isSaving={false}
              startClosed={false}
              horizontal={false}
              btnSaveText={"Fechar"}
              onValuesChange={setAnswers}
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              Texto gerado:
            </div>
            <div style={{ marginBottom: 8 }} data-testid="included-blocks">
              {included.length === 0 ? (
                <Tag>Nenhum bloco incluído</Tag>
              ) : (
                included.map(({ block, bIdx }) => (
                  <Tag color="green" key={block.id || bIdx}>
                    {block.name || `Bloco ${bIdx + 1}`}
                  </Tag>
                ))
              )}
            </div>
            <PreviewText
              data-testid="custom-text-result"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
              As variáveis da evolução, em destaque, são preenchidas com os
              dados da prescrição quando a evolução for criada.
            </div>
          </Col>
        </Row>
      </DefaultModal>
    </>
  );
}
