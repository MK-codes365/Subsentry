"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function EmailIngestionPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const startIngestion = async () => {
    if (!user) {
      setError("You need to be logged in to do this!");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    // This is sample data to simulate the "parsed emails" coming from the Gmail API.
    // In a real app, you'd fetch these from the Gmail scan service first.
    const sampleParsedEmails = [
      {
        merchant: "Netflix",
        amount: 499,
        date: new Date().toISOString(),
        currency: "INR",
        billingCycle: "monthly",
      },
      {
        merchant: "Amazon Prime",
        amount: 1499,
        date: new Date().toISOString(),
        currency: "INR",
        billingCycle: "yearly",
      },
      {
        merchant: "Spotify",
        amount: 119,
        date: new Date().toISOString(),
        currency: "INR",
        billingCycle: "monthly",
      },
    ];

    try {
      const response = await fetch("http://localhost:5000/api/email/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          emails: sampleParsedEmails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.summary);
      } else {
        setError(data.error || "Something went wrong during ingestion.");
      }
    } catch (err) {
      setError(
        "Could not connect to the backend server. Make sure it's running on port 5000!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-4">Email Ingestion</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This page scans your connected email for subscription receipts and
          adds them to your dashboard.
        </p>

        {!result && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Ready to scan?</h2>
            <button
              onClick={startIngestion}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-out"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Scanning Emails..." : "Start Gmail Scan"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Scan Complete!
            </h2>
            <div className="space-y-2">
              <p>
                ✅ Added: <strong>{result.added}</strong> new subscriptions
              </p>
              <p>
                ⏭️ Skipped: <strong>{result.skipped}</strong> duplicates
              </p>
              <p>
                ❌ Failed: <strong>{result.failed}</strong> records
              </p>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 block text-center py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              View in Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
