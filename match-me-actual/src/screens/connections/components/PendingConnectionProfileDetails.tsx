import { MapPin, User } from "lucide-react";
import React, { useEffect, useState } from "react";

const PendingConnectionProfileDetails = ({
  profileId,
}: {
  profileId: string;
}) => {
  const [profileData, setProfileData] = useState<{
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
  const [isLoading, setLoadingState] = useState(false);

  useEffect(() => {
    if (profileId) {
      const fetchProfileDetails = async () => {
        if (!isLoading) {
          setLoadingState(() => true);
          const userProfileData = await fetch(
            `http://localhost:3000/api/users/${profileId}`,
            { credentials: "include" },
          );

          if (userProfileData.ok) {
            const userBioData = await fetch(
              `http://localhost:3000/api/users/${profileId}/bio`,
              { credentials: "include" },
            );

            if (userBioData.ok) {
              const userProfileDataRes = await userProfileData.json();
              const userBioDataRes = await userBioData.json();

              setProfileData(userProfileDataRes.userProfileData);
              setUserBioData(userBioDataRes.userBio);
            }
          }
          setLoadingState(() => false);
        }
      };
      fetchProfileDetails();
    }
  }, [profileId]);

  return isLoading ? (
    <div className="w-full flex justify-center p-5">
      <span className="loading loading-spinner loading-md"></span>
    </div>
  ) : (
    <>
      {/* Profile info */}
      <div className="w-full flex justify-start items-center gap-x-2">
        {profileData?.profilePic ? (
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img
                alt="Tailwind-CSS-Avatar-component"
                src={`http://localhost:3000/uploads/avatars/${profileData?.profilePic}`}
              />
            </div>
          </div>
        ) : (
          <User />
        )}
        <div>
          <p className="text-lg font-bold">
            {profileData?.firstname} {profileData?.lastname}
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
    </>
  );
};

export default PendingConnectionProfileDetails;
