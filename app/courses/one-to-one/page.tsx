import CoursePageTemplate, {
  coursePageMetadata,
} from "@/components/courses/CoursePageTemplate";
import { ONE_TO_ONE_PAGE } from "@/data/coursePages";

export const metadata = coursePageMetadata(ONE_TO_ONE_PAGE);

export default function OneToOneCoursePage() {
  return <CoursePageTemplate content={ONE_TO_ONE_PAGE} />;
}
