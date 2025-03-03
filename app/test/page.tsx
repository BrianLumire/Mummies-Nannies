"use client";
import React, { useState } from "react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

const TestMammyButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestClick = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    const client = createClient();
    const email = "test@example.com"; // Replace or retrieve email as needed

    try {
      const { data: functionData, error: functionError } = await client.functions.invoke(
        "create_mammy_user_account",
        { body: { email } }
      );

      if (functionError) {
        setError(functionError.message || "An error occurred");
        toast.error(functionError.message || "An error occurred");
      } else {
        setResult(functionData);
        toast.success("Function invoked successfully!");
      }
    } catch (err) {
      setError("Unexpected error occurred");
      toast.error("Unexpected error occurred");
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleTestClick}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {loading ? "Loading..." : "Test Create Mammy Account"}
      </button>
      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {error && (
        <p className="mt-4 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default TestMammyButton;
