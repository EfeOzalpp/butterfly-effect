import { useMemo, useRef } from "react";

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

export default function RolePicker({ value, onChange, errorId }: { value: string; onChange: (value: any) => void; errorId?: string }) {
  const roleIds = useMemo(
    () => ["visitor", ...OPTIONS[1].options.map((opt) => opt.val)],
    []
  );
  const optionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const focusRole = (nextValue: string) => {
    optionRefs.current[nextValue]?.focus();
  };

  const handleArrowNav = (currentValue: string, delta: number) => {
    const currentIndex = roleIds.indexOf(currentValue);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + delta + roleIds.length) % roleIds.length;
    const nextValue = roleIds[nextIndex];
    onChange(nextValue);
    focusRole(nextValue);
  };

  const handleKeyDown = (currentValue: string) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(currentValue);
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      handleArrowNav(currentValue, 1);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      handleArrowNav(currentValue, -1);
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      onChange(roleIds[0]);
      focusRole(roleIds[0]);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      const last = roleIds[roleIds.length - 1];
      onChange(last);
      focusRole(last);
    }
  };

  return (
    <div className="radio-group">
      <div
        role="radiogroup"
        className="radio-options"
        aria-labelledby="role-picker-label"
        aria-describedby={errorId}
      >

        {/* Visitor */}
        <div className="role-tag role-tag--center"><span className="role-label" id="role-picker-label">Who are you?</span></div>
        <div
          ref={(node) => { optionRefs.current.visitor = node; }}
          role="radio"
          aria-checked={value === "visitor"}
          tabIndex={value === "visitor" ? 0 : -1}
          className={`input-part-inside radio-option${value === "visitor" ? " selected" : ""}`}
          onClick={() => onChange("visitor")}
          onKeyDown={handleKeyDown("visitor")}
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
                ref={(node) => { optionRefs.current[opt.val] = node; }}
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                className={`input-part-inside radio-option radio-option--inset${checked ? " selected" : ""}`}
                onClick={() => onChange(opt.val)}
                onKeyDown={handleKeyDown(opt.val)}
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
