import { Typography } from "antd";

export function DrugInfoBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        marginBottom: 16,
        padding: "10px 16px",
        background: "var(--nh-background-alternative, #f5f5f5)",
        borderRadius: 8,
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}

export function DrugInfoBarItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        {label}
      </Typography.Text>
      {children}
    </div>
  );
}
