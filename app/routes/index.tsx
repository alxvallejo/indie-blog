import { Link } from "@remix-run/react";
import { useState } from "react";
import Sidebar from "~/components/layouts/Sidebar";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"></div>
    </div>
  );
}
