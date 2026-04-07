export interface SnippetItem {
  title: string;
  text: string;
}

export interface SnippetCategory {
  category: string;
  items: SnippetItem[];
}

export interface Template {
  title: string;
  description: string;
  content: string;
}
