import { useState } from "react";
import { useLoaderData, useRevalidator } from "react-router";

const ChangeSelfInfoComponent = () => {
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
  const [isLoading, setLoadingState] = useState(false);
  const [message, setMessage] = useState("");
  const revalidator = useRevalidator();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    setLoadingState(() => true);

    const res = await fetch("http://localhost:3000/api/me/profile", {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });

    if (res.ok) {
      setMessage("Information changed successfully");
    } else {
      setMessage("An error occured");
    }

    setLoadingState(() => false);

    revalidator.revalidate();
  };

  return (
    <div className="w-full h-auto grid grid-cols-1">
      <p className="text-xl font-bold text-left grow-0 mt-2">
        Change info about yourself
      </p>

      <div className="divider m-0 p-0"></div>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
        encType="multipart/form-data"
      >
        <div className="w-full gap-4 grid grid-cols-1">
          <div className="w-full">
            <p className="text-lg font-semibold">Profile picture</p>
            <input
              type="file"
              accept="image/*"
              className="file-input w-full"
              name="profilePic"
            />
          </div>

          {/* Name */}
          <div className="w-full">
            <p className="text-lg font-semibold">Firstname</p>
            <input
              type="text"
              placeholder="Type here"
              className="input mt-2 w-full"
              name="firstname"
              defaultValue={loaderData.profile.firstname}
              required
            />
          </div>

          <div className="w-full">
            <p className="text-lg font-semibold">Lastname</p>
            <input
              type="text"
              placeholder="Type here"
              className="input mt-2 w-full"
              name="lastname"
              defaultValue={loaderData.profile.lastname}
              required
            />
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

export default ChangeSelfInfoComponent;
