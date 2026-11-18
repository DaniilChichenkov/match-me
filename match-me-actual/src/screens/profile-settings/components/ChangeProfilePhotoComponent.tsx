import { useState } from "react";
import { useRevalidator } from "react-router";

const ChangePhotoComponent = () => {
  const [isLoading, setLoadingState] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const revalidator = useRevalidator();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingState(() => true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("http://localhost:3000/api/me/avatar", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    setLoadingState(() => false);

    if (res.ok) {
      setResultMsg("Updated successfully");
    } else {
      setResultMsg("An error occured");
    }

    await revalidator.revalidate();
  };

  return (
    <>
      <div className="card w-full bg-base-100 card-sm shadow-sm mt-5">
        <div className="card-body">
          <form onSubmit={handleSubmit} method="POST">
            <input
              name="avatar"
              type="file"
              accept="image/*"
              className="file-input w-full"
              required
            />
            <button
              disabled={isLoading}
              className="btn w-full rounded-xl mt-2 border-purple-700 text-purple-700 bg-purple-100"
            >
              Confirm
            </button>
          </form>
        </div>
      </div>
      <p className="text-sm text-slate-700 text-center mt-2">
        {resultMsg && resultMsg.length && resultMsg}
      </p>
    </>
  );
};

export default ChangePhotoComponent;
