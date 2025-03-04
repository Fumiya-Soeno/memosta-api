export interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label?: string;
  options: Option[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  name,
  label,
  options,
  onChange,
}) => {
  return (
    <div className="flex items-center">
      {label && (
        <label htmlFor={id} className="mr-2 break-keep">
          {label}
        </label>
      )}
      <select
        name={name}
        id={id}
        onChange={onChange}
        className="text-black w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
