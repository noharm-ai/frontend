// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — lib/withLayout is a JS file without type declarations
import withLayout from "../../lib/withLayout";
import { KnowledgeBaseHome } from "features/knowledgeBase/KnowledgeBaseHome/KnowledgeBaseHome";

export const KnowledgeBasePage = withLayout(KnowledgeBaseHome, {});
