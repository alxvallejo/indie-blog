import { useEffect, useState } from "react";
import { themeChange } from "theme-change";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getNoteListItems } from "~/models/note.server";
import io from "socket.io-client";

const themeList = [
  {
    value: "garden",
    label: "Garden",
  },
  {
    value: "aqua",
    label: "Aqua",
  },
  {
    value: "winter",
    label: "Winter",
  },
  {
    value: "cupcake",
    label: "Cupcake",
  },
  {
    value: "synthwave",
    label: "Synthwave",
  },
  {
    value: "emerald",
    label: "Emerald",
  },
  {
    value: "business",
    label: "Business",
  },
  {
    value: "cmyk",
    label: "CMYK",
  },
  {
    value: "dark",
    label: "Dark",
  },
];

export async function loader({ request }: LoaderArgs) {
  // const userId = await requireUserId(request);
  // const noteListItems = await getNoteListItems({ userId });
  const wsUrl = process.env.WEBSOCKET_API || "http://localhost:4000";
  return json({ wsUrl });
}

export default function Layout() {
  const { wsUrl } = useLoaderData<typeof loader>();
  const [currentTheme, setCurrentTheme] = useState("");
  const user = useUser();
  const socket = io.connect(wsUrl);
  console.log("LOADING SOCKET");

  useEffect(() => {
    themeChange(false);
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme) {
      const body = document.body;
      body.setAttribute("data-theme", savedTheme);
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (theme: string) => {
    const body = document.body;
    body.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
    setCurrentTheme(theme);
  };

  const themeRowClass = (theme): string => {
    const isActive = currentTheme && currentTheme === theme;
    return isActive ? `btn-ghost btn active` : `btn-ghost btn`;
  };

  const ThemeListItem = ({ theme }) => {
    return (
      <li onClick={() => handleThemeChange(theme.value)}>
        <button className={themeRowClass(theme.value)}>{theme.label}</button>
      </li>
    );
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
                  {themeList.map((theme, i) => {
                    return <ThemeListItem key={i} theme={theme} />;
                  })}
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
        <div className="w-full flex-1 p-6">
          <Outlet context={{ socket }} />
        </div>
      </main>
    </div>
  );
}
