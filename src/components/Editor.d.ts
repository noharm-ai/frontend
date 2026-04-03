import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface EditorHandle {
  insertContent: (html: string) => void;
  setContent: (html: string) => void;
  getText: () => string;
  getHTML: () => string;
}

export interface EditorProps {
  content: string;
  onEdit: (value: string | null) => void;
  utilities?: string[];
  onCreateFocus?: boolean;
}

declare const Editor: ForwardRefExoticComponent<
  EditorProps & RefAttributes<EditorHandle>
>;

export default Editor;
