import React, { useState } from "react";
import { useRevalidator } from "react-router";

const DisconnectConfirmation = ({ profileId }: { profileId: string }) => {
  const [isLoading, setLoadingState] = useState(false);
  const revalidator = useRevalidator();

  const handleConfirm = async () => {
    if (!isLoading) {
      setLoadingState(() => true);

      const disconnectReq = await fetch(
        `http://localhost:3000/api/connections/${profileId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (disconnectReq.ok) {
        revalidator.revalidate();
        const dialog = document.querySelector(
          "#my_modal_1",
        ) as HTMLDialogElement | null;
        dialog?.close();
      }

      setLoadingState(() => false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <p className="text-xl font-bold text-slate-700">Are you sure?</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 mt-5 gap-5">
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full btn rounded-lg border-red-500 text-red-500 border bg-white"
        >
          Yes
        </button>
        <form className="w-full">
          <button
            className="w-full btn rounded-lg border-purple-500 text-purple-500 border bg-white"
            type="submit"
            formMethod="dialog"
          >
            No
          </button>
        </form>
      </div>
    </div>
  );
};

export default DisconnectConfirmation;
