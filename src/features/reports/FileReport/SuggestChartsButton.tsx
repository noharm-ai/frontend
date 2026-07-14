import { useState } from "react";
import { Popover } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { Textarea } from "src/components/Inputs";
import Button from "src/components/Button";

interface SuggestChartsButtonProps {
  loading: boolean;
  onSuggest: (hint: string) => void;
}

export const SuggestChartsButton: React.FC<SuggestChartsButtonProps> = ({
  loading,
  onSuggest,
}) => {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState("");

  const handleGenerate = () => {
    setOpen(false);
    onSuggest(hint);
  };

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      title="Sugerir gráficos"
      content={
        <div style={{ width: 300 }}>
          <Textarea
            rows={3}
            maxLength={500}
            placeholder="Opcional: descreva o que você quer visualizar"
            value={hint}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setHint(e.target.value)
            }
            style={{ marginBottom: "8px" }}
          />
          <Button type="primary" onClick={handleGenerate} block>
            Gerar sugestões
          </Button>
        </div>
      }
    >
      <Button icon={<BulbOutlined />} loading={loading}>
        Sugerir gráficos
      </Button>
    </Popover>
  );
};
