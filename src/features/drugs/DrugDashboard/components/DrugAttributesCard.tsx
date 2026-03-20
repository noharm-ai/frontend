import { useState } from "react";
import { Card, Divider } from "antd";

import DrugAttributesForm from "features/drugs/DrugAttributesForm/DrugAttributesForm";
import DrugSubstance from "features/drugs/DrugSubstance/DrugSubstance";

interface DrugAttributesCardProps {
  idSegment: number;
  idDrug: string;
  sctid?: string | null;
  sctName?: string | null;
  onAfterSave?: () => void;
}

export function DrugAttributesCard({
  idSegment,
  idDrug,
  sctid,
  sctName,
  onAfterSave,
}: DrugAttributesCardProps) {
  const [attributesReloadKey, setAttributesReloadKey] = useState(0);

  const handleAfterSave = () => {
    setAttributesReloadKey((k) => k + 1);
    onAfterSave?.();
  };

  return (
    <Card title="Substância e Atributos" type="inner">
      <Divider>Substância</Divider>

      <DrugSubstance
        idDrug={idDrug}
        sctidA={sctid ?? null}
        sctNameA={sctName ?? null}
        onAfterSave={handleAfterSave}
      />

      <DrugAttributesForm
        idSegment={idSegment}
        idDrug={idDrug}
        reloadKey={attributesReloadKey}
      />
    </Card>
  );
}
