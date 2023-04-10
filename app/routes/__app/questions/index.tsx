import { Link } from "@remix-run/react";

export default function QuestionIndexPage() {
  return (
    <p>
      No question selected. Select a question on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new question.
      </Link>
    </p>
  );
}
