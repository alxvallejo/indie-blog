import React, { useState, useEffect, useRef } from "react";
import Sidebar from "~/components/layouts/Sidebar";
import Header from "~/components/layouts/Header";
import MessagesSidebar from "~/components/messages/MessagesSidebar";
import MessagesHeader from "~/components/messages/MessagesHeader";
import MessagesBody from "~/components/messages/MessagesBody";
import MessagesFooter from "~/components/messages/MessagesFooter";

function Messages() {
  const contentArea = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [msgSidebarOpen, setMsgSidebarOpen] = useState(true);

  useEffect(() => {
    if (contentArea) {
      contentArea.current.scrollTop = 99999999;
    }
  }, [msgSidebarOpen]); // automatically scroll the chat and make the most recent message visible

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div
        className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
        ref={contentArea}
      >
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="relative flex">
            {/* Messages sidebar */}
            <MessagesSidebar
              msgSidebarOpen={msgSidebarOpen}
              setMsgSidebarOpen={setMsgSidebarOpen}
            />

            {/* Messages body */}
            <div
              className={`flex grow flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
                msgSidebarOpen ? "translate-x-1/3" : "translate-x-0"
              }`}
            >
              <MessagesHeader
                msgSidebarOpen={msgSidebarOpen}
                setMsgSidebarOpen={setMsgSidebarOpen}
              />
              <MessagesBody />
              <MessagesFooter />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Messages;
