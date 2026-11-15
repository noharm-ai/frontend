import React from "react";

export interface MemoryRecord {
  key?: string;
  value: {
    name: string;
    active?: boolean;
    kind: string;
    data: unknown;
  };
}

export interface KindEditorProps {
  recordValue: MemoryRecord["value"] | null;
  isSaving: boolean;
  // shows the record without any way to change it
  readOnly?: boolean;
  onSave: (values: MemoryRecord["value"]) => void;
  onCancel: () => void;
}

export type KindEditorComponent = React.ComponentType<KindEditorProps>;
