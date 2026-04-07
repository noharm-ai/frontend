import type { KindEditorComponent } from "features/memory/MemoryList/types";
import TplCarePlanEditor from "./TplCarePlanEditor";

const KIND_EDITORS: Record<string, KindEditorComponent> = {
  "tpl-care-plan": TplCarePlanEditor,
};

export const KIND_META: Record<string, { label: string }> = {
  "tpl-care-plan": { label: "Modelo de Plano de Cuidado" },
};

export default KIND_EDITORS;
