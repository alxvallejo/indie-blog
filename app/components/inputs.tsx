import { useField } from "remix-validated-form";
import { useIsSubmitting } from "remix-validated-form";

import { BlockPicker } from "react-color";

type TextInputProps = {
  name: string;
  label: string;
};

type CustomInputProps = {
  name: string;
  label: string;
  onChange: (color: any) => void;
};

export const TextInput = ({ name, label }: TextInputProps) => {
  const { error, getInputProps } = useField(name);
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label" htmlFor={name}>
        <span className="label-text">{label}</span>
      </label>
      <input
        {...getInputProps({ id: name })}
        className="flex-1 rounded-md px-3 text-lg leading-loose"
      />
      {error && <span className="my-error-class">{error}</span>}
    </div>
  );
};

export const SubmitButton = () => {
  const isSubmitting = useIsSubmitting();
  return (
    <button type="submit" disabled={isSubmitting} className="btn">
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
};

export const ColorInput = ({ name, label, onChange }: CustomInputProps) => {
  // const { error, getInputProps } = useField(name);
  // const [value, setValue] = useControlField(name);
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label" htmlFor={name}>
        <span className="label-text">{label}</span>
      </label>
      <BlockPicker
        // {...getInputProps({ id: name })}
        className="flex-1 rounded-md px-3 text-lg leading-loose"
        onChange={onChange}
      />
      {/* {error && <span className="my-error-class">{error}</span>} */}
    </div>
  );
};
