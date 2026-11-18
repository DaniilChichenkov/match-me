import React from "react";
import { Form, Link } from "react-router";

const LoginScreenRoute = () => {
  return (
    <div className="w-screen h-screen bg-purple-100 flex justify-center items-center px-4">
      <div className="card w-full md:w-6/12 lg:w-4/12 xl:w-2/12 bg-base-100 card-md shadow-sm">
        <div className="card-body">
          <p className="text-xl font-bold text-center">Welcome back!</p>

          <Form
            method="POST"
            action="."
            className="w-full flex flex-col items-center justify-start"
          >
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">Email address</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="example@email.com"
                name="email"
              />
              {/* <p className="label">Optional</p> */}
            </fieldset>

            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">Password</legend>
              <input
                type="password"
                className="input w-full"
                placeholder="******"
                name="password"
              />
              {/* <p className="label">Optional</p> */}
            </fieldset>

            <button className="btn bg-purple-500 text-white rounded-xl btn-wide mt-4">
              Log in
            </button>
          </Form>

          <div className="w-full flex justify-start items-center mt-5 gap-2">
            <p className="text-slate-700 grow-0">Have no account yet?</p>
            <Link className="text-purple-500" to={"/"}>
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreenRoute;
