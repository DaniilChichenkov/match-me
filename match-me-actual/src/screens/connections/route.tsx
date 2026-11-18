import { Dot, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";

import {
  PendingConnectionProfile,
  PendingConnectionProfileDetails,
  ConnectedProfileCard,
  DisconnectConfirmation,
  Chat,
} from "./components";

import { useNotifications } from "../../providers/NotificationsProvider";
import { useWebSocket } from "../../providers/WebSocketProvider";

const ConnectionsRoute = () => {
  const loaderData = useLoaderData<{
    success: boolean;
    pending: {
      id: string;
      senderId: string;
    }[];
    connected: {
      connectionId: string;
      profileId: string;
    }[];
  }>();

  const { openChat: openChatNotificationsProvider, closeChat } =
    useNotifications();

  const modalRef = useRef<HTMLDialogElement>(null);
  const [componentToRender, setComponentToRender] =
    useState<React.ReactNode | null>(null);

  const revalidator = useRevalidator();
  const { socket } = useWebSocket();

  const [detailedProfileOverviewId, setDetailedProfileOverviewId] = useState<
    string | null
  >(null);
  const [userToDisconnectId, setUserToDisconnectId] = useState<string | null>(
    null,
  );
  const [chatOfConnectionId, setChatOfConnectionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (modalRef.current) {
      // Render detailed profile overview
      if (detailedProfileOverviewId) {
        setComponentToRender(
          <PendingConnectionProfileDetails
            profileId={detailedProfileOverviewId}
          />,
        );
        modalRef.current?.showModal();
      }

      // Render disconnect warning
      if (userToDisconnectId) {
        setComponentToRender(
          <DisconnectConfirmation profileId={userToDisconnectId} />,
        );
        modalRef.current?.showModal();
      }

      // Render chat
      if (chatOfConnectionId) {
        setComponentToRender(<Chat connectionId={chatOfConnectionId} />);
        modalRef.current?.showModal();
      }
    }
  }, [detailedProfileOverviewId, userToDisconnectId, chatOfConnectionId]);

  // Revalidate connections on new messages
  useEffect(() => {
    if (!socket) return;

    const handleMessageEvent = () => {
      revalidator.revalidate();
    };

    socket.addEventListener("message", handleMessageEvent);

    return () => {
      socket.removeEventListener("message", handleMessageEvent);
    };
  }, [socket]);

  const clearModalWindowContent = () => {
    setComponentToRender(() => null);
    setDetailedProfileOverviewId(() => null);
    setUserToDisconnectId(() => null);
    setChatOfConnectionId(() => null);
    closeChat();
  };

  return (
    <>
      <div className="w-full md:w-8/12 xl:w-6/12 md:mx-auto lg:mx-0 flex flex-col items-center gap-4 px-4 pt-10 pb-32">
        <header className="w-full flex flex-col items-start justify-start">
          <p className="text-3xl font-bold mt-2">Your connections</p>
          <p className="text-slate-700 flex justify-start items-center">
            {loaderData.connected.length} connected <Dot />{" "}
            {loaderData.pending.length} requests
          </p>
        </header>

        {/* Requests */}
        {loaderData.success && loaderData.pending.length ? (
          <div className="card w-full lg:w-8/12 xl:w-6/12 lg:mr-auto bg-base-100 card-md shadow-sm">
            <div className="card-body p-2 py-4">
              <div className="w-full flex justify-between items-center">
                <h2 className="card-title">Connection requests</h2>
                <span className="badge rounded-lg bg-purple-100 text-purple-700">
                  {loaderData.pending.length} new
                </span>
              </div>
              <div className="w-full flex flex-col items-center mt-4">
                {loaderData.pending.map((pendingConnection, i, arr) => (
                  <div className="w-full" key={pendingConnection.id}>
                    <PendingConnectionProfile
                      profileId={pendingConnection.senderId}
                      openProfileDetails={() =>
                        setDetailedProfileOverviewId(pendingConnection.senderId)
                      }
                      key={pendingConnection.id}
                    />{" "}
                    {i < arr.length - 1 && (
                      <div className="divider m-0 p-5"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Connected people */}
        {loaderData.success ? (
          <div className="w-full">
            <p className="text-lg font-bold text-left w-full">
              Connected people
            </p>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
              {loaderData.connected.map((connectedProfile) => (
                <ConnectedProfileCard
                  key={`connected-profile-${connectedProfile.profileId}`}
                  profileId={connectedProfile.profileId}
                  openProfileDetails={() =>
                    setDetailedProfileOverviewId(connectedProfile.profileId)
                  }
                  showDisconnectWarning={() =>
                    setUserToDisconnectId(connectedProfile.connectionId)
                  }
                  openChat={() => {
                    openChatNotificationsProvider(connectedProfile.profileId);
                    setChatOfConnectionId(connectedProfile.connectionId);
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <dialog
        onClose={clearModalWindowContent}
        ref={modalRef}
        id="my_modal_1"
        className="modal"
      >
        <div className="modal-box p-2">
          <div className="modal-action m-0 p-0">
            <form method="dialog">
              <button className="cursor-pointer">
                <X />
              </button>
            </form>
          </div>
          {componentToRender}
        </div>
      </dialog>
    </>
  );
};

export default ConnectionsRoute;
