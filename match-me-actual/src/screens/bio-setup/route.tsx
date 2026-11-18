import { LogOut } from "lucide-react";
import { Form, useActionData } from "react-router";

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
const BioSetupRoute = () => {
  const actionData = useActionData<{
    success: boolean;
    error?: string;
    field?: string;
  }>();

  return (
    <div className="w-screen h-screen bg-purple-100 flex justify-center items-center px-4">
      <div className="card w-full h-auto max-h-10/12 overflow-scroll md:w-8/12 lg:w-6/12 xl:w-4/12 bg-base-100 card-md shadow-sm">
        <div className="card-body">
          <Form
            method="POST"
            action="/logout"
            className="btn btn-error btn-sm grow-0 w-4/12 md:w-3/12 lg:w-2/12 rounded-xl"
          >
            <button className="text-white btn">
              {" "}
              <LogOut />
              Log out
            </button>
          </Form>
          <p className="text-xl font-bold text-left grow-0 mt-2">
            Tell us more about yourself
          </p>

          <div className="divider m-0 p-0"></div>

          <Form
            action="."
            method="POST"
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
                      />
                    </label>
                  ))}
                </div>
                {actionData &&
                  !actionData.success &&
                  actionData?.field === "interests" && (
                    <p className="text-red-500">Select at least one interest</p>
                  )}
              </div>

              {/* Favourite music */}
              <div className="w-full">
                <p className="text-lg font-semibold">Favourite music</p>
                <select
                  defaultValue="Pick favourite music"
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
                  defaultValue="Pick favourite food"
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
                  defaultValue="Select country of living?"
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
                        value={item}
                      />
                    </label>
                  ))}
                </div>
                {actionData &&
                  !actionData.success &&
                  actionData?.field === "hobbies" && (
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
                  {actionData &&
                    !actionData.success &&
                    actionData?.field === "walks" && (
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
                  {actionData &&
                    !actionData.success &&
                    actionData?.field === "travel" && (
                      <p className="text-red-500">Select one option</p>
                    )}
                </div>
              </div>
            </div>

            <button className="btn bg-purple-500 rounded-xl text-white btn-wide mx-auto mt-5">
              Continue
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default BioSetupRoute;
