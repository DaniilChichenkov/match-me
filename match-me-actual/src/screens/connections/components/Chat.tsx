import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useWebSocket } from "../../../providers/WebSocketProvider";

// Function to format time to user-friendly format
function formatMessageDate(timestamp: Date | string) {
  const date = new Date(timestamp);
  const now = new Date();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (date.toDateString() === now.toDateString()) {
    return `Today, ${time}`;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Chat = ({ connectionId }: { connectionId: string }) => {
  const [isLoading, setLoadingState] = useState(false);
  const [messages, setMessages] = useState<
    {
      id: string;
      content: string;
      senderId: string;
      createdAt: string;
      readAt: string;
    }[]
  >([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canFetchMore, setFetchMorePossibility] = useState<boolean | null>(
    null,
  );
  const [page, setPage] = useState(0);

  // Socket context
  const { socket, isConnected } = useWebSocket();

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async () => {
    if (!isLoading) {
      setLoadingState(() => true);

      const messagesReq = await fetch(
        `http://localhost:3000/api/connections/${connectionId}/${page}`,
        {
          credentials: "include",
        },
      );

      if (messagesReq.ok) {
        const messagesRes: {
          success: boolean;
          canFetchMore: boolean;
          messages: {
            id: string;
            content: string;
            senderId: string;
            createdAt: string;
            readAt: string;
          }[];
          currentUser: string;
        } = await messagesReq.json();

        if (messagesRes.canFetchMore) {
          setPage((state) => state + 1);
        }

        setFetchMorePossibility(() => messagesRes.canFetchMore);

        setMessages((state) => [...messagesRes.messages, ...state]);
        setCurrentUserId(() => messagesRes.currentUser);
      }

      setLoadingState(() => false);
    }
  };

  // Handle send message event
  const [textareaValue, setTextareaValue] = useState("");
  const sendMessage = () => {
    if (!textareaValue || socket?.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "send-message",
        data: {
          connectionId,
          value: textareaValue,
        },
      }),
    );

    setTextareaValue("");
  };

  useEffect(() => {
    fetchMessages();
  }, [connectionId]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const payload = JSON.parse(event.data);

      if (payload.type === "new-message") {
        setMessages((state) => [...state, payload.data.message]);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  // Check if user scrolled chat to the top and fetch previous message (If exists)
  useEffect(() => {
    if (!topRef.current || !messagesContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (canFetchMore) {
            fetchMessages();
          }
        }
      },
      {
        root: messagesContainerRef.current,
        rootMargin: "100px 0px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(topRef.current);

    return () => observer.disconnect();
  }, [canFetchMore, messages]);

  useLayoutEffect(() => {
    if (!messages.length) return;

    const container = messagesContainerRef.current;

    if (!container) return;

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div className="w-full h-[80vh] flex flex-col justify-between">
      <div
        ref={messagesContainerRef}
        className="w-full flex-1 py-6 flex flex-col gap-y-5 overflow-y-scroll"
      >
        <div ref={topRef} className="h-px w-full"></div>

        {/* Messages */}
        {currentUserId &&
          messages &&
          messages.map((msg) =>
            msg.senderId === currentUserId ? (
              <div key={msg.id} className="chat chat-end">
                <div className="chat-header">
                  <time className="text-xs opacity-50">
                    {formatMessageDate(msg.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble">{msg.content}</div>
              </div>
            ) : (
              <div key={msg.id} className="chat chat-start">
                <div className="chat-header">
                  <time className="text-xs opacity-50">
                    {formatMessageDate(msg.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble">{msg.content}</div>
              </div>
            ),
          )}
      </div>

      <div className="mt-auto">
        <textarea
          className="textarea rounded-lg resize-none w-full"
          placeholder="Type your message here"
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.currentTarget.value)}
        ></textarea>
        <button
          onClick={sendMessage}
          className="btn w-full bg-white border border-purple-500 text-purple-500 rounded-lg mt-2"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
