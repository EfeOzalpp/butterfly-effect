import { useState } from "react";
import LottieOption from "../../assets/lottie/LottieOption";

const OPTIONS = [
  { val: "visitor", label: "Visitor" },
  {
    group: "MassArt",
    options: [
      { val: "student", label: "Student" },
      { val: "staff", label: "Staff / Faculty" },
    ],
  },
];

export default function RolePicker({ value, onChange }) {
  const [active, setActive] = useState(null);

  return (
    <div className="radio-group" aria-label="I am an explorer!">
      <div role="radiogroup" className="radio-options">
        {/* Visitor card */}
        <span className="role-label">Explorer</span>
        <div className="role-group visitor-group">
          <div className="role-group-label"></div>
          <div className="role-group-options">
            <div
              key={OPTIONS[0].val}
              role="radio"
              aria-checked={value === OPTIONS[0].val}
              tabIndex={value === OPTIONS[0].val ? 0 : -1}
              className={`input-part-inside radio-option ${
                value === OPTIONS[0].val ? "selected" : ""
              }`}
              onMouseEnter={() => setActive(OPTIONS[0].val)}
              onMouseLeave={() => setActive(null)}
              onClick={() => onChange(OPTIONS[0].val)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(OPTIONS[0].val);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <LottieOption
                selected={value === OPTIONS[0].val}
                isActive={active === OPTIONS[0].val}
              />
              <label className="radio-label">
                <h4>{OPTIONS[0].label}</h4>
              </label>
            </div>
          </div>
        </div>

        <br />

        {/* MassArt card */}
        <span className="role-label">MassArt</span>
        <div className="role-group massart-group">
          <div className="role-group-label"></div>
          <div className="role-group-options">
            {OPTIONS[1].options.map((opt) => {
              const checked = value === opt.val;

              return (
                <div
                  key={opt.val}
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked ? 0 : -1}
                  className={`input-part-inside radio-option ${
                    checked ? "selected" : ""
                  }`}
                  onMouseEnter={() => setActive(opt.val)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => onChange(opt.val)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onChange(opt.val);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <LottieOption
                    selected={checked}
                    isActive={active === opt.val}
                  />

                  <label className="radio-label" style={{ textAlign: "left" }}>
                    {opt.val === "staff" ? (
                      <h4>Staff / Faculty</h4>
                    ) : (
                      <h4>{opt.label}</h4>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
