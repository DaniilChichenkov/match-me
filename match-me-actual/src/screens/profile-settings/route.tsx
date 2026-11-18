import { ArrowLeft, Info, LogOut, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Form, Link, useLoaderData } from "react-router";

import {
  ChangeSelfInfoComponent,
  ChangeUserBioInformation,
  DeletePhotoComponent,
} from "./components";

const ProfileSettingsRoute = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalContent, setModalContent] = useState<ReactNode>(<></>);
  const loaderData = useLoaderData<{
    profile: {
      firstname: string;
      lastname: string;
      profilePic: string;
    };
  }>();

  return (
    <>
      <div className="w-full md:w-8/12 xl:w-6/12 md:mx-auto lg:mx-0 flex flex-col items-center gap-4 px-4 pt-10 pb-32">
        <header className="w-full flex flex-col items-start justify-start">
          <Link
            to="/profile"
            className="flex justify-start items-center gap-1 text-purple-700"
          >
            <ArrowLeft /> Back to profile
          </Link>
          <p className="text-3xl font-bold mt-2">Settings</p>
          <p className="text-slate-700">Manage your profile preferences</p>
        </header>

        {/* Delete profile picture */}
        {loaderData.profile.profilePic && (
          <div className="card w-full bg-base-100 card-sm shadow-sm">
            <div className="card-body rounded-xl">
              <h2 className="card-title">Delete profile picture</h2>
              <div className="w-full flex justify-start items-center gap-2">
                <div className="w-12 h-12 rounded-full flex justify-center items-center bg-red-100 text-red-700">
                  <Info className="shrink-0" />
                </div>
                <p>Remove your profile picture.</p>
              </div>
              <button
                onClick={() => {
                  setModalContent(<DeletePhotoComponent />);
                  modalRef.current?.showModal();
                }}
                className="btn w-full rounded-xl mt-2 border-red-700 text-red-700 bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Change self-preferences */}
        <div className="card w-full bg-base-100 card-sm shadow-sm">
          <div className="card-body rounded-xl">
            <h2 className="card-title">Personal information</h2>
            <div className="w-full flex justify-start items-center gap-2">
              <div className="w-12 h-12 rounded-full flex justify-center items-center bg-purple-100 text-purple-700">
                <Info className="shrink-0" />
              </div>
              <p>Edit your personal information.</p>
            </div>
            <button
              onClick={() => {
                setModalContent(<ChangeSelfInfoComponent />);
                modalRef.current?.showModal();
              }}
              className="btn w-full rounded-xl mt-2 border-purple-700 text-purple-700 bg-purple-100"
            >
              Edit details
            </button>
          </div>
        </div>

        {/* Edit bio */}
        <div className="card w-full bg-base-100 card-sm shadow-sm">
          <div className="card-body rounded-xl">
            <h2 className="card-title">Bio information</h2>
            <div className="w-full flex justify-start items-center gap-2">
              <div className="w-12 h-12 rounded-full flex justify-center items-center bg-purple-100 text-purple-700">
                <Info className="shrink-0" />
              </div>
              <p>Edit your bio information.</p>
            </div>
            <button
              onClick={() => {
                setModalContent(<ChangeUserBioInformation />);
                modalRef.current?.showModal();
              }}
              className="btn w-full rounded-xl mt-2 border-purple-700 text-purple-700 bg-purple-100"
            >
              Edit details
            </button>
          </div>
        </div>

        {/* Log out */}
        <div className="card w-full bg-base-100 card-sm shadow-sm">
          <div className="card-body rounded-xl">
            <h2 className="card-title">Log out</h2>
            <Form method="POST" action="/logout">
              <button className="btn w-full rounded-xl mt-2 border-red-700 text-red-700 bg-red-100">
                <LogOut />
                Log out
              </button>
            </Form>
          </div>
        </div>
      </div>

      <dialog ref={modalRef} id="settings_modal_1" className="modal">
        <div className="modal-box">
          <div className="w-full flex justify-end">
            <button
              onClick={() => {
                modalRef.current?.close();
              }}
              className="btn rounded-2xl mt-2 border-purple-700 text-purple-700 bg-purple-100"
            >
              <X />
            </button>
          </div>

          {/* Content */}
          {modalContent}
        </div>
      </dialog>
    </>
  );
};

export default ProfileSettingsRoute;
