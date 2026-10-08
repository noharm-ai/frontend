// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — lib/withLayout is a JS file without type declarations
import withLayout from "../../lib/withLayout";
import { NewsPage as NewsPageContent } from "features/news/NewsPage/NewsPage";

export const NewsPage = withLayout(NewsPageContent, {});
