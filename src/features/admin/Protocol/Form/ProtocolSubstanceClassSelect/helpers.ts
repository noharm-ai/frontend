export interface ClassOption {
  id: string;
  name: string;
  parent?: string | null;
}

export const formatSubstanceClassLabel = (option: ClassOption) => {
  const base = option.parent ? `${option.parent} - ${option.name}` : option.name;

  return `${option.id} - ${base}`;
};
