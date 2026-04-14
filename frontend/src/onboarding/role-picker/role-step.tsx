// src/components/survey/roleStep.jsx
import React from "react";
import RolePicker from ".";

const DISPLAY = {
  student: "Step Inside",
  staff: "Step Inside",
  visitor: "Get Started",
};

export default function RoleStep({ value, onChange, onNext, error }) {
  const isSelected = Boolean(value);
  const buttonLabel = isSelected ? DISPLAY[value] : "Start Exploring";
  const errorId = !isSelected && error ? "role-picker-error" : undefined;

  return (
    <div className="role-select-shell">
      <section className="survey survey-step role-select">
        <div className="onboarding">
          <h2 className="welcome-text">Join an <span style={{ color: 'var(--welcome-indie)' }}>Indie</span><br /> <span style={{ color: 'var(--welcome-sustainability)' }}>Sustainability</span> Project.</h2>

          <RolePicker value={value} onChange={onChange} errorId={errorId} />

          {!isSelected && error && (
            <div className="error-container" id={errorId} role="alert" aria-live="polite">
              <p>What option fits best?</p>
            </div>
          )}
          <div className="button-wrap"><button
            type="button"
            className={`begin-button ${!isSelected ? "is-disabled" : ""} ${
              value === "staff" ? "is-staff" : ""
            }`}
            disabled={!isSelected}
            aria-describedby={errorId}
            onClick={onNext}
          >
            <span className="begin-button__ghost" aria-hidden="true">{buttonLabel}</span>
            <span className="begin-button__inner">{buttonLabel}</span>
          </button></div>
        </div>
      </section>
    </div>
  );
}
