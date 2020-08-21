import withLayout from '@lib/withLayout';
import User from '@containers/Forms/User';

const layoutProps = {
  theme: 'boxed',
  pageTitle: 'Usuários'
};

export default withLayout(User, layoutProps);
