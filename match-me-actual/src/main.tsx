import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, redirect } from "react-router";
import { RouterProvider } from "react-router/dom";

// Screens
import RegisterScreenRoute from "./screens/register/route";
import LoginScreenRoute from "./screens/login/route";
import ProfileSelfSetupScreen from "./screens/profile-self-setup/route";
import ProfileMainRoute from "./screens/profile/route";
import ProfileSettingsRoute from "./screens/profile-settings/route";
import BioSetupRoute from "./screens/bio-setup/route";
import ExploreRoute from "./screens/explore/route";
import ConnectionsRoute from "./screens/connections/route";

import { WebSocketProvider } from "./providers/WebSocketProvider";
import { NotificationsProvider } from "./providers/NotificationsProvider";

const router = createBrowserRouter([
  {
    path: "/",
    action: async ({ request }) => {
      const formData = await request.formData();
      const email = formData.get("email");
      const password = formData.get("password");
      const passwordConfirmation = formData.get("confirmPassword");

      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, passwordConfirmation }),
      });

      return res.json();
    },
    element: <RegisterScreenRoute />,
  },
  {
    path: "/login",
    action: async ({ request }) => {
      const formData = await request.formData();
      const email = formData.get("email");
      const password = formData.get("password");

      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const resJson: { success: boolean } = await res.json();

      // If all went well - redirect to profile
      if (resJson.success) {
        return redirect("/profile");
      } else {
        return resJson;
      }
    },
    element: <LoginScreenRoute />,
  },
  {
    path: "/logout",
    action: async () => {
      const res = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        return redirect("/login");
      }
    },
  },

  // Main profile route
  {
    path: "/profile",
    loader: async () => {
      // Try to get profile info
      const profileReq = await fetch("http://localhost:3000/api/me/profile", {
        credentials: "include",
      });

      // Unauthorized
      if (profileReq.status === 401) {
        return redirect("/login");

        // Profile was not set up yet
      } else if (profileReq.status === 404) {
        return redirect("/profile/setup");
      }

      // Try to get bio info
      const bioReq = await fetch("http://localhost:3000/api/me/bio", {
        credentials: "include",
      });

      if (bioReq.status === 401) {
        return redirect("/login");

        // Profile was not set up yet
      } else if (bioReq.status === 404) {
        return redirect("/bio/setup");
      }

      const profileInfo = await profileReq.json();
      const bioInfo = await bioReq.json();

      return { success: true, profile: profileInfo.profile, bio: bioInfo.bio };
    },
    element: (
      <WebSocketProvider>
        <NotificationsProvider>
          <ProfileMainRoute />
        </NotificationsProvider>
      </WebSocketProvider>
    ),
    children: [
      // Settings route
      {
        path: "settings",
        loader: async () => {
          const res = await fetch("http://localhost:3000/api/me/profile", {
            credentials: "include",
          });

          if (!res.ok) {
            return redirect("/login");
          }

          const bioRes = await fetch("http://localhost:3000/api/me/bio", {
            credentials: "include",
          });

          if (!bioRes.ok) {
            return redirect("/login");
          }

          const profileInfo = await res.json();
          const bioInfo = await bioRes.json();

          return {
            ...profileInfo,
            ...bioInfo,
          };
        },
        element: <ProfileSettingsRoute />,
      },

      // Explore new connections route
      {
        path: "explore",
        element: <ExploreRoute />,
      },

      // Connections
      {
        path: "connections",
        loader: async () => {
          const connectionsReq = await fetch(
            "http://localhost:3000/api/connections",
            {
              credentials: "include",
            },
          );

          if (connectionsReq.ok) {
            const connectionRes = await connectionsReq.json();

            return connectionRes;
          } else {
            return { success: false };
          }
        },
        element: <ConnectionsRoute />,
      },
    ],
  },

  // Profile setup routes
  {
    path: "/profile/setup",
    // Check if user is already set his self-info and redirect away from this route if so
    loader: async () => {
      const res = await fetch("http://localhost:3000/api/me/profile", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          return redirect("/login");
        }
        return null;
      } else {
        return redirect("/profile");
      }
    },
    action: async ({ request }) => {
      const formData = await request.formData();

      // After validation - send request to server
      const res = await fetch("http://localhost:3000/api/me/profile", {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      // If all went well -> Redirect to profile page
      if (res.ok) {
        return redirect("/profile");
      }
    },
    element: <ProfileSelfSetupScreen />,
  },

  // Bio setup route
  {
    path: "/bio/setup",
    loader: async () => {
      const res = await fetch("http://localhost:3000/api/me/bio", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          return redirect("/login");
        }
        return null;
      } else {
        return redirect("/profile");
      }
    },
    action: async ({ request }) => {
      const formData = await request.formData();

      const interests = formData.getAll("interests");
      const hobbies = formData.getAll("hobbies");
      const music = formData.get("music");
      const food = formData.get("food");
      const location = formData.get("location");
      const walks = formData.get("walks");
      const travel = formData.get("travel");

      if (!interests || !interests.length) {
        return { success: false, field: "interests" };
      } else if (!hobbies || !hobbies.length) {
        return { success: false, field: "hobbies" };
      } else if (!travel) {
        return { success: false, field: "travel" };
      } else if (!walks) {
        return { success: false, field: "walks" };
      }

      // Send request to server
      const res = await fetch("http://localhost:3000/api/me/bio", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          interests,
          hobbies,
          music,
          food,
          location,
          walks,
          travel,
        }),
      });

      if (res.ok) {
        return redirect("/profile");
      }
      return res.json();
    },
    element: <BioSetupRoute />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
