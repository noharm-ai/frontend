import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import api from "services/admin/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

interface ExamRefOption {
  label: string;
  value: string;
}

interface ProtocolExamRefSelectProps {
  value?: string;
  onChange: (examRefType: string) => void;
}

export function ProtocolExamRefSelect({
  value,
  onChange,
}: ProtocolExamRefSelectProps) {
  const { t } = useTranslation();
  const containerId = `protocol-exam-ref-select-${useId().replace(/:/g, "")}`;
  const [options, setOptions] = useState<ExamRefOption[]>([]);
  // Starts true because we always fetch on mount; flipped off in `.finally`.
  const [loading, setLoading] = useState(true);

  // The global exam list is a small, finite set, so we load it once and let the
  // Select filter client-side.
  useEffect(() => {
    api.exams
      .getGlobalExams({})
      .then((response) => {
        setOptions(
          (response.data?.data ?? []).map((item: any) => ({
            label: `${item.name} (${item.tpexam})`,
            value: item.tpexam,
          })),
        );
      })
      .catch((err) => {
        notification.error({
          message: getErrorMessageFromException(err.response?.data, t),
        });
      })
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div style={{ width: "100%" }} id={containerId}>
      <Select
        value={value}
        onChange={(val) => onChange(val as string)}
        showSearch
        allowClear
        optionFilterProp="label"
        options={options}
        style={{ width: "100%" }}
        placeholder="Digite para pesquisar"
        loading={loading}
        getPopupContainer={() =>
          document.getElementById(containerId) || document.body
        }
      />
    </div>
  );
}
