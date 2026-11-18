import { LogOut } from "lucide-react";
import { Form } from "react-router";

const ProfileSelfSetupScreen = () => {
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
            Fill your personal information
          </p>

          <div className="divider m-0 p-0"></div>

          <Form
            action="."
            method="POST"
            encType="multipart/form-data"
            className="w-full flex flex-col items-center"
          >
            <div className="w-full gap-4 flex flex-col items-center">
              {/* Profile picture */}
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
                  required
                />
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

export default ProfileSelfSetupScreen;
