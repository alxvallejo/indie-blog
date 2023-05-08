import type {
  LinksFunction,
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import stylesUrl from "~/styles/index.css";
import { useOptionalUser } from "~/utils";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/trivia");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/notes");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export default function Index() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/trivia";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const user = useOptionalUser();

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Bowpourri</h1>
          <p className="py-6">
            Powered by Remix, Supabase, Tailwind, Socket.IO, and Chat-GPT.
          </p>
        </div>
        <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
          <div className="card-body">
            <Form method="post" className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  required
                  autoFocus={true}
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={actionData?.errors?.email ? true : undefined}
                  aria-describedby="email-error"
                  placeholder="email"
                  className="input-bordered input"
                />
                {actionData?.errors?.email && (
                  <div className="pt-1 text-red-700" id="email-error">
                    {actionData.errors.email}
                  </div>
                )}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  id="password"
                  ref={passwordRef}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={actionData?.errors?.password ? true : undefined}
                  aria-describedby="password-error"
                  placeholder="password"
                  className="input-bordered input"
                />
                {actionData?.errors?.password && (
                  <div className="pt-1 text-red-700" id="password-error">
                    {actionData.errors.password}
                  </div>
                )}
                {/* <label className="label">
                  <a href="#" className="link-hover label-text-alt link">
                    Forgot password?
                  </a>
                </label> */}
              </div>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <div className="form-control mt-6">
                <button className="btn-primary btn">Login</button>
              </div>
              <div className="form-control mt-6">
                <Link
                  className=" text-blue-500 underline"
                  to={{
                    pathname: "/join",
                    search: searchParams.toString(),
                  }}
                >
                  <button type="submit" className="btn-primary btn w-full">
                    Signup
                  </button>
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
