import React from "react"
import DropdownClassic from "../DropdownClassic"
import { useField, UseFieldConfig } from "react-final-form"

export const TextInput = ({ label, name, defaultValue = "", type = "text" }) => {
  return (
    <div className="sm:w-1/3">
      <label className="block text-sm font-medium mb-1" htmlFor={name}>
        {label}
      </label>
      <input id={name} className="form-input w-full" type={type} placeholder={defaultValue} />
    </div>
  )
}

export const Dropdown = ({ label, name, options, ...props }) => {
  const {
    input,
    meta: { touched, error, submitError, submitting },
  } = useField(name, {
    parse:
      props.type === "number"
        ? (Number as any)
        : // Converting `""` to `null` ensures empty values will be set to null in the DB
          (v) => (v === "" ? null : v),
  })
  return (
    <div className="sm:w-1/3">
      <label className="block text-sm font-medium mb-1" htmlFor={name}>
        {label}
      </label>
      <DropdownClassic options={options} />
    </div>
  )
}
