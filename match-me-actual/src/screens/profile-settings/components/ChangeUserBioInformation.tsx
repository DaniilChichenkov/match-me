import React, { useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useRevalidator,
} from "react-router";

const possibleInterestsVariants = [
  "photography",
  "gaming",
  "technology",
  "reading",
  "art",
  "travel",
  "cooking",
  "nature",
];
const possibleHobbiesVariants = [
  "hiking",
  "cycling",
  "movies",
  "football",
  "fishing",
];
const ChangeUserBioInformation = () => {
  const actionData = useActionData<{
    success: boolean;
    error?: string;
    errorField?: string;
  }>();

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
    success: boolean;
  } = useLoaderData();

  const [errorField, setErrorField] = useState("");
  const [isLoading, setLoadingState] = useState(false);
  const [message, setMessage] = useState("");
  const revalidator = useRevalidator();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const interests = formData.getAll("interests");
    const hobbies = formData.getAll("hobbies");
    const location = formData.get("location");
    const travel = formData.get("travel");
    const food = formData.get("food");
    const music = formData.get("music");
    const walks = formData.get("walks");

    setLoadingState(() => true);

    const res = await fetch("http://localhost:3000/api/me/bio", {
      method: "PATCH",
      body: JSON.stringify({
        interests,
        hobbies,
        location,
        travel,
        food,
        music,
        walks,
      }),
      credentials: "include",
    });

    const resJson = await res.json();

    setLoadingState(() => false);

    if (res.ok) {
      setMessage("Bio data changed successfully");
    } else {
      setMessage("An error occured");

      setErrorField(resJson.errorField);
    }

    revalidator.revalidate();
  };

  return (
    <div className="w-full h-auto grid grid-cols-1">
      <p className="text-xl font-bold text-left grow-0 mt-2">
        Change your bio information
      </p>

      <div className="divider m-0 p-0"></div>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        <div className="w-full gap-4 flex flex-col items-center">
          {/* Interests selection */}
          <div className="w-full">
            <p className="text-lg font-semibold">Your interests</p>
            <p>Select a few interests that describe you.</p>
            <div className="w-full flex flex-wrap justify-start items-center gap-2 mt-2">
              {possibleInterestsVariants.map((item) => (
                <label
                  key={`interest-selection-${item}`}
                  className="cursor-pointer badge capitalize border border-slate-400 rounded-xl has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500"
                >
                  {item}
                  <input
                    className="hidden"
                    type="checkbox"
                    name="interests"
                    value={item}
                    defaultChecked={loaderData.bio.interests.includes(item)}
                  />
                </label>
              ))}
            </div>
            {errorField && errorField === "interests" && (
              <p className="text-red-500">Select at least one interest</p>
            )}
          </div>

          {/* Favourite music */}
          <div className="w-full">
            <p className="text-lg font-semibold">Favourite music</p>
            <select
              defaultValue={loaderData.bio.music}
              className="select mt-1 w-full"
              name="music"
              required
            >
              <option disabled={true}>Pick favourite music</option>
              <option value="rock">Rock</option>
              <option value="jazz">Jazz</option>
              <option value="country">Country</option>
            </select>
          </div>

          {/* Favourite food */}
          <div className="w-full">
            <p className="text-lg font-semibold">Favourite food</p>
            <select
              defaultValue={loaderData.bio.food}
              className="select mt-1 w-full"
              name="food"
              required
            >
              <option disabled={true}>Pick favourite food</option>
              <option value="pizza">Pizza</option>
              <option value="burgers">Burgers</option>
              <option value="soup">Soup</option>
            </select>
          </div>

          {/* Location */}
          <div className="w-full">
            <p className="text-lg font-semibold">Where do you live?</p>
            <select
              defaultValue={loaderData.bio.location}
              className="select mt-1 w-full"
              name="location"
              required
            >
              <option disabled={true}>Select a country</option>
              <option value="estonia">Estonia</option>
              <option value="latvia">Latvia</option>
              <option value="lithuania">Lithuania</option>
            </select>
          </div>

          {/* Hobbies */}
          <div className="w-full">
            <p className="text-lg font-semibold">Hobbies and activities</p>
            <p>Select a few that suits you.</p>
            <div className="w-full flex flex-wrap justify-start items-center gap-2 mt-2">
              {possibleHobbiesVariants.map((item) => (
                <label
                  key={`hobby-selection-${item}`}
                  className="cursor-pointer badge capitalize border border-slate-400 rounded-xl has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500"
                >
                  {item}
                  <input
                    type="checkbox"
                    className="hidden"
                    name="hobbies"
                    defaultChecked={loaderData.bio.hobbies.includes(item)}
                    value={item}
                  />
                </label>
              ))}
            </div>
            {errorField && errorField === "hobbies" && (
              <p className="text-red-500">Select at least one hobby</p>
            )}
          </div>

          {/* Some additional info */}
          <div className="w-full md:col-span-2">
            <p className="text-lg font-semibold">A little more about you</p>
            <div className="w-full p-2 border border-slate-400 rounded-lg mt-2">
              <p>Do you enjoy long walks?</p>
              <div className="w-full flex justify-between items-center mt-1">
                <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                  Yes
                  <input
                    type="radio"
                    name="walks"
                    value="yes"
                    className="hidden"
                    defaultChecked={loaderData.bio.walks === "yes"}
                  />
                </label>
                <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                  Sometimes
                  <input
                    type="radio"
                    name="walks"
                    value="sometimes"
                    className="hidden"
                    defaultChecked={loaderData.bio.walks === "sometimes"}
                  />
                </label>
                <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                  No
                  <input
                    type="radio"
                    name="walks"
                    value="no"
                    className="hidden"
                    defaultChecked={loaderData.bio.walks === "no"}
                  />
                </label>
              </div>
              {errorField && errorField === "walks" && (
                <p className="text-red-500">Select one option</p>
              )}
            </div>

            <div className="w-full p-2 border border-slate-400 rounded-lg mt-2">
              <p>Would you try interplanetary travel?</p>
              <div className="w-full flex justify-between items-center mt-1">
                <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                  Yes
                  <input
                    type="radio"
                    name="travel"
                    value="yes"
                    className="hidden"
                    defaultChecked={loaderData.bio.travel === "yes"}
                  />
                </label>
                <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                  Maybe
                  <input
                    type="radio"
                    name="travel"
                    value="maybe"
                    className="hidden"
                    defaultChecked={loaderData.bio.travel === "maybe"}
                  />
                </label>
                <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                  No
                  <input
                    type="radio"
                    name="travel"
                    value="no"
                    className="hidden"
                    defaultChecked={loaderData.bio.travel === "no"}
                  />
                </label>
              </div>
              {errorField && errorField === "travel" && (
                <p className="text-red-500">Select one option</p>
              )}
            </div>
          </div>
        </div>

        <button
          disabled={isLoading}
          className="btn bg-purple-500 rounded-xl text-white btn-wide mx-auto mt-5"
        >
          Continue
        </button>

        <p className="text-sm text-slate-700 text-center">
          {message && message.length && message}
        </p>
      </form>
    </div>
  );
};

export default ChangeUserBioInformation;
