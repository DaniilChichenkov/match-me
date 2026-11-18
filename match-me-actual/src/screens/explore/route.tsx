import React, { useRef, useState } from "react";

import { Funnel, X } from "lucide-react";

import { PersonCard } from "./components";

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
const Explore = () => {
  const modalRef = useRef<HTMLDialogElement>(null);

  // Actual list of recommendations from where data will be rendered
  const [listOfRecommendations, setListOfRecommendations] = useState<
    { id: string }[]
  >([]);

  // Check if something was found
  const [resultsFound, setResultsState] = useState<boolean | null>(null);

  // Cards will be presented one-by-one so this state contains current index
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  const [isLoading, setLoadingState] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingState(() => true);
    modalRef.current?.close();

    // Clear list of recommendations (Since new params were applied)
    setListOfRecommendations(() => []);

    const formData = new FormData(e.currentTarget);

    const interests = formData.getAll("interests");
    const hobbies = formData.getAll("hobbies");
    const travel = formData.get("travel");
    const food = formData.get("food");
    const music = formData.get("music");
    const walks = formData.get("walks");
    const location = formData.getAll("location");

    const res = await fetch("http://localhost:3000/api/recommendations", {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({
        interests,
        hobbies,
        travel,
        food,
        music,
        walks,
        location,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const resJson: { recommendations: { id: string }[] } = await res.json();

      // Replace data in latest batch of ids
      setLoadingState(() => false);
      setListOfRecommendations(() => resJson.recommendations);

      if (!resJson.recommendations.length) {
        setResultsState(() => false);
      }
    }

    setLoadingState(() => false);
  };

  const showNextCard = () => {
    setCurrentUserIndex((state) => state + 1);
  };

  return (
    <>
      <div className="w-full xl:w-6/12 md:mx-auto lg:mx-0 flex flex-col items-center gap-4 px-4 pt-10 pb-32">
        <header className="w-full flex flex-col items-start justify-start">
          <p className="text-3xl font-bold mt-2">Explore connections</p>
        </header>

        {/* Filters */}
        <div className="w-full flex justify-between items-center">
          <div>
            <p className="text-slate-900 font-bold text-sm">
              Recommended for you
            </p>
            <p className="text-slate-700 text-xs">
              {listOfRecommendations.length} people
            </p>
          </div>

          <button
            onClick={() => {
              modalRef.current?.showModal();
            }}
            className="btn rounded-xl bg-white text-purple-500 border border-purple-500"
          >
            <Funnel />
            Filters
          </button>
        </div>

        {/* List of people */}
        <div className="w-full grid grid-cols-1 gap-5 mt-5">
          {listOfRecommendations.length ? (
            listOfRecommendations[currentUserIndex] ? (
              <PersonCard
                showNextCard={showNextCard}
                userId={listOfRecommendations[currentUserIndex].id}
              />
            ) : (
              <p className="text-center">
                Thats all for current batch, make another request to get more
                people
              </p>
            )
          ) : (
            <p className="text-center mt-5">
              {resultsFound === null
                ? "Apply searching criteria to see the options"
                : !resultsFound
                  ? "Nothing was found"
                  : null}
            </p>
          )}
        </div>
      </div>

      {/* Filters modal */}
      <dialog ref={modalRef} id="my_modal_3" className="modal">
        <div className="modal-box max-h-10/12 overflow-scroll">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <X />
            </button>
          </form>
          <h3 className="font-bold text-lg">Who are you looking for?</h3>
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col items-center mt-4"
          >
            <div className="w-full gap-4 flex flex-col items-center">
              {/* Interests selection */}
              <div className="w-full">
                <p className="text-lg">Interests</p>
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
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Favourite music */}
              <div className="w-full">
                <p className="text-lg font-semibold">Favourite music</p>
                <select
                  defaultValue="Pick favourite music"
                  className="select mt-1 w-full"
                  name="music"
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
                  defaultValue="Pick favourite food"
                  className="select mt-1 w-full"
                  name="food"
                >
                  <option disabled={true}>Pick favourite food</option>
                  <option value="pizza">Pizza</option>
                  <option value="burgers">Burgers</option>
                  <option value="soup">Soup</option>
                </select>
              </div>

              {/* Hobbies */}
              <div className="w-full">
                <p className="text-lg">Hobbies and activities</p>
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
                        value={item}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="w-full p-2 border border-slate-400 rounded-lg mt-2">
                <p>From which countries?</p>
                <div className="w-full flex justify-between items-center mt-1">
                  <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                    Estonia
                    <input
                      type="checkbox"
                      name="location"
                      value="estonia"
                      className="hidden"
                    />
                  </label>
                  <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                    Latvia
                    <input
                      type="checkbox"
                      name="location"
                      value="latvia"
                      className="hidden"
                    />
                  </label>
                  <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                    Lithuania
                    <input
                      type="checkbox"
                      name="location"
                      value="lithuania"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Some additional info */}
              <div className="w-full md:col-span-2">
                <div className="w-full p-2 border border-slate-400 rounded-lg mt-2">
                  <p>People who enjoy long walks?</p>
                  <div className="w-full flex justify-between items-center mt-1">
                    <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                      Yes
                      <input
                        type="radio"
                        name="walks"
                        value="yes"
                        className="hidden"
                      />
                    </label>
                    <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                      Sometimes
                      <input
                        type="radio"
                        name="walks"
                        value="sometimes"
                        className="hidden"
                      />
                    </label>
                    <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                      No
                      <input
                        type="radio"
                        name="walks"
                        value="no"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="w-full p-2 border border-slate-400 rounded-lg mt-2">
                  <p>People who would try space travel?</p>
                  <div className="w-full flex justify-between items-center mt-1">
                    <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                      Yes
                      <input
                        type="radio"
                        name="travel"
                        value="yes"
                        className="hidden"
                      />
                    </label>
                    <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                      Maybe
                      <input
                        type="radio"
                        name="travel"
                        value="maybe"
                        className="hidden"
                      />
                    </label>
                    <label className="btn rounded-lg bg-white border-slate-400 has-checked:bg-purple-500 has-checked:text-white has-checked:border-purple-500">
                      No
                      <input
                        type="radio"
                        name="travel"
                        value="no"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="btn bg-purple-500 rounded-xl text-white btn-wide mx-auto mt-5"
            >
              Apply
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default Explore;
