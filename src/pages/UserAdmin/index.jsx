import withLayout from '@lib/withLayout';
import UserAdmin from '@containers/UserAdmin';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'menu.exams'
};

export default withLayout(UserAdmin, layoutProps);
