import React, { useState } from "react"
import { Form, FORM_ERROR } from "app/core/components/Form"
import { Dropdown, TextInput } from "../../components/Form/Inputs"
import updateProfile, { UpdateProfile } from "src/profiles/mutations/updateProfile"
import { useMutation } from "@blitzjs/rpc"
import { useSession } from "@blitzjs/auth"
import { AuthenticationError } from "blitz"

const Image = "/images/user-avatar-80.png"

function AccountPanel({ profile, onSuccess }) {
  const [sync, setSync] = useState(false)
  const [updateProfileMutation] = useMutation(updateProfile)

  return (
    <div className="grow">
      {/* Panel body */}
      <div className="p-6 space-y-6">
        <h2 className="text-2xl text-slate-800 font-bold mb-5">My Account</h2>

        <Form
          schema={UpdateProfile}
          initialValues={profile}
          onSubmit={async (values) => {
            try {
              const updatedProfile = await updateProfileMutation(values)
              onSuccess()
            } catch (error: any) {
              if (error instanceof AuthenticationError) {
                return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
              } else {
                return {
                  [FORM_ERROR]:
                    "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                }
              }
            }
          }}
        >
          <section>
            <div className="flex items-center">
              <div className="mr-4">
                <img
                  className="w-20 h-20 rounded-full"
                  src={Image}
                  width="80"
                  height="80"
                  alt="User upload"
                />
              </div>
              <button className="btn-sm bg-indigo-500 hover:bg-indigo-600 text-white">
                Change
              </button>
            </div>
          </section>
          {/* Business Profile */}
          <section>
            <h2 className="text-xl leading-snug text-slate-800 font-bold mb-1">Your Profile</h2>
            <div className="text-sm"></div>
            <div className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-5">
              <TextInput label="Username" name="name" defaultValue={profile?.name} />
              <TextInput
                label="Birthday"
                name="birthday"
                defaultValue={profile?.birthday}
                type="date"
              />
              <Dropdown
                label="Gender"
                name="gender"
                options={[
                  {
                    label: "Male",
                    value: "male",
                  },
                  {
                    label: "Female",
                    value: "female",
                  },
                ]}
              />
            </div>
          </section>
          {/* Email */}
          <section>
            <h2 className="text-xl leading-snug text-slate-800 font-bold mb-1">Email</h2>
            <div className="text-sm">
              Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.
            </div>
            <div className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-5">
              <TextInput label="Username" name="name" />
            </div>
            <div className="flex flex-wrap mt-5">
              <div className="mr-2">
                <label className="sr-only" htmlFor="email">
                  Business email
                </label>
                <input id="email" className="form-input" type="email" />
              </div>
              <button className="btn border-slate-200 hover:border-slate-300 shadow-sm text-indigo-500">
                Change
              </button>
            </div>
          </section>
          {/* Password */}
          <section>
            <h2 className="text-xl leading-snug text-slate-800 font-bold mb-1">Password</h2>
            <div className="text-sm">
              You can set a permanent password if you don't want to use temporary login codes.
            </div>
            <div className="mt-5">
              <button className="btn border-slate-200 shadow-sm text-indigo-500">
                Set New Password
              </button>
            </div>
          </section>
          {/* Smart Sync */}
          <section>
            <h2 className="text-xl leading-snug text-slate-800 font-bold mb-1">
              Smart Sync update for Mac
            </h2>
            <div className="text-sm">
              With this update, online-only files will no longer appear to take up hard drive space.
            </div>
            <div className="flex items-center mt-5">
              <div className="form-switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="sr-only"
                  checked={sync}
                  onChange={() => setSync(!sync)}
                />
                <label className="bg-slate-400" htmlFor="toggle">
                  <span className="bg-white shadow-sm" aria-hidden="true"></span>
                  <span className="sr-only">Enable smart sync</span>
                </label>
              </div>
              <div className="text-sm text-slate-400 italic ml-2">{sync ? "On" : "Off"}</div>
            </div>
          </section>
        </Form>
      </div>
      {/* Panel footer */}
      <footer>
        <div className="flex flex-col px-6 py-5 border-t border-slate-200">
          <div className="flex self-end">
            <button className="btn border-slate-200 hover:border-slate-300 text-slate-600">
              Cancel
            </button>
            <button className="btn bg-indigo-500 hover:bg-indigo-600 text-white ml-3">
              Save Changes
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AccountPanel
