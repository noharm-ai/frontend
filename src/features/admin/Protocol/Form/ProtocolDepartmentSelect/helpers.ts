export interface DepartmentSegment {
  id: string;
  name: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
  segments: DepartmentSegment[];
}

export const formatDepartmentLabel = (option: DepartmentOption) =>
  `${option.name} (${option.id})`;

// The department endpoint exposes the id as `idDepartment` (fksetor);
// normalize to `id` here so the components can key off a single field.
// `segments` defaults to an empty list: the backend deploys separately, so the
// field may be missing on an older API.
export const normalizeDepartment = (item: any): DepartmentOption => ({
  id: String(item.idDepartment),
  name: item.name,
  segments: (item.segments ?? []).map((s: any) => ({
    id: String(s.id),
    name: s.name,
  })),
});
