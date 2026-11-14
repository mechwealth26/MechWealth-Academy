import CoursePageTemplate, {
  coursePageMetadata,
} from "@/components/courses/CoursePageTemplate";
import MethodRuleForge from "@/components/method/MethodRuleForge";
import { METHOD_PAGE } from "@/data/coursePages";

export const metadata = coursePageMetadata(METHOD_PAGE);

export default function MethodCoursePage() {
  return (
    <CoursePageTemplate
      content={METHOD_PAGE}
      interlude={<MethodRuleForge />}
    />
  );
}
