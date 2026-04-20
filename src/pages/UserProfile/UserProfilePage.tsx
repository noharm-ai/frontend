import withLayout from "src/lib/withLayout";
import { UserProfile } from "features/user/UserProfile/UserProfile";

const layoutProps = {};

const UserConfigWithLayout = withLayout(UserProfile, layoutProps);

export default UserConfigWithLayout;
