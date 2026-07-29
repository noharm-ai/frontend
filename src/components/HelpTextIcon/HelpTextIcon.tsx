import { useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { Space, Spin } from "antd";
import { QuestionCircleOutlined, EditOutlined } from "@ant-design/icons";

import api from "services/api";
import PermissionService from "services/PermissionService";
import Permission from "models/Permission";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import Tooltip from "components/Tooltip";
import Editor from "components/Editor";
import notification from "components/notification";

import {
  IconButton,
  ModalBody,
  EmptyNote,
  HtmlContent,
} from "./HelpTextIcon.style";

interface HelpTextIconProps {
  pageKey: string;
}

export function HelpTextIcon({ pageKey }: HelpTextIconProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canEdit = PermissionService().has(Permission.WRITE_HELP_TEXT);

  // The texto_ajuda table is shared with the admin project, so every key this
  // app reads/writes is namespaced with "nhapp_" to avoid clashes.
  const storageKey = `nhapp_${pageKey}`;

  useEffect(() => {
    if (!modalOpen) return undefined;

    let active = true;
    setLoading(true);
    setEditMode(false);

    api.helpText
      .getHelpText(storageKey)
      .then((response) => {
        if (!active) return;

        const value = response?.data?.data?.content ?? null;
        setContent(value);

        // Only privileged users get dropped straight into the editor when the
        // help text is still empty. Read-only users see the empty-state note.
        if (!value && canEdit) {
          setDraft(null);
          setEditMode(true);
        }
      })
      .catch(() => {
        if (active) {
          notification.error({ message: t("helpText.loadError") });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, pageKey]);

  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setDraft(null);
  };

  const handleEnterEdit = () => {
    setDraft(content);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    if (!content) {
      closeModal();
    } else {
      setEditMode(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const stripped = (draft ?? "").replace(/<[^>]*>/g, "").trim();
      const payload = stripped ? draft : null;

      const response = await api.helpText.updateHelpText(storageKey, payload);

      setContent(response?.data?.data?.content ?? null);
      setEditMode(false);
      setModalOpen(false);
    } catch {
      notification.error({ message: t("helpText.saveError") });
    } finally {
      setSaving(false);
    }
  };

  let body: ReactNode;
  if (loading) {
    body = <Spin />;
  } else if (editMode) {
    body = (
      <Editor
        content={draft ?? ""}
        onEdit={setDraft}
        utilities={["basic", "link"]}
        onCreateFocus
      />
    );
  } else if (content) {
    body = (
      <HtmlContent
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      />
    );
  } else {
    body = <EmptyNote>{t("helpText.empty")}</EmptyNote>;
  }

  const footer = editMode
    ? [
        <Button key="cancel" onClick={handleCancelEdit} disabled={saving}>
          {t("helpText.cancel")}
        </Button>,
        <Button key="save" type="primary" loading={saving} onClick={handleSave}>
          {t("helpText.save")}
        </Button>,
      ]
    : [
        <Button key="close" onClick={closeModal}>
          {t("helpText.close")}
        </Button>,
        ...(canEdit
          ? [
              <Button
                key="edit"
                icon={<EditOutlined />}
                onClick={handleEnterEdit}
              >
                {t("helpText.edit")}
              </Button>,
            ]
          : []),
      ];

  return (
    <>
      <Tooltip title={t("helpText.title")}>
        <IconButton
          type="text"
          icon={<QuestionCircleOutlined />}
          onClick={openModal}
        />
      </Tooltip>

      <DefaultModal
        title={
          <Space>
            <QuestionCircleOutlined />
            <span>{t("helpText.title")}</span>
          </Space>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={loading ? null : footer}
        width={600}
      >
        <ModalBody>{body}</ModalBody>
      </DefaultModal>
    </>
  );
}
