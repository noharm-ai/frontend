import { useEffect, useState, SyntheticEvent } from "react";
import { Popover, Typography } from "antd";
import { BookOutlined, LinkOutlined, PlusOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { useAppDispatch, useAppSelector } from "src/store";
import { KnowledgeBaseSectionEnum } from "models/KnowledgeBaseSectionEnum";
import { trackSupportAction, TrackedSupportAction } from "utils/tracker";

import {
  IKnowledgeBaseArticle,
  fetchSectionArticles,
} from "../KnowledgeBaseSlice";
import { KnowledgeBaseArticleModal } from "../KnowledgeBaseArticleModal/KnowledgeBaseArticleModal";
import { KnowledgeBaseForm } from "../KnowledgeBaseForm/KnowledgeBaseForm";
import { canWriteKnowledgeBase } from "../knowledgeBasePermissions";
import { ArticleList, HelpIcon } from "./KnowledgeBaseSectionHelp.style";

const { Text } = Typography;

const stopPropagation = (event: SyntheticEvent) => event.stopPropagation();

interface KnowledgeBaseSectionHelpProps {
  // a KnowledgeBaseSectionEnum value
  section: string;
}

// Help icon of a page section: lists the articles pinned to the section.
// Readers only see it when the section has articles; maintainers always do, so
// they can write the first one right where it belongs.
export function KnowledgeBaseSectionHelp({
  section,
}: KnowledgeBaseSectionHelpProps) {
  const dispatch = useAppDispatch();
  const { status, list } = useAppSelector(
    (state) => state.knowledgeBase.sectionArticles,
  );
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [articleId, setArticleId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const canWrite = canWriteKnowledgeBase();

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchSectionArticles());
    }
  }, [status, dispatch]);

  const articles = list.filter((article: IKnowledgeBaseArticle) =>
    article.section.includes(section),
  );

  if (!articles.length && !canWrite) {
    return null;
  }

  const openArticle = (article: IKnowledgeBaseArticle) => {
    trackSupportAction(TrackedSupportAction.OPEN_ARTICLE);
    setPopoverOpen(false);

    if (article.hasContent) {
      setArticleId(article.id);
    } else if (article.link) {
      window.open(article.link, "_blank", "noopener");
    }
  };

  const createArticle = () => {
    setPopoverOpen(false);
    setCreating(true);
  };

  const sectionInfo = KnowledgeBaseSectionEnum.getSection(section);

  const content = (
    <ArticleList>
      {articles.map((article) => (
        <li key={article.id}>
          <Button
            type="link"
            icon={article.hasContent ? <BookOutlined /> : <LinkOutlined />}
            onClick={() => openArticle(article)}
          >
            {article.title}
          </Button>
        </li>
      ))}
      {!articles.length && (
        <li>
          <Text type="secondary">Nenhum artigo nesta seção.</Text>
        </li>
      )}
      {canWrite && (
        <li className="create">
          <Button type="dashed" icon={<PlusOutlined />} onClick={createArticle}>
            Adicionar artigo nesta seção
          </Button>
        </li>
      )}
    </ArticleList>
  );

  return (
    // the icon may sit inside clickable areas (a tab title, a collapse
    // header) and its modals, although portaled, bubble their React events
    // through it: keep clicks and keys (a tab eats the space bar) to itself
    <span
      onClick={stopPropagation}
      onKeyDown={stopPropagation}
      onKeyUp={stopPropagation}
    >
      <Popover
        content={content}
        title={sectionInfo?.label ?? "Artigos de ajuda"}
        trigger="click"
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
      >
        <Tooltip title="Artigos de ajuda">
          <HelpIcon
            type="text"
            size="small"
            icon={<BookOutlined />}
            $empty={!articles.length}
          />
        </Tooltip>
      </Popover>

      <KnowledgeBaseArticleModal
        articleId={articleId}
        onClose={() => setArticleId(null)}
      />

      {canWrite && (
        <KnowledgeBaseForm
          open={creating}
          defaults={{
            section: [section],
            path: sectionInfo ? [sectionInfo.page] : [],
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </span>
  );
}
