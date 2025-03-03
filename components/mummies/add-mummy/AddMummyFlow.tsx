"use client";
import { useState, useEffect } from "react";
import OnboardMummyModal from "./OnboardMummyModal";
import ServiceMummy from "./ServiceMummy";
import PreferenceMummyModal from "./PreferenceMummyModal";
import ResidentsMummyModal from "./ResidentsMummyModal";
import BudgetMummyModal from "./BudgetMummyModal";

const AddMummyFlow = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const savedStep = sessionStorage.getItem("mummyOnboardingStep");
    if (savedStep) setCurrentStep(Number(savedStep));
  }, []);

  const goNextStep = () => {
    setCurrentStep((prev) => {
      const newStep = prev + 1;
      sessionStorage.setItem("mummyOnboardingStep", newStep.toString());
      return newStep;
    });
  };

  const goPreviousStep = () => {
    setCurrentStep((prev) => {
      const newStep = Math.max(0, prev - 1);
      sessionStorage.setItem("mummyOnboardingStep", newStep.toString());
      return newStep;
    });
  };

  // New helper function to clear the session storage and close the modal
  const handleClose = () => {
    sessionStorage.removeItem("mummyOnboardingStep");
    onClose();
  };

  return (
    <>
      {currentStep === 0 && (
        <OnboardMummyModal onNext={goNextStep} onClose={handleClose} />
      )}
      {currentStep === 1 && (
        <ServiceMummy onNext={goNextStep} onBack={goPreviousStep} onClose={handleClose} />
      )}
      {currentStep === 2 && (
        <PreferenceMummyModal onNext={goNextStep} onBack={goPreviousStep} onClose={handleClose} />
      )}
      {currentStep === 3 && (
        <ResidentsMummyModal onNext={goNextStep} onBack={goPreviousStep} onClose={handleClose} />
      )}
      {currentStep === 4 && (
        <BudgetMummyModal 
          onBack={goPreviousStep} 
          onClose={handleClose} 
          onComplete={() => {
            // Clear session storage and complete the flow
            sessionStorage.removeItem("mummyOnboardingStep");
            onClose();
          }} 
        />
      )}
    </>
  );
};

export default AddMummyFlow;
