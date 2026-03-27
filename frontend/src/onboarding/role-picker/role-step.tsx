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
    <section className="survey survey-step role-select">
      <div className="onboarding">
        <h1 className="welcome-title">Butterfly Effect</h1>
        <h3 className="welcome-text">Decisions That<br />Affect the Environment.</h3>

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
          <span>{buttonLabel}</span>
        </button></div>
      </div>
    </section>
  );
}
