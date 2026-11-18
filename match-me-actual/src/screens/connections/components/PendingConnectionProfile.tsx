import { ArrowUpRight, Check, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRevalidator } from "react-router";

const PendingConnectionProfile = ({
  profileId,
  openProfileDetails,
}: {
  profileId: string;
  openProfileDetails: () => void;
}) => {
  const [isLoading, setLoadingState] = useState(false);
  const [isConnectionRequestLoading, setConnectionRequestStatus] =
    useState(false);
  const [requestStatus, setRequestStatus] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState<{
    firstname: string;
    lastname: string;
    profilePic: string;
  } | null>(null);
  const revalidator = useRevalidator();

  useEffect(() => {
    if (profileId && !isLoading) {
      const fetchUserProfile = async () => {
        setLoadingState(() => true);

        const profileDataReq = await fetch(
          `http://localhost:3000/api/users/${profileId}`,
          { credentials: "include" },
        );

        if (profileDataReq.ok) {
          const profileDataRes = await profileDataReq.json();
          setProfileData(profileDataRes.userProfileData);
          setRequestStatus(() => true);
        } else {
          setRequestStatus(() => false);
        }

        setLoadingState(() => false);
      };
      fetchUserProfile();
    }
  }, [profileId]);

  const handleRequestAccept = async () => {
    if (!isConnectionRequestLoading) {
      setConnectionRequestStatus(() => true);

      await fetch(`http://localhost:3000/api/connections`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({
          connectionWith: profileId,
          connectionStatus: "accepted",
        }),
      });

      setConnectionRequestStatus(() => false);
      revalidator.revalidate();
    }
  };

  const handleRequestDecline = async () => {
    if (!isConnectionRequestLoading) {
      setConnectionRequestStatus(() => true);

      await fetch(`http://localhost:3000/api/connections`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({
          connectionWith: profileId,
          connectionStatus: "dismissed",
        }),
      });

      setConnectionRequestStatus(() => false);
      revalidator.revalidate();
    }
  };

  return isLoading && requestStatus !== null ? null : requestStatus === true &&
    profileData ? (
    <div className="w-full flex justify-start items-center gap-4">
      {/* Profile picture */}
      <div>
        {profileData.profilePic ? (
          <div className="avatar">
            <div className="w-16 rounded-full">
              <img
                alt="Tailwind-CSS-Avatar-component"
                src={`http://localhost:3000/uploads/avatars/${profileData.profilePic}`}
              />
            </div>
          </div>
        ) : (
          <User />
        )}
      </div>

      <div>
        <p className="text-slate-700 font-semibold">
          {profileData.firstname} {profileData.lastname}
        </p>
        <button
          onClick={openProfileDetails}
          className="text-blue-500 flex justify-start items-center text-xs cursor-pointer"
        >
          Watch profile <ArrowUpRight />
        </button>
        <div className="w-full grid grid-cols-2 mt-2 gap-2">
          <button
            disabled={isConnectionRequestLoading}
            onClick={handleRequestAccept}
            className="btn btn-xs bg-purple-700 border-purple-700 text-white rounded-lg"
          >
            <Check />
            Accept
          </button>
          <button
            disabled={isConnectionRequestLoading}
            onClick={handleRequestDecline}
            className="btn btn-xs border-purple-700 text-purple-700 bg-white rounded-lg"
          >
            <X />
            Decline
          </button>
        </div>
      </div>
    </div>
  ) : (
    <p>an error occured</p>
  );
};

export default PendingConnectionProfile;
