import { Card } from "antd";
import DrugAttributesForm from "features/drugs/DrugAttributesForm/DrugAttributesForm";

interface DrugAttributesCardProps {
  idSegment: number;
  idDrug: number;
}

export function DrugAttributesCard({
  idSegment,
  idDrug,
}: DrugAttributesCardProps) {
  return (
    <Card title="Atributos" type="inner">
      <DrugAttributesForm idSegment={idSegment} idDrug={idDrug} />
    </Card>
  );
}
