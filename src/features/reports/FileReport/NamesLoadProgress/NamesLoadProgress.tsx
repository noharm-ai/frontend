import { Flex, Progress } from "antd";

interface NamesLoadProgressProps {
  current: number;
  total: number;
}

const formatCount = (value: number) => value.toLocaleString("pt-BR");

/** Progress of a full patient name load. */
export function NamesLoadProgress({ current, total }: NamesLoadProgressProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Flex vertical gap={8} style={{ padding: "16px 0" }}>
      <Flex justify="space-between">
        <span>Buscando nomes dos pacientes...</span>
        <span data-testid="patient-names-progress">
          {formatCount(current)} de {formatCount(total)}
        </span>
      </Flex>
      <Progress
        percent={percent}
        showInfo={false}
        strokeColor={{
          "0%": "rgb(112, 189, 196)",
          "100%": "rgb(126, 190, 154)",
        }}
      />
    </Flex>
  );
}
