import React, { useEffect, useRef } from "react";
import { Form, Link, useActionData, useNavigate } from "react-router";

const RegisterScreenRoute = () => {
  const actionData = useActionData<{ error?: string; success: boolean }>();
  const modalRef = useRef<HTMLDialogElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (actionData && actionData.success) {
      modalRef.current?.showModal();
    }
  }, [actionData]);

  const handleSuccessModalClose = () => {
    nav("/login");
  };

  return (
    <>
      <div className="w-screen h-screen bg-purple-100 flex justify-center items-center px-4">
        <div className="card w-full md:w-6/12 lg:w-4/12 xl:w-2/12 bg-base-100 card-md shadow-sm">
          <div className="card-body">
            <p className="text-xl font-bold text-center">Create your account</p>

            <Form
              method="POST"
              action="."
              className="w-full flex flex-col items-center justify-start"
            >
              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend">Email address</legend>
                <input
                  type="email"
                  className="input w-full"
                  placeholder="example@email.com"
                  name="email"
                  required
                />
                {actionData?.error &&
                  actionData.error === "emailAlreadyInUser" && (
                    <p className="label text-red-500">Email already in use</p>
                  )}
              </fieldset>

              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend">Password</legend>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="******"
                  name="password"
                  required
                />
                {actionData?.error &&
                  actionData.error === "passwordsNotSame" && (
                    <p className="label text-red-500">Passwords not same</p>
                  )}
              </fieldset>

              <fieldset className="fieldset w-full">
                <legend className="fieldset-legend">Confirm password</legend>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="******"
                  name="confirmPassword"
                  required
                />
                {actionData?.error &&
                  actionData.error === "passwordsNotSame" && (
                    <p className="label text-red-500">Passwords not same</p>
                  )}
              </fieldset>

              <button className="btn bg-purple-500 text-white rounded-xl btn-wide mt-4">
                Create account
              </button>
            </Form>

            <div className="w-full flex justify-start items-center mt-5 gap-2">
              <p className="text-slate-700 grow-0">Already have an account?</p>
              <Link className="text-purple-500" to={"/login"}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
      <dialog ref={modalRef} id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">User created successfully!</h3>
          <div className="modal-action">
            <form method="dialog">
              <button onClick={handleSuccessModalClose} className="btn">
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default RegisterScreenRoute;
