import withLayout from "src/lib/withLayout";
import { KnowledgeBaseCenter } from "features/knowledgeBase/KnowledgeBaseCenter/KnowledgeBaseCenter";

const layoutProps = {};

export const KnowledgeBasePage = withLayout(KnowledgeBaseCenter, layoutProps);
