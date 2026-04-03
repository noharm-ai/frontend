import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import {
  fetchEditableMemories,
  saveMemoryRecord,
  reset,
} from "features/memory/MemoryList/MemoryListSlice";
import KIND_EDITORS from "features/memory/MemoryEditor/editors/registry";

const LIST_PATH = "/configuracoes/memoria";

export default function MemoryEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch() as any;

  const records: any[] = useAppSelector(
    (state: any) => state.memoryList.records,
  );
  const status = useAppSelector((state: any) => state.memoryList.status);
  const saveStatus = useAppSelector(
    (state: any) => state.memoryList.saveStatus,
  );
  const isSaving = saveStatus === "loading";

  const kindFromQuery = searchParams.get("kind");

  const isNew = id === "new";
  const formRecord = isNew
    ? null
    : records.find((r: any) => String(r.key) === id);

  const kind = isNew ? (kindFromQuery ?? "") : (formRecord?.value?.kind ?? "");

  useEffect(() => {
    dispatch(fetchEditableMemories());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const recordValue =
    !isNew && formRecord ? JSON.parse(JSON.stringify(formRecord.value)) : null;

  const handleSave = (values: any) => {
    const recordId = isNew ? undefined : formRecord?.key;
    dispatch(
      saveMemoryRecord({ id: recordId, type: kind, value: values }),
    ).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({ message: t("success.generic") });
        navigate(LIST_PATH);
      }
    });
  };

  const handleCancel = () => {
    navigate(LIST_PATH);
  };

  const EditorComponent = kind ? KIND_EDITORS[kind] : null;

  const isWaitingForRecord = !isNew && status === "loading" && !recordValue;

  if (isWaitingForRecord || (kind && !EditorComponent)) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "4rem" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!EditorComponent) {
    return null;
  }

  return (
    <EditorComponent
      recordValue={recordValue}
      isSaving={isSaving}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
