import { Divider } from "antd";

import { formatDateTime } from "src/utils/date";
import { MainTab } from "./MainTab";

export function BaseForm({ formData }: { formData: any }) {
  return (
    <>
      <MainTab />
      {formData.createdAt && (
        <>
          <Divider style={{ marginBottom: "10px" }} />
          <span style={{ opacity: 0.7 }}>
            Criado em: {formatDateTime(formData.createdAt)}
          </span>
        </>
      )}
    </>
  );
}
