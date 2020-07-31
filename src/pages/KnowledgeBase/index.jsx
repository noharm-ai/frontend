import withLayout from '@lib/withLayout';
import KnowledgeBase from '@containers/KnowledgeBase';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.knowledgeBase'
};

export default withLayout(KnowledgeBase, layoutProps);
