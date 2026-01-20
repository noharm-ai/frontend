import withLayout from "src/lib/withLayout";
import { GlobalExam } from "features/admin/GlobalExam/GlobalExam";

const layoutProps = {};

const GlobalExamWithLayout = withLayout(GlobalExam, layoutProps);

export default GlobalExamWithLayout;
