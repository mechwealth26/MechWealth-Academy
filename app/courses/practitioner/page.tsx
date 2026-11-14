import CoursePageTemplate, {
  coursePageMetadata,
} from "@/components/courses/CoursePageTemplate";
import { PRACTITIONER_PAGE } from "@/data/coursePages";

export const metadata = coursePageMetadata(PRACTITIONER_PAGE);

export default function PractitionerCoursePage() {
  return <CoursePageTemplate content={PRACTITIONER_PAGE} />;
}
