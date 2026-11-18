import React, {
  useContext,
  useEffect,
  useState,
  createContext,
  useRef,
} from "react";

import { useWebSocket } from "./WebSocketProvider";

type Notification = {
  messageFrom: string;
  unreadCount: number;
};

type NotificationsContextType = {
  notifications: Notification[];
  currentlyOpenedChat: string | null;
  openChat: (chatWith: string) => void;
  closeChat: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(
  null,
);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState([]);
  const [currentlyOpenedChat, setCurrentlyOpenedChat] = useState(null);
  const { socket } = useWebSocket();
  const isFetching = useRef(false);

  const fetchNotifications = async () => {
    if (!isFetching.current) {
      isFetching.current = true;

      const notificationsReq = await fetch(
        "http://localhost:3000/api/notifications",
        { credentials: "include" },
      );

      if (notificationsReq.ok) {
        const notificationsRes = await notificationsReq.json();

        setNotifications(notificationsRes.notifications);
      }

      isFetching.current = false;
    }
  };

  // Function which removes notifications by opening a chat
  const openChat = async (chatWith: string) => {
    setCurrentlyOpenedChat(() => chatWith);

    if (!isFetching.current) {
      isFetching.current = true;

      await fetch(`http://localhost:3000/api/notifications/${chatWith}`, {
        credentials: "include",
        method: "DELETE",
      });

      isFetching.current = false;

      fetchNotifications();
    }
  };

  // Fetch notifications on new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (event: MessageEvent) => {
      const payload = JSON.parse(event.data);

      // On new message make a request for notifications
      if (payload.type === "new-message") {
        fetchNotifications();
      }
    };

    socket.addEventListener("message", handleNewMessage);

    return () => {
      socket.removeEventListener("message", handleNewMessage);
    };
  }, [socket]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        currentlyOpenedChat,
        openChat,
        closeChat: () => setCurrentlyOpenedChat(() => null),
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) return;

  return context;
}
