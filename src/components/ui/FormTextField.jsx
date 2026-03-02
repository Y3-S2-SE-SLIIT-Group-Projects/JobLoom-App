/**
 * FormTextField
 * Generic labelled text input used inside the review form.
 *
 * @param {string}   id          - Input id / htmlFor
 * @param {string}   name        - Input name attribute
 * @param {string}   label       - Visible label text
 * @param {string}   placeholder
 * @param {string}   value
 * @param {Function} onChange
 * @param {boolean}  required
 */
const FormTextField = ({ id, name, label, placeholder, value, onChange, required }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      name={name}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#6794D1]"
    />
  </div>
);

export default FormTextField;
