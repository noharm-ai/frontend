interface ExpandColumnProps {
  expand: boolean;
  toggleExpansion: () => void;
}

export function ExpandColumn({ expand, toggleExpansion }: ExpandColumnProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <button
        type="button"
        className={`expand-all ant-table-row-expand-icon ${
          expand ? "ant-table-row-expand-icon-collapsed" : ""
        }`}
        onClick={toggleExpansion}
      ></button>
    </div>
  );
}
