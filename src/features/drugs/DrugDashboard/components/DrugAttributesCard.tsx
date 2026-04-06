import { Card, Divider } from "antd";

import DrugAttributesForm from "features/drugs/DrugAttributesForm/DrugAttributesForm";
import DrugSubstance from "features/drugs/DrugSubstance/DrugSubstance";

interface DrugAttributesCardProps {
  idSegment: number;
  idDrug: string;
  sctid?: string | null;
  sctName?: string | null;
  reloadKey?: number;
  onAfterSave?: () => void;
}

export function DrugAttributesCard({
  idSegment,
  idDrug,
  sctid,
  sctName,
  reloadKey,
  onAfterSave,
}: DrugAttributesCardProps) {
  return (
    <Card title="Substância e Atributos" type="inner">
      <Divider>Substância</Divider>

      <DrugSubstance
        idDrug={idDrug}
        sctidA={sctid ?? null}
        sctNameA={sctName ?? null}
        onAfterSave={onAfterSave}
      />

      <DrugAttributesForm
        idSegment={idSegment}
        idDrug={idDrug}
        reloadKey={reloadKey}
      />
    </Card>
  );
}
