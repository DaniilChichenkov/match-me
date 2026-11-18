import {
  LogOut,
  Settings,
  User,
  Users,
  Ellipsis,
  MessageCircle,
  Search,
} from "lucide-react";
import { Form, Link, NavLink, Outlet, useOutlet } from "react-router";

import { MainProfileComponent } from "./components";
import { useWebSocket } from "../../providers/WebSocketProvider";
import { useNotifications } from "../../providers/NotificationsProvider";
import { useEffect, useRef, useState } from "react";

const ProfileMainRoute = () => {
  const outlet = useOutlet();

  const [alertInView, setAlertViewState] = useState(false);
  const timerRef = useRef(null);

  const { socket } = useWebSocket();
  const { notifications, currentlyOpenedChat } = useNotifications();

  const displayAlert = () => {
    clearTimeout(timerRef.current);
    setAlertViewState(() => true);
    timerRef.current = setTimeout(() => {
      setAlertViewState(() => false);
    }, 3000);
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const payload = JSON.parse(event.data);

      if (payload.type === "new-message") {
        console.log(payload);
        // Check if message was sent not by user and chat with this user is not currently open
        if (
          payload.data.currentUser !== payload.data.message.senderId &&
          payload.data.message.senderId !== currentlyOpenedChat
        ) {
          displayAlert();
        }

        console.log(payload);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  return (
    <>
      <div className="drawer lg:drawer-open z-0">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          {/* Page content here */}
          <main className="w-full h-screen overflow-y-scroll bg-purple-50">
            {outlet ? <Outlet /> : <MainProfileComponent />}

            {/* Dock */}
            <div className="dock lg:hidden">
              <NavLink end to="/profile">
                <User className="shrink-0" />
                <span className="dock-label">Profile</span>
              </NavLink>

              <NavLink end to="/profile/connections">
                <Users className="shrink-0" />
                <div className="flex justify-start items-center gap-1">
                  <span className="dock-label">Connections </span>
                  {notifications.length > 0 ? (
                    <div className="badge badge-primary badge-xs"></div>
                  ) : null}
                </div>
              </NavLink>

              <NavLink end to="/profile/explore">
                <Search className="shrink-0" />
                <span className="dock-label">Explore</span>
              </NavLink>

              <NavLink to="/profile/settings">
                <Settings className="shrink-0" />
                <span className="dock-label">Settings</span>
              </NavLink>
            </div>
          </main>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-3"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-white rounded-lg min-h-full w-52 p-4 gap-y-2">
            {/* Sidebar content here */}
            <li>
              <NavLink
                to="/profile"
                end
                className={({ isActive }) =>
                  `shadow-none rounded-xl ${isActive ? "bg-purple-200 border border-purple-400 text-purple-700" : "text-black bg-transparent"}`
                }
              >
                <User className="shrink-0" />
                <span className="dock-label">Profile</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile/connections"
                end
                className={({ isActive }) =>
                  `shadow-none rounded-xl ${isActive ? "bg-purple-200 border border-purple-400 text-purple-700" : "text-black bg-transparent"}`
                }
              >
                <Users className="shrink-0" />
                <span className="dock-label flex justify-start items-center gap-2">
                  Connections
                </span>

                {notifications.length > 0 ? (
                  <div className="badge badge-primary badge-xs"></div>
                ) : null}
              </NavLink>
            </li>
            <li>
              <NavLink
                end
                to="/profile/explore"
                className={({ isActive }) =>
                  `shadow-none rounded-xl ${isActive ? "bg-purple-200 border border-purple-400 text-purple-700" : "text-black bg-transparent"}`
                }
              >
                <Search className="shrink-0" />
                <span className="dock-label">Explore</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  `shadow-none rounded-xl ${isActive ? "bg-purple-200 border border-purple-400 text-purple-700" : "text-black bg-transparent"}`
                }
                to="/profile/settings"
              >
                <Settings className="shrink-0" />
                <span className="dock-label">Settings</span>
              </NavLink>
            </li>

            <li>
              <Form method="POST" action="/logout">
                <button className="shadow-none text-black bg-transparent flex justify-center items-center gap-2 cursor-pointer rounded-xl">
                  {" "}
                  <LogOut />
                  Log out
                </button>
              </Form>
            </li>
          </ul>
        </div>
      </div>

      {/* Notifications alert */}
      <div
        className={`w-full absolute z-100 flex justify-center items-center transition-all duration-200 ${alertInView ? "-top-0" : "-top-full"}`}
      >
        <div role="alert" className="alert alert-info mt-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>You have new message</span>
        </div>
      </div>
    </>
  );
};

export default ProfileMainRoute;
