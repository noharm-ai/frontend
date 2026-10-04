import withLayout from "src/lib/withLayout";
import { AntimicrobialTimeline } from "features/antimicrobialTimeline/AntimicrobialTimeline/AntimicrobialTimeline";

export const AntimicrobialTimelinePage = withLayout(AntimicrobialTimeline, {
  pageTitle: "Antimicrobianos",
  defaultSelectedKeys: "/",
});
