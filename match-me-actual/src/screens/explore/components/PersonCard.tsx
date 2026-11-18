import React, { useEffect, useState } from "react";

import { MapPin, Plus, User, X } from "lucide-react";

const PersonCard = ({
  userId,
  showNextCard,
}: {
  userId: string;
  showNextCard: () => void;
}) => {
  const [isLoading, setLoadingState] = useState(false);
  const [isErrorOccured, setErrorState] = useState(false);
  const [userProfileData, setUserProfileData] = useState<{
    firstname: string;
    lastname: string;
    profilePic: string;
    id: string;
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

  const handleConnectionRequest = async () => {
    setLoadingState(() => true);

    const connectionRequest = await fetch(
      "http://localhost:3000/api/connections",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ connectTo: userId, do: "requestConnection" }),
      },
    );

    if (connectionRequest.ok) {
      console.log("Connection request sent");
    }

    setLoadingState(() => false);
    showNextCard();
  };

  const handleDismissRequest = async () => {
    showNextCard();
  };

  // Get user info
  useEffect(() => {
    const fetchUserDataById = async () => {
      if (!isLoading) {
        try {
          // Fetch for name and profile picture
          const nameAndPictureRequest = await fetch(
            `http://localhost:3000/api/users/${userId}`,
            {
              credentials: "include",
            },
          );

          if (nameAndPictureRequest.ok) {
            const nameAndPictureResponse = await nameAndPictureRequest.json();

            // Fetch for bio data
            const bioDataRequest = await fetch(
              `http://localhost:3000/api/users/${userId}/bio`,
              {
                credentials: "include",
              },
            );

            if (bioDataRequest.ok) {
              const bioDataResponse = await bioDataRequest.json();

              setUserProfileData(nameAndPictureResponse.userProfileData);
              setUserBioData(bioDataResponse.userBio);
            } else {
              throw new Error();
            }
          } else {
            throw new Error();
          }

          setLoadingState(() => false);
        } catch (error) {
          setErrorState(() => true);
        }
      }
    };

    fetchUserDataById();
  }, [userId]);

  return (
    <div className="card w-full bg-base-100 card-sm shadow-sm">
      <div className="card-body">
        {isLoading ? (
          <div className="w-full flex justify-center p-5">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <>
            {/* Profile info */}
            <div className="w-full flex justify-start items-center gap-x-2">
              {userProfileData?.profilePic ? (
                <div className="avatar">
                  <div className="w-24 rounded-full">
                    <img
                      alt="Tailwind-CSS-Avatar-component"
                      src={`http://localhost:3000/uploads/avatars/${userProfileData?.profilePic}`}
                    />
                  </div>
                </div>
              ) : (
                <User />
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

            {/* Bio data */}
            <div className="w-full mt-2">
              <p className="font-bold">Interests:</p>
              <div className="w-full flex flex-wrap items-center justify-start gap-2 mt-1">
                {userBioData?.interests.map((item) => (
                  <span
                    key={`user-${userBioData.id}-interests-${item}`}
                    className="badge bg-purple-100 text-black"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Hobbies */}
            <div className="w-full mt-2">
              <p className="font-bold">Hobbies:</p>
              <div className="w-full flex flex-wrap items-center justify-start gap-2 mt-1">
                {userBioData?.hobbies.map((item) => (
                  <span
                    key={`user-${userBioData.id}-hobbies-${item}`}
                    className="badge bg-purple-100 text-black"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Favourite food */}
            <div className="w-full mt-2">
              <p className="font-bold">Favourite food:</p>
              <div className="w-full flex flex-wrap items-center justify-start gap-2 mt-1">
                <span className="badge bg-purple-100 text-black">
                  {userBioData?.food}
                </span>
              </div>
            </div>

            {/* Favourite music */}
            <div className="w-full mt-2">
              <p className="font-bold">Favourite music:</p>
              <div className="w-full flex flex-wrap items-center justify-start gap-2 mt-1">
                <span className="badge bg-purple-100 text-black">
                  {userBioData?.music}
                </span>
              </div>
            </div>

            {/* Long walks enjoy */}
            <div className="w-full mt-2">
              <p className="font-bold">Enjoy long walks:</p>
              <div className="w-full flex flex-wrap items-center justify-start gap-2 mt-1">
                <span className="badge bg-purple-100 text-black">
                  {userBioData?.walks}
                </span>
              </div>
            </div>

            {/* Interplanetary travel */}
            <div className="w-full mt-2">
              <p className="font-bold">Would try interplanetary travel:</p>
              <div className="w-full flex flex-wrap items-center justify-start gap-2 mt-1">
                <span className="badge bg-purple-100 text-black">
                  {userBioData?.travel}
                </span>
              </div>
            </div>

            {/* Connect / Dismiss */}
            <div className="w-full grid grid-cols-2 gap-4 mt-4">
              <button
                onClick={handleDismissRequest}
                className="btn border-red-500 border text-red-500 bg-red-50 rounded-xl"
              >
                <X />
                Dismiss
              </button>
              <button
                onClick={handleConnectionRequest}
                className="btn border-purple-500 border text-purple-500 bg-purple-50 rounded-xl"
              >
                <Plus /> Connect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
