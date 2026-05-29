const DUPLICATE_SURVEY_NOTICE_EVENT = "be:duplicate-survey-notice";

export function showDuplicateSurveyNotice() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DUPLICATE_SURVEY_NOTICE_EVENT));
}

export function listenForDuplicateSurveyNotice(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(DUPLICATE_SURVEY_NOTICE_EVENT, callback);
  return () => {
    window.removeEventListener(DUPLICATE_SURVEY_NOTICE_EVENT, callback);
  };
}
