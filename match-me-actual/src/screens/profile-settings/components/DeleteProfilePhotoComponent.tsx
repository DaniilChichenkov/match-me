import { useState } from "react";
import { useRevalidator } from "react-router";

const DeletePhotoComponent = () => {
  const [isLoading, setLoadingState] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const revalidator = useRevalidator();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingState(() => true);

    const res = await fetch("http://localhost:3000/api/me/profile", {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setResultMsg("Image deleted successfully");
    } else {
      setResultMsg("An error occured");
    }

    setLoadingState(() => false);

    await revalidator.revalidate();
  };

  return (
    <>
      <div className="card w-full bg-base-100 card-sm shadow-sm mt-5">
        <div className="card-body">
          <h2 className="card-title">
            Are you sure want to delete profile image?
          </h2>

          <form onSubmit={handleSubmit}>
            <button
              disabled={isLoading}
              className="btn w-full rounded-xl border-red-700 text-red-700 bg-red-100 mx-auto mt-5"
            >
              Yes
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

export default DeletePhotoComponent;
