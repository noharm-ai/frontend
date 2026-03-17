import withLayout from "src/lib/withLayout";
import { KnowledgeBase } from "features/admin/KnowledgeBase/KnowledgeBase";

const layoutProps = {};

const PageWithLayout = withLayout(KnowledgeBase, layoutProps);

export default PageWithLayout;
