"use client";
import React, { useState, useEffect } from "react";
import EditBioModalNanny from "@/components/nannies/edit/EditBioModal";
import EditPersonalModal from "@/components/nannies/edit/EditPersonalModal";
import EditContactModal from "@/components/nannies/edit/EditContactModal";
import EditProfessionalModal from "@/components/nannies/edit/EditProffessionalModal";

type Step = "bio" | "personal" | "contact" | "professional" | null;

interface EditProfileFlowProps {
  nannyId: string;
  onClose: () => void;
}

const EditProfileFlow: React.FC<EditProfileFlowProps> = ({ nannyId, onClose }) => {
  const [step, setStep] = useState<Step>("bio");

  useEffect(() => {
    if (step === null) {
      onClose();
    }
  }, [step, onClose]);

  return (
    <>
      {step === "bio" && (
        <EditBioModalNanny
          nannyId={nannyId}
          onClose={() => setStep(null)}
          onProceed={() => setStep("personal")}
        />
      )}
      {step === "personal" && (
        <EditPersonalModal
        nannyId={nannyId}
        onClose={() => setStep(null)}
        onProceed={() => setStep("contact")}
      />
      )}
      {step === "contact" && (
        <EditContactModal 
        nannyId={nannyId}
        onClose={() => setStep(null)}
        onProceed={() => setStep("professional")}
      />
      )}
      {step === "professional" && (
        <EditProfessionalModal
        nannyId={nannyId}
          onClose={() => setStep(null)}
          onProceed={() => {
            console.log("All steps completed");
            setStep(null);
          }}
        />
      )}
    </>
  );
};

export default EditProfileFlow;
