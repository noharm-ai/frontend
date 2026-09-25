import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { Tag, Typography } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Feature from "models/Feature";
import { FeatureService } from "services/FeatureService";

import { IKnowledgeBaseArticle } from "../KnowledgeBaseSlice";
import { ArticleContent, ArticleLessons } from "../KnowledgeBase.style";

const { Paragraph } = Typography;

interface KnowledgeBaseArticleViewProps {
  article: IKnowledgeBaseArticle;
  // called before leaving to a lesson (a modal closes itself, for instance)
  onNavigate?: () => void;
}

// The readable part of an article: summary, body and related lessons. Shared
// by the article modal and the knowledge base page.
export function KnowledgeBaseArticleView({
  article,
  onNavigate,
}: KnowledgeBaseArticleViewProps) {
  const navigate = useNavigate();

  // the training center only exists where the onboarding feature is on
  const lessons = article.trainingLessons ?? [];
  const showLessons =
    lessons.length > 0 && FeatureService.has(Feature.USER_ONBOARDING);

  const openLesson = (trainingId: number, lessonId: number) => {
    onNavigate?.();
    navigate(`/treinamento/${trainingId}/aula/${lessonId}`);
  };

  return (
    <>
      {article.active === false && (
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
