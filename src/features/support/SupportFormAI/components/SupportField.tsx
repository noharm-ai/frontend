import { Upload, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { Input, Radio } from "src/components/Inputs";
import notification from "components/notification";
import Button from "components/Button";

interface ISupportFieldProps {
  label: string;
  type: string;
  setFieldValue: (field: string, value: any) => void;
  value?: any;
  error: any;
}

export function SupportField({
  label,
  type,
  setFieldValue,
  value,
  error,
}: ISupportFieldProps) {
  const uploadProps: UploadProps = {
    onRemove: (file: any) => {
      const index = value.indexOf(file);
      const newFileList = value.slice();
      newFileList.splice(index, 1);
      setFieldValue(label, newFileList);
    },
    beforeUpload: (file: any) => {
      if (value.length >= 2) {
        notification.error({ message: "Máximo de arquivos anexos atingido." });
      } else {
        setFieldValue(label, [...value, file]);
      }

      return false;
    },
    listType: "picture",
    multiple: true,
    accept: "image/*, .doc, .docx, .pdf",
    fileList: value || [],
  };

  return (
    <>
      {type === "text" && (
        <Input
          value={value}
          onChange={({ target }) => setFieldValue(label, target.value)}
        />
      )}

      {type === "boolean" && (
        <Radio.Group
          onChange={({ target }) => setFieldValue(label, target.value)}
          value={value}
        >
          <Radio.Button value="Sim">Sim</Radio.Button>
          <Radio.Button value="Não">Não</Radio.Button>
          <Radio.Button value="Não sei">Não sei</Radio.Button>
        </Radio.Group>
      )}

      {type === "archive" && (
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Anexar arquivo</Button>
        </Upload>
      )}

      {error && <div className="form-error">{error}</div>}
    </>
  );
}
