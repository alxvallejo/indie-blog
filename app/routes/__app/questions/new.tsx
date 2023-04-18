import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import {
  useFieldArray,
  ValidatedForm,
  validationError,
  ValidatorData,
} from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";

import { createQuestion } from "~/models/question.server";
import { requireUserId } from "~/session.server";
import { SubmitButton, TextInput } from "~/components/inputs";

export const validator = withZod(
  z.object({
    title: z.string().min(1, { message: "Title is required" }),
    choices: z.array(
      z.object({
        title: z.string().min(1, { message: "Title is required" }),
        answer: z.boolean().optional(),
      })
    ),
  })
);

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const choices = formData.get("choices");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", body: null } },
      { status: 400 }
    );
  }

  if (!choices || choices.length !== 4) {
    return json(
      { errors: { title: null, body: "4 choices are required" } },
      { status: 400 }
    );
  }

  const question = await createQuestion({ title, choices, userId });

  return redirect(`/questions/${question.id}`);
}

const defaultChoice = {
  title: "",
  answer: false,
};

const defaultChoices = Array(4).fill(defaultChoice);

export default function NewQuestionPage() {
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <ValidatedForm validator={validator} method="post" id="new-question-form">
      <TextInput name="title" label="Title" />
      {defaultChoices.map((choice, index) => {
        return (
          <div key={index}>
            <TextInput
              name={`choices[${index}].title`}
              label={`Choice ${index + 1}`}
            />
          </div>
        );
      })}
      <SubmitButton />
    </ValidatedForm>
  );

  // return (
  //   <Form
  //     method="post"
  //     style={{
  //       display: "flex",
  //       flexDirection: "column",
  //       gap: 8,
  //       width: "100%",
  //     }}
  //   >
  //     <div>
  //       <label className="flex w-full flex-col gap-1">
  //         <span>Title: </span>
  //         <input
  //           ref={titleRef}
  //           name="title"
  //           className="flex-1 rounded-md px-3 text-lg leading-loose"
  //           aria-invalid={actionData?.errors?.title ? true : undefined}
  //           aria-errormessage={
  //             actionData?.errors?.title ? "title-error" : undefined
  //           }
  //         />
  //       </label>
  //       {actionData?.errors?.title && (
  //         <div className="pt-1 text-red-700" id="title-error">
  //           {actionData.errors.title}
  //         </div>
  //       )}
  //     </div>

  //     <div>
  //       <label className="flex w-full flex-col gap-1">
  //         <span>Body: </span>
  //         <textarea
  //           ref={bodyRef}
  //           name="body"
  //           rows={8}
  //           className="w-full flex-1 rounded-md py-2 px-3 text-lg leading-6"
  //           aria-invalid={actionData?.errors?.body ? true : undefined}
  //           aria-errormessage={
  //             actionData?.errors?.body ? "body-error" : undefined
  //           }
  //         />
  //       </label>
  //       {actionData?.errors?.body && (
  //         <div className="pt-1 text-red-700" id="body-error">
  //           {actionData.errors.body}
  //         </div>
  //       )}
  //     </div>

  //     <div className="text-right">
  //       <button type="submit" className="btn-outline btn">
  //         Save
  //       </button>
  //     </div>
  //   </Form>
  // );
}
