import withLayout from "src/lib/withLayout";
import { KnowledgeBaseAdmin } from "features/knowledgeBase/KnowledgeBaseAdmin/KnowledgeBaseAdmin";

const layoutProps = {};

export const AdminKnowledgeBase = withLayout(KnowledgeBaseAdmin, layoutProps);
