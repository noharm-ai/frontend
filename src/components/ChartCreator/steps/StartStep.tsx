import { useState } from "react";
import { Button, Card, Flex, Input, notification } from "antd";
import { BulbOutlined, EditOutlined } from "@ant-design/icons";
import type { ChartConfig } from "../types";
import { hintStyle } from "./fieldStyles";

interface StartStepProps {
  onGenerateCharts?: (hint: string) => Promise<ChartConfig[]>;
  onGenerated: (chart: ChartConfig) => void;
  onStartBlank: () => void;
  /** When true, only the "Gerar com agente" card is shown. */
  agentOnly?: boolean;
}

export function StartStep({
  onGenerateCharts,
  onGenerated,
  onStartBlank,
  agentOnly,
}: StartStepProps) {
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!onGenerateCharts) return;
    setLoading(true);
    try {
      const charts = await onGenerateCharts(hint);
      if (!charts || charts.length === 0) {
        notification.info({ message: "Nenhuma sugestão gerada para estes dados." });
        return;
      }
      onGenerated(charts[0]);
    } catch {
      notification.error({ message: "Não foi possível gerar o gráfico." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex vertical gap="middle">
      {!agentOnly && (
        <Card size="small" hoverable onClick={onStartBlank}>
          <Flex align="center" gap={12}>
            <EditOutlined style={{ fontSize: 22, color: "#1677ff" }} />
            <div>
              <strong>Começar do zero</strong>
              <div style={hintStyle}>Monte o gráfico passo a passo você mesmo.</div>
            </div>
          </Flex>
        </Card>
      )}

      {onGenerateCharts && (
        <Card size="small">
          <Flex align="center" gap={12} style={{ marginBottom: 8 }}>
            <BulbOutlined style={{ fontSize: 22, color: "#faad14" }} />
            <div>
              <strong>Gerar com agente</strong>
              <div style={hintStyle}>
                Descreva o que quer visualizar e a IA monta um gráfico para você refinar.
              </div>
            </div>
          </Flex>
          <Input.TextArea
            rows={3}
            maxLength={500}
            placeholder="Ex.: contagem de atendimentos por setor, do maior para o menor"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <Button type="primary" icon={<BulbOutlined />} loading={loading} onClick={handleGenerate} block>
            Gerar gráfico
          </Button>
        </Card>
      )}
    </Flex>
  );
}
