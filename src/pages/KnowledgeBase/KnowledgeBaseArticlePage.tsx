// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — lib/withLayout is a JS file without type declarations
import withLayout from "../../lib/withLayout";
import { KnowledgeBaseArticle } from "features/knowledgeBase/KnowledgeBaseArticle/KnowledgeBaseArticle";

export const KnowledgeBaseArticlePage = withLayout(KnowledgeBaseArticle, {});
