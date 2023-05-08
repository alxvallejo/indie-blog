import { useEffect } from "react";
import { themeChange } from "theme-change";
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

  useEffect(() => {
    themeChange(false);
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme) {
      const body = document.body;
      body.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleThemeChange = (theme: string) => {
    const body = document.body;
    body.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn-ghost btn-circle btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <Link to="/categories">Categories</Link>
              </li>
              <li>
                <Link to="/questions">Questions</Link>
              </li>
              <li>
                <Link to="/notes">Notes</Link>
              </li>
              <li>
                <Link to="/trivia">Trivia</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="navbar-center">
          <Link to=".">
            <div className="font-title inline-flex text-lg text-primary transition-all duration-200 md:text-3xl">
              <span className="lowercase">Bowst</span>{" "}
              <span className="font-bold text-base-content">Standup</span>
            </div>
          </Link>
        </div>
        {/* <div className="flex-1 px-2 lg:flex-none">
          <h1 className="text-3xl">
            <Link to=".">
              <div className="font-title inline-flex text-lg text-primary transition-all duration-200 md:text-3xl">
                <span className="lowercase">Bowst</span>{" "}
                <span className="font-bold text-base-content">Standup</span>
              </div>
            </Link>
          </h1>
        </div> */}
        <div className="navbar-end">
          <div className="flex flex-1 justify-end px-2">
            <div className="flex items-center">
              <div>{user.name || user.email}</div>

              <div className="dropdown dropdown-end m-3">
                <label
                  tabIndex={0}
                  className="btn-ghost rounded-btn btn lowercase"
                >
                  Theme
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu rounded-box mt-4 w-52 bg-base-100 p-2 "
                >
                  <li onClick={() => handleThemeChange("winter")}>
                    <button className="btn-ghost btn">Winter</button>
                  </li>
                  <li onClick={() => handleThemeChange("cupcake")}>
                    <button className="btn-ghost btn">Cupcake</button>
                  </li>
                  <li onClick={() => handleThemeChange("synthwave")}>
                    <button className="btn-ghost btn">Synthwave</button>
                  </li>
                  <li onClick={() => handleThemeChange("emerald")}>
                    <button className="btn-ghost btn">Emerald</button>
                  </li>
                  <li onClick={() => handleThemeChange("business")}>
                    <button className="btn-ghost btn">Business</button>
                  </li>
                  <li onClick={() => handleThemeChange("cyberpunk")}>
                    <button className="btn-ghost btn">Cyberpunk</button>
                  </li>
                  <li onClick={() => handleThemeChange("cmyk")}>
                    <button className="btn-ghost btn">CMYK</button>
                  </li>
                  <li onClick={() => handleThemeChange("dark")}>
                    <button className="btn-ghost btn">Dark</button>
                  </li>
                </ul>
              </div>
              <Form action="/logout" method="post">
                <button type="submit" className="rounded py-2 px-4">
                  Logout
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>

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
        <div className="w-full flex-1 p-6">
          <Outlet />
        </div>

        {/* <div className="drawer-mobile drawer ">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col items-center justify-center">
            <label
              htmlFor="my-drawer-2"
              className="btn-primary drawer-button btn lg:hidden"
            >
              Open drawer
            </label>
            <div className="w-full flex-1 p-6">
              <Outlet />
            </div>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
            <ul className="menu w-80 bg-base-100 p-4 text-base-content">
              <li>
                <Link to="/categories">Categories</Link>
              </li>
              <li>
                <Link to="/questions">Questions</Link>
              </li>
              <li>
                <Link to="/notes">Notes</Link>
              </li>
              <li>
                <Link to="/trivia">Trivia</Link>
              </li>
            </ul>
          </div>
        </div> */}
      </main>
    </div>
  );
}
