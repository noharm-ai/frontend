import withLayout from "lib/withLayout";
import UserAdmin from "features/userAdmin/UserAdmin";

const layoutProps = {};

const UserAdminWithLayout = withLayout(UserAdmin, layoutProps);

export default UserAdminWithLayout;
