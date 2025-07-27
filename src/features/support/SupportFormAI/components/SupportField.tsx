import { Input, Radio } from "src/components/Inputs";

interface ISupportFieldProps {
  label: string;
  type: string;
  setFieldValue: (field: string, value: any) => void;
  value?: string;
}

export function SupportField({
  label,
  type,
  setFieldValue,
  value,
}: ISupportFieldProps) {
  return (
    <>
      {type === "text" && (
        <Input
          value={value}
          onChange={({ target }) => setFieldValue(label, target.value)}
        />
      )}

      {type === "boolean" && (
        <Radio.Group
          onChange={({ target }) => setFieldValue(label, target.value)}
          value={value}
        >
          <Radio.Button value="Sim">Sim</Radio.Button>
          <Radio.Button value="Não">Não</Radio.Button>
          <Radio.Button value="Não sei">Não sei</Radio.Button>
        </Radio.Group>
      )}
    </>
  );
}
