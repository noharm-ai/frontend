import { useFormikContext } from "formik";
import { PlusOutlined } from "@ant-design/icons";

import Button from "components/Button";

import { CustomTextContainer } from "./CustomTextBody.style";
import { TextBlockCard } from "../TextBlockCard/TextBlockCard";
import { CustomForm, TextBlock, emptyTextBlock } from "../types";

/**
 * The custom text of the form: the blocks that make up the evolution text,
 * each one with the answers that decide whether it is included.
 */
export function CustomTextBody() {
  const { values, errors, setFieldValue } = useFormikContext<CustomForm>();
  const blocks = values.customText?.blocks ?? [];
  const blockErrors: any[] = (errors as any).customText?.blocks ?? [];

  const setBlocks = (next: TextBlock[]) =>
    setFieldValue("customText", { ...(values.customText ?? {}), blocks: next });

  const moveBlock = (bIdx: number, direction: -1 | 1) => {
    const target = bIdx + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[bIdx], next[target]] = [next[target], next[bIdx]];
    setBlocks(next);
  };

  return (
    <CustomTextContainer data-kb="customForms.editor.customText">
      <div className="custom-text-intro">
        Monte o texto da evolução gerado a partir deste formulário. O texto é
        formado pelos blocos abaixo, na ordem em que aparecem. Um bloco sem
        condições é sempre incluído; com condições, só entra no texto quando
        as respostas as atendem. Use <code>{"{{id-da-questao}}"}</code> para
        incluir uma resposta e as variáveis da evolução (paciente, exames,
        medicamentos...) para os dados da prescrição.
      </div>

      {blocks.length === 0 && (
        <div className="custom-text-empty">
          Este formulário ainda não tem texto personalizado.
        </div>
      )}

      {blocks.map((block, bIdx) => (
        <TextBlockCard
          key={block.id || bIdx}
          block={block}
          bIdx={bIdx}
          total={blocks.length}
          groups={values.data ?? []}
          errors={blockErrors[bIdx]}
          onChange={(next) => setFieldValue(`customText.blocks[${bIdx}]`, next)}
          onMove={(direction) => moveBlock(bIdx, direction)}
          onRemove={() => setBlocks(blocks.filter((_, i) => i !== bIdx))}
        />
      ))}

      <Button
        block
        icon={<PlusOutlined />}
        onClick={() => setBlocks([...blocks, emptyTextBlock()])}
      >
        Adicionar bloco de texto
      </Button>
    </CustomTextContainer>
  );
}
