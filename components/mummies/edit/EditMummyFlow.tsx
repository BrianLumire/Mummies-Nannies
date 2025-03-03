"use client";
import React, { useState, useEffect } from "react";
import BudgetModal from "@/components/mummies/edit/BudgetModal";
import EditBioModal from "@/components/mummies/edit/EditBioModal";
import ServicesModal from "@/components/mummies/edit/ServicesModal";  
import PreferenceModal from "@/components/mummies/edit/PreferenceModal";
import ResidentsModal from "@/components/mummies/edit/ResidentsModal";

type Step = "bio" | "services" | "preferences" | "residents" | "budget" | null;

interface EditMummyFlowProps {
  onClose: () => void;
  mammiesId: string; // Use the id from the route params
}

const EditMummyFlow: React.FC<EditMummyFlowProps> = ({ onClose, mammiesId }) => {
  const [step, setStep] = useState<Step>("bio");

  // When the flow is completed (step becomes null), call the parent's onClose.
  useEffect(() => {
    if (step === null) {
      onClose();
    }
  }, [step, onClose]);

  return (
    <>
      {step === "bio" && (
        <EditBioModal
          mammiesId={mammiesId}
          onClose={() => setStep(null)}
          onNext={() => setStep("services")}
        />
      )}
      {step === "services" && (
        <ServicesModal
          mammiesId={mammiesId}
          onClose={() => setStep(null)}
          onBack={() => setStep("bio")}
          onNext={() => setStep("preferences")}
        />
      )}
      {step === "preferences" && (
        <PreferenceModal
          mammiesId={mammiesId}
          onClose={() => setStep(null)}
          onBack={() => setStep("services")}
          onNext={() => setStep("residents")}
        />
      )}
      {step === "residents" && (
        <ResidentsModal
          mammiesId={mammiesId}
          onClose={() => setStep(null)}
          onBack={() => setStep("preferences")}
          onNext={() => setStep("budget")}
        />
      )}
      {step === "budget" && (
        <BudgetModal
          mammiesId={mammiesId}
          onClose={() => setStep(null)}
          onBack={() => setStep("residents")}
          onComplete={() => {
            // Final completion action—close the flow.
            setStep(null);
          }}
        />
      )}
    </>
  );
};

export default EditMummyFlow;
