import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Select } from "components/Inputs";
import api from "services/api";
import notification from "components/notification";
import { getErrorMessageFromException } from "utils/errorHandler";

interface ExamTypeOption {
  label: string;
  value: string;
}

interface ProtocolExamSelectProps {
  value?: string;
  onChange: (examType: string) => void;
}

export function ProtocolExamSelect({ value, onChange }: ProtocolExamSelectProps) {
  const { t } = useTranslation();
  const containerId = `protocol-exam-select-${useId().replace(/:/g, "")}`;
  const [options, setOptions] = useState<ExamTypeOption[]>([]);
  const [loading, setLoading] = useState(false);

  // The exam type list is a small, finite set (distinct active tp_exame), so we
  // load it once and let the Select filter client-side.
  useEffect(() => {
    setLoading(true);
    api.exams
      .getExamTypes({})
      .then((response) => {
        setOptions(
          (response.data?.data ?? []).map((item: any) => ({
            label: `${item.name} (${item.examType})`,
            value: item.examType,
          })),
        );
      })
      .catch((err) => {
        notification.error({
          message: getErrorMessageFromException(err.response?.data, t),
        });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
