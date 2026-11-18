import { useLoaderData } from "react-router";
import {
  MapPin,
  EighthNote,
  Utensils,
  Footprints,
  Rocket,
  User,
} from "lucide-react";

const MainProfileComponent = () => {
  const loaderData: {
    bio: {
      music: string;
      food: string;
      location: string;
      walks: string;
      travel: string;
      hobbies: string[];
      interests: string[];
    };
    profile: {
      firstname: string;
      lastname: string;
      profilePic: string;
    };
  } = useLoaderData();

  console.log(loaderData);

  return (
    <div className="w-full xl:w-6/12 md:mx-auto lg:mx-0 flex flex-col items-center gap-4 px-4 pt-10 pb-32">
      <header className="w-full flex flex-col items-start justify-start">
        <p className="text-3xl font-bold mt-2">My profile</p>
        <p className="text-slate-700">This is how others get to know you.</p>
      </header>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 md:gap-x-5 gap-y-5 items-start">
        <div className="card w-full bg-base-100 card-sm shadow-sm">
          <div className="card-body">
            {/* Profile picture */}
            {loaderData.profile.profilePic ? (
              <div className="avatar">
                <div className="w-24 rounded-full">
                  <img
                    alt="Tailwind-CSS-Avatar-component"
                    src={`http://localhost:3000/uploads/avatars/${loaderData.profile.profilePic}`}
                  />
                </div>
              </div>
            ) : (
              <User />
            )}

            <h2 className="card-title">
              {loaderData.profile.firstname} {loaderData.profile.lastname}
            </h2>
            <p className="flex justify-start items-center gap-1 capitalize">
              <MapPin /> {loaderData.bio.location}
            </p>
          </div>
        </div>

        <div className="card w-full bg-base-100 card-sm shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">About me</h2>

            <p className="font-semibold text-md">Interests</p>
            <div className="w-full flex justify-start items-center flex-wrap gap-1">
              {loaderData.bio.interests.map((item) => (
                <p
                  key={`user-profile-interests-${item}`}
                  className="badge capitalize border rounded-xl bg-purple-500 text-white border-purple-500 grow-0"
                >
                  {item}
                </p>
              ))}
            </div>

            <div className="divider m-0 p-0"></div>

            <p className="font-semibold text-md">Hobbies</p>
            <div className="w-full flex justify-start items-center flex-wrap gap-1">
              {loaderData.bio.hobbies.map((item) => (
                <p
                  key={`user-profile-hobbies-${item}`}
                  className="badge capitalize border rounded-xl bg-purple-500 text-white border-purple-500 grow-0"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="card w-full bg-base-100 card-sm shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">Favourites</h2>

            <p className="flex justify-between w-full items-center pr-4">
              <span className="flex items-center gap-2">
                <EighthNote /> Music
              </span>{" "}
              {loaderData.bio.music}
            </p>

            <div className="divider m-0 p-0"></div>

            <p className="flex justify-between w-full items-center pr-4">
              <span className="flex items-center gap-2">
                <Utensils /> Food
              </span>{" "}
              {loaderData.bio.food}
            </p>
          </div>
        </div>

        <div className="card w-full bg-base-100 card-sm shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">Lifestyle</h2>

            <p className="flex justify-between w-full items-center pr-4">
              <span className="flex items-center gap-2">
                <Footprints /> Enjoy long walks
              </span>{" "}
              {loaderData.bio.walks}
            </p>

            <div className="divider m-0 p-0"></div>

            <p className="flex justify-between w-full items-center pr-4">
              <span className="flex items-center gap-2">
                <Rocket /> Try interplanetary travel
              </span>{" "}
              {loaderData.bio.travel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainProfileComponent;
