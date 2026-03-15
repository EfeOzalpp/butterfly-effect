const OPTIONS = [
  { val: "visitor", label: "Visitor" },
  {
    group: "MassArt",
    options: [
      { val: "student", label: "MassArt Student" },
      { val: "staff", label: "Staff & Faculty" },
    ],
  },
];

function SelectionIndicator({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <svg className="role-check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return <span className="role-indicator-spacer" />;
}

export default function RolePicker({ value, onChange }) {
  return (
    <div className="radio-group" aria-label="Select your role">
      <div role="radiogroup" className="radio-options">

        {/* Visitor */}
        <div className="role-tag role-tag--center"><span className="role-label">Who are you?</span></div>
        <div
          role="radio"
          aria-checked={value === "visitor"}
          tabIndex={value === "visitor" ? 0 : -1}
          className={`input-part-inside radio-option${value === "visitor" ? " selected" : ""}`}
          onClick={() => onChange("visitor")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange("visitor"); }
          }}
        >
          <span className="role-indicator-spacer" />
          <h4>Explorer</h4>
          <SelectionIndicator selected={value === "visitor"} />
        </div>

        {/* MassArt — shared island with center divider */}
        <div className="role-separator"><span className="role-label">or</span></div>
        <div className="role-group-options">
          {OPTIONS[1].options.map((opt) => {
            const checked = value === opt.val;
            return (
              <div
                key={opt.val}
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                className={`input-part-inside radio-option radio-option--inset${checked ? " selected" : ""}`}
                onClick={() => onChange(opt.val)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(opt.val); }
                }}
              >
                <span className="role-indicator-spacer" />
                <h4>{opt.label}</h4>
                <SelectionIndicator selected={checked} />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
