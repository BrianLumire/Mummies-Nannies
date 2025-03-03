"use client";
import React, { useState, useEffect } from "react";
import BioModal from "./BioModal";
import PersonalModal from "./PersonalModal";
import ContactModal from "./ContactModal";
import ProfessionalModal from "./ProfessionalModal";

const AddNannyFlow = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Load the saved step if available
  useEffect(() => {
    const savedStep = sessionStorage.getItem("nannyOnboardingStep");
    if (savedStep) {
      setCurrentStep(Number(savedStep));
    }
  }, []);

  const goNextStep = () => {
    setCurrentStep((prev) => {
      const newStep = prev + 1;
      sessionStorage.setItem("nannyOnboardingStep", newStep.toString());
      return newStep;
    });
  };

  const goPreviousStep = () => {
    setCurrentStep((prev) => {
      const newStep = Math.max(0, prev - 1);
      sessionStorage.setItem("nannyOnboardingStep", newStep.toString());
      return newStep;
    });
  };

  // Clear session storage and close the modal flow
  const handleClose = () => {
    sessionStorage.removeItem("nannyOnboardingStep");
    onClose();
  };

  return (
    // Modal container with dark overlay
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {currentStep === 0 && (
        <BioModal onNext={goNextStep} onClose={handleClose} />
      )}
      {currentStep === 1 && (
        <PersonalModal onNext={goNextStep} onBack={goPreviousStep} onClose={handleClose} />
      )}
      {currentStep === 2 && (
        <ContactModal onNext={goNextStep} onBack={goPreviousStep} onClose={handleClose} />
      )}
      {currentStep === 3 && (
        <ProfessionalModal
          onBack={goPreviousStep}
          onClose={handleClose}
          onComplete={() => {
            // Clear session storage and complete the flow
            sessionStorage.removeItem("nannyOnboardingStep");
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default AddNannyFlow;
