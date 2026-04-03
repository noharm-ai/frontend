export interface Template {
  title: string;
  description: string;
  content: string;
}

export interface SnippetItem {
  title: string;
  text: string;
}

export interface SnippetCategory {
  category: string;
  items: SnippetItem[];
}

export interface TplCarePlanData {
  templates: Template[];
  snippets: SnippetCategory[];
}

// Runtime types with _id for stable React keys (stripped before saving)
export interface TemplateWithId extends Template {
  _id: string;
}

export interface SnippetItemWithId extends SnippetItem {
  _id: string;
}

export interface SnippetCategoryWithId extends Omit<SnippetCategory, "items"> {
  _id: string;
  items: SnippetItemWithId[];
}

export const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const emptyTemplate = (): TemplateWithId => ({
  _id: genId(),
  title: "",
  description: "",
  content: "",
});

export const emptySnippetItem = (): SnippetItemWithId => ({
  _id: genId(),
  title: "",
  text: "",
});

export const emptySnippetCategory = (): SnippetCategoryWithId => ({
  _id: genId(),
  category: "",
  items: [emptySnippetItem()],
});

export const withIds = (data?: TplCarePlanData) => ({
  templates: (data?.templates ?? [emptyTemplate()]).map((t) => ({
    ...t,
    _id: genId(),
  })) as TemplateWithId[],
  snippets: (data?.snippets ?? [emptySnippetCategory()]).map((s) => ({
    ...s,
    _id: genId(),
    items: (s.items ?? [emptySnippetItem()]).map((i) => ({
      ...i,
      _id: genId(),
    })) as SnippetItemWithId[],
  })) as SnippetCategoryWithId[],
});

export const stripIds = (data: {
  templates: TemplateWithId[];
  snippets: SnippetCategoryWithId[];
}): TplCarePlanData => ({
  templates: data.templates.map(({ _id: _, ...t }) => t),
  snippets: data.snippets.map(({ _id: _, items, ...s }) => ({
    ...s,
    items: items.map(({ _id: __, ...i }) => i),
  })),
});
