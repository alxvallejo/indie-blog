import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import {
  useControlField,
  useFieldArray,
  ValidatedForm,
  validationError,
  ValidatorData,
} from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";

import { createCategory } from "~/models/category.server";
import { requireUserId } from "~/session.server";
import { ColorInput } from "~/components/inputs";
import { useState } from "react";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const color = formData.get("color");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", color: null } },
      { status: 400 }
    );
  }

  if (typeof color !== "string" || color.length === 0) {
    return json(
      { errors: { title: null, color: "Color is required" } },
      { status: 400 }
    );
  }

  const category = await createCategory({ title, color });

  return category;
}

export const CategoryForm = () => {
  const actionData = useActionData<typeof action>();
  console.log("actionData: ", actionData);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const colorRef = React.useRef<HTMLTextAreaElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");

  // const [selectedColor, setSelectedColor] = useControlField("color");

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.color) {
      colorRef.current?.focus();
    }
  }, [actionData]);

  const handleColorChange = (color: any) => {
    console.log("color: ", color);
  };

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Category Name: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div>
        {/* <label className="flex w-full flex-col gap-1">
          <span>Category Color: </span>
        </label> */}
        <ColorInput
          name="color"
          label="Category Color"
          onChange={handleColorChange}
        />
      </div>
      <div>
        {actionData?.errors?.color && (
          <div className="pt-1 text-red-700" id="color-error">
            {actionData.errors.color}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
};
