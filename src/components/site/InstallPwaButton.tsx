"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const InstallPwaButton = () => {
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const onInstalled = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installPrompt) {
    return null;
  }

  const install = async () => {
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      toast.success("Los Toneles se está instalando.");
    }
    setInstallPrompt(null);
  };

  return (
    <button
      type="button"
      onClick={() => void install()}
      className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-xs font-semibold text-cream/80 transition hover:border-cream/40 hover:text-cream"
    >
      <Download className="h-3.5 w-3.5" />
      Instalar app
    </button>
  );
};

export default InstallPwaButton;
