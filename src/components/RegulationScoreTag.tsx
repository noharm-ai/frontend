import { Badge } from "antd";

interface RegulationScoreTagProps {
  score: number;
}

export function RegulationScoreTag({ score }: RegulationScoreTagProps) {
  const getColor = () => {
    if (score > 90) {
      return "#E53935";
    }

    if (score > 60) {
      return "#FB8C00";
    }

    if (score > 10) {
      return "#FDD835";
    }

    if (score > 0) {
      return "#7CB342";
    }
  };

  return <Badge color={getColor()} text={score} />;
}
