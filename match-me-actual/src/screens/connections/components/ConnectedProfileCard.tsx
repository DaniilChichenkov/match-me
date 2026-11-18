import {
  ArrowUpRight,
  Ellipsis,
  MapPin,
  MessageCircle,
  User,
  UserRoundX,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { useNotifications } from "../../../providers/NotificationsProvider";

const ConnectedProfileCard = ({
  profileId,
  openProfileDetails,
  showDisconnectWarning,
  openChat,
}: {
  profileId: string;
  openProfileDetails: () => void;
  showDisconnectWarning: () => void;
  openChat: () => void;
}) => {
  const [isLoading, setLoadingState] = useState(false);
  const [userProfileData, setUserProfileData] = useState<{
    firstname: string;
    lastname: string;
    profilePic: string;
  } | null>(null);
  const [userBioData, setUserBioData] = useState<{
    music: string;
    food: string;
    location: string;
    walks: string;
    travel: string;
    hobbies: string[];
    interests: string[];
    id: string;
  } | null>(null);

  const { notifications } = useNotifications();
  const notificationsFromThisUser = notifications?.find(
    (item) => item.messageFrom === profileId,
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoading && profileId) {
        setLoadingState(() => true);

        const userProfileDataReq = await fetch(
          `http://localhost:3000/api/users/${profileId}`,
          { credentials: "include" },
        );

        if (userProfileDataReq.ok) {
          const userBioDataReq = await fetch(
            `http://localhost:3000/api/users/${profileId}/bio`,
            { credentials: "include" },
          );

          if (userBioDataReq.ok) {
            const userProfileDataRes = await userProfileDataReq.json();
            const userBioDataRes = await userBioDataReq.json();

            setUserProfileData(userProfileDataRes.userProfileData);
            setUserBioData(userBioDataRes.userBio);
          }
        }

        setLoadingState(() => false);
      }
    };
    fetchUserData();
  }, [profileId]);

  return (
    <div className="card w-full bg-base-100 card-sm shadow-sm">
      <div className="card-body">
        {isLoading ? (
          <span className="loading loading-spinner loading-lg"></span>
        ) : (
          <>
            {/* Profile info */}
            <div className="w-full flex justify-between items-start">
              <div className="flex-1 flex justify-start items-center gap-2">
                {userProfileData?.profilePic ? (
                  <div className="avatar shrink-0">
                    <div className="w-16 rounded-full">
                      <img
                        alt="Tailwind-CSS-Avatar-component"
                        src={`http://localhost:3000/uploads/avatars/${userProfileData?.profilePic}`}
                      />
                    </div>
                  </div>
                ) : (
                  <User className="shrink-0" />
                )}
                <div>
                  <p className="text-lg font-bold">
                    {userProfileData?.firstname} {userProfileData?.lastname}
                  </p>
                  <p className="flex items-center capitalize">
                    <MapPin size={14} /> {userBioData?.location}
                  </p>
                </div>
              </div>

              {/* Options btn */}
              <button
                popoverTarget={`popover-${profileId}`}
                style={
                  {
                    anchorName: `--popover-${profileId}`,
                  } /* as React.CSSProperties */
                }
                className="shrink-0 cursor-pointer"
              >
                <Ellipsis />
              </button>

              <ul
                className="dropdown menu w-40 space-y-2 rounded-box bg-base-100 shadow-sm [position-anchor:--menu-anchor] [top:anchor(bottom)] [left:anchor(left)] [position-try-fallbacks:flip-block,flip-inline,flip-block_flip-inline]"
                popover="auto"
                id={`popover-${profileId}`}
                style={
                  {
                    positionAnchor: `--popover-${profileId}`,
                  } /* as React.CSSProperties */
                }
              >
                <li>
                  <button
                    onClick={showDisconnectWarning}
                    className="btn w-full border border-red-500 text-red-500 rounded-lg text-xs"
                  >
                    <UserRoundX />
                    Disconnect
                  </button>
                </li>
                <li>
                  <button
                    onClick={openProfileDetails}
                    className="btn w-full border border-purple-500 text-purple-500 rounded-lg text-xs"
                  >
                    <ArrowUpRight /> Watch profile
                  </button>
                </li>
              </ul>
            </div>

            {/* Chat button */}
            <button
              onClick={openChat}
              className="btn w-full rounded-lg mt-5 border border-purple-500 text-purple-500 bg-white"
            >
              <MessageCircle /> Chat{" "}
              {notificationsFromThisUser ? (
                <div className="badge badge-sm badge-primary">
                  +{notificationsFromThisUser.unreadCount}
                </div>
              ) : null}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectedProfileCard;
