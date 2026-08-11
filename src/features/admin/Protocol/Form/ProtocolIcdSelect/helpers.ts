export interface IcdOption {
  id: string;
  name: string;
}

export const formatIcdLabel = (option: IcdOption) =>
  `${option.id} - ${option.name}`;

// The icd search/resolve endpoints already expose the code as `id`; normalize
// to a string so the components can key off a single field type.
export const normalizeIcd = (item: any): IcdOption => ({
  id: String(item.id),
  name: item.name,
});
