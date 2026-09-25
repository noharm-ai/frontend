import { useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { Space, Spin, Tag, Typography } from "antd";
import {
  BookOutlined,
  EditOutlined,
  LinkOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

import api from "services/api";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import Feature from "models/Feature";
import { FeatureService } from "services/FeatureService";

import { IKnowledgeBaseArticle } from "../KnowledgeBaseSlice";
import { KnowledgeBaseForm } from "../KnowledgeBaseForm/KnowledgeBaseForm";
import { canWriteKnowledgeBase } from "../knowledgeBasePermissions";
import {
  ArticleBody,
  ArticleContent,
  ArticleLessons,
} from "../KnowledgeBase.style";

const { Paragraph } = Typography;

interface KnowledgeBaseArticleModalProps {
  // the article to show; the modal is closed when null
  articleId: number | null;
  onClose: () => void;
}

export function KnowledgeBaseArticleModal({
  articleId,
  onClose,
}: KnowledgeBaseArticleModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [article, setArticle] = useState<IKnowledgeBaseArticle | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setArticle(null);
    if (!articleId) return undefined;

    let active = true;
    api.knowledgeBase
      .get(articleId)
      .then((response: any) => {
        if (active) setArticle(response.data.data);
      })
      .catch(() => {
        if (!active) return;
        notification.error({ message: t("error.title") });
        onClose();
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // the training center only exists where the onboarding feature is on
  const lessons = article?.trainingLessons ?? [];
  const showLessons =
    lessons.length > 0 && FeatureService.has(Feature.USER_ONBOARDING);

  const openLesson = (trainingId: number, lessonId: number) => {
    onClose();
    navigate(`/treinamento/${trainingId}/aula/${lessonId}`);
  };

  let body: ReactNode = <Spin />;
  if (article) {
    body = (
      <>
        {!article.active && (
          <Tag color="orange" style={{ marginBottom: 12 }}>
            Não publicado
          </Tag>
        )}
        {article.description && (
          <Paragraph type="secondary">{article.description}</Paragraph>
        )}
        {article.content && (
          <ArticleContent
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(article.content),
            }}
          />
        )}
        {showLessons && (
          <ArticleLessons>
            <h4>Aulas relacionadas</h4>
            <ul>
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Button
                    type="link"
                    icon={<PlayCircleOutlined />}
                    onClick={() => openLesson(lesson.trainingId, lesson.id)}
                  >
                    {lesson.trainingTitle} › {lesson.title}
                  </Button>
                </li>
              ))}
            </ul>
          </ArticleLessons>
        )}
      </>
    );
  }

  const footer = [
    ...(article?.link
      ? [
          <Button
            key="link"
            icon={<LinkOutlined />}
            onClick={() => window.open(article.link!, "_blank", "noopener")}
          >
            Abrir link externo
          </Button>,
        ]
      : []),
    ...(article && canWriteKnowledgeBase()
      ? [
          <Button
            key="edit"
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
          >
            {t("actions.edit")}
          </Button>,
        ]
      : []),
    <Button key="close" type="primary" onClick={onClose}>
      {t("actions.close")}
    </Button>,
  ];

  return (
    <>
      <DefaultModal
        open={!!articleId}
        width={720}
        centered
        onCancel={onClose}
        footer={footer}
        title={
          <Space>
            <BookOutlined style={{ color: "#FF8845" }} />
            <span>{article?.title ?? ""}</span>
          </Space>
        }
      >
        <ArticleBody>{body}</ArticleBody>
      </DefaultModal>

      <KnowledgeBaseForm
        open={editing}
        articleId={articleId}
        onClose={() => setEditing(false)}
        onSaved={(saved) => setArticle(saved)}
      />
    </>
  );
}
