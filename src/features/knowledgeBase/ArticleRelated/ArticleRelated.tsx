import { useTranslation } from "react-i18next";
import { FileTextOutlined, PlayCircleOutlined } from "@ant-design/icons";

import { IKnowledgeBaseArticle } from "../KnowledgeBaseSlice";
import {
  LinkList,
  SidePanel,
} from "../KnowledgeBaseArticle/KnowledgeBaseArticle.style";

interface IArticleRelatedProps {
  article: IKnowledgeBaseArticle;
  onOpenArticle: (id: number) => void;
  onOpenLesson: (lesson: IKnowledgeBaseArticle["relatedLessons"][0]) => void;
}

/** Related training lessons and articles, one panel each. */
export function ArticleRelated({
  article,
  onOpenArticle,
  onOpenLesson,
}: IArticleRelatedProps) {
  const { t } = useTranslation();

  return (
    <>
      {article.relatedLessons.length > 0 && (
        <SidePanel>
          <h3>
            <PlayCircleOutlined /> {t("knowledgeBase.relatedLessons")}
          </h3>
          <LinkList>
            {article.relatedLessons.map((lesson) => (
              <li key={lesson.id}>
                <button type="button" onClick={() => onOpenLesson(lesson)}>
                  <span className="link-icon lesson">
                    <PlayCircleOutlined />
                  </span>
                  <span className="link-text">
                    <strong>{lesson.title}</strong>
                    <span>{lesson.trainingTitle}</span>
                  </span>
                </button>
              </li>
            ))}
          </LinkList>
        </SidePanel>
      )}

      {article.related.length > 0 && (
        <SidePanel>
          <h3>
            <FileTextOutlined /> {t("knowledgeBase.relatedArticles")}
          </h3>
          <LinkList>
            {article.related.map((related) => (
              <li key={related.id}>
                <button type="button" onClick={() => onOpenArticle(related.id)}>
                  <span className="link-icon">
                    <FileTextOutlined />
                  </span>
                  <span className="link-text">
                    <strong>{related.title}</strong>
                    {related.description && <span>{related.description}</span>}
                  </span>
                </button>
              </li>
            ))}
          </LinkList>
        </SidePanel>
      )}
    </>
  );
}
