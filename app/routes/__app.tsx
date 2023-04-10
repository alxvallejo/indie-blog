import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getNoteListItems } from "~/models/note.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const noteListItems = await getNoteListItems({ userId });
  return json({ noteListItems });
}

export default function Layout() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl">
          <Link to=".">
            <div className="font-title inline-flex text-lg text-primary transition-all duration-200 md:text-3xl">
              <span className="lowercase">Bowst</span>{" "}
              <span className="font-bold text-base-content">Standup</span>
            </div>
          </Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button type="submit" className="rounded py-2 px-4">
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full">
        {/* <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Note
          </Link>

          <hr />

          {data.noteListItems.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.noteListItems.map((note) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={note.id}
                  >
                    📝 {note.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div> */}

        <div className="drawer-mobile drawer ">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col items-center justify-center">
            <label
              htmlFor="my-drawer-2"
              className="btn-primary drawer-button btn lg:hidden"
            >
              Open drawer
            </label>
            <div className="flex-1 p-6">
              <Outlet />
            </div>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
            <ul className="menu w-80 bg-base-100 p-4 text-base-content">
              <li>
                <Link to="/questions">Questions</Link>
              </li>
              <li>
                <Link to="/notes">Notes</Link>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
