import {
  Dna,
  RefreshCcw,
  Ruler,
  Settings2,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BiaModule } from "./components/BiaModule";
import { CircumferenceModule } from "./components/CircumferenceModule";
import { DataEntryMenu, type EntryMode } from "./components/DataEntryMenu";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { SkinfoldModule } from "./components/SkinfoldModule";
import { HEALTH_DATA } from "./data/healthData";
import type {
  BIAMeasurement,
  CircumferenceMeasurement,
  SkinfoldMeasurement,
} from "./types";
import {
  buildCircumferenceMeasurement,
  buildSkinfoldMeasurement,
  type CircumferenceInput,
  type SkinfoldInput,
} from "./utils/anthropometry";
import { useI18n } from "./i18n";

const SKINFOLD_STORAGE_KEY = "myhealthhub.skinfolds";
const CIRC_STORAGE_KEY = "myhealthhub.circumferences";
const BIA_STORAGE_KEY = "myhealthhub.bia";
const PROFILE_STORAGE_KEY = "myhealthhub.profile";
const SETUP_DONE_STORAGE_KEY = "myhealthhub.setupDone";

type HealthProfile = typeof HEALTH_DATA.profile;

const readStoredArray = <T,>(
  key: string,
  fallback: T[],
  validateItem: (item: unknown) => item is T,
): T[] => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return fallback;
    }

    if (parsed.length === 0) {
      return [];
    }

    const validItems = parsed.filter(validateItem);
    return validItems.length > 0 ? validItems : fallback;
  } catch {
    return fallback;
  }
};

const isValidSkinfoldMeasurement = (
  item: unknown,
): item is SkinfoldMeasurement => {
  if (!item || typeof item !== "object") {
    return false;
  }

  const typed = item as SkinfoldMeasurement;
  return (
    typeof typed.id === "string" &&
    typeof typed.measurementNumber === "number" &&
    Number.isFinite(typed.measurementNumber) &&
    Number.isFinite(typed.weightKg) &&
    Number.isFinite(typed.bodyFatPctFromSkinfold) &&
    typed.sitesMm !== undefined &&
    Number.isFinite(typed.sitesMm.tricipite) &&
    Number.isFinite(typed.sitesMm.addome) &&
    Number.isFinite(typed.sitesMm.soprailiaca) &&
    Number.isFinite(typed.sitesMm.sottoscapolare) &&
    Number.isFinite(typed.sitesMm.ascellare) &&
    Number.isFinite(typed.sitesMm.pettorale) &&
    Number.isFinite(typed.sitesMm.coscia)
  );
};

const isValidCircumferenceMeasurement = (
  item: unknown,
): item is CircumferenceMeasurement => {
  if (!item || typeof item !== "object") {
    return false;
  }

  const typed = item as CircumferenceMeasurement;
  return (
    typeof typed.id === "string" &&
    typeof typed.measurementNumber === "number" &&
    Number.isFinite(typed.measurementNumber) &&
    Number.isFinite(typed.bodyFatPctFromCircumferences) &&
    typed.sitesCm !== undefined &&
    Number.isFinite(typed.sitesCm.braccio) &&
    Number.isFinite(typed.sitesCm.torace) &&
    Number.isFinite(typed.sitesCm.vita) &&
    Number.isFinite(typed.sitesCm.fianchi) &&
    Number.isFinite(typed.sitesCm.coscia) &&
    Number.isFinite(typed.sitesCm.polpaccio) &&
    Number.isFinite(typed.sitesCm.collo)
  );
};

const isValidBiaMeasurement = (item: unknown): item is BIAMeasurement => {
  if (!item || typeof item !== "object") {
    return false;
  }

  const typed = item as BIAMeasurement;
  return (
    typeof typed.id === "string" &&
    typed.metrics !== undefined &&
    Number.isFinite(typed.metrics.weightKg) &&
    Number.isFinite(typed.metrics.bodyFatPct) &&
    Number.isFinite(typed.metrics.ecwKg) &&
    Number.isFinite(typed.metrics.icwKg) &&
    Number.isFinite(typed.metrics.bmrKcal) &&
    Array.isArray(typed.rawMetrics)
  );
};

const isValidProfile = (item: unknown): item is HealthProfile => {
  if (!item || typeof item !== "object") {
    return false;
  }

  const typed = item as HealthProfile;
  return (
    typeof typed.patientName === "string" &&
    (typed.birthDate === undefined || typeof typed.birthDate === "string") &&
    (typed.sex === "male" || typed.sex === "female") &&
    Number.isFinite(typed.heightCm) &&
    typed.heightCm > 0
  );
};

const calculateAgeFromBirthDate = (birthDate?: string): number => {
  if (!birthDate) {
    return HEALTH_DATA.profile.ageYears;
  }

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return HEALTH_DATA.profile.ageYears;
  }

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());

  if (beforeBirthday) {
    age -= 1;
  }

  return age > 0 ? age : HEALTH_DATA.profile.ageYears;
};

const hasStoredValidProfile = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return false;
    }

    return isValidProfile(JSON.parse(raw));
  } catch {
    return false;
  }
};

const App = () => {
  const { locale, setLocale, m } = useI18n();
  const dataMenuRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<HealthProfile>(() => {
    if (typeof window === "undefined") {
      return HEALTH_DATA.profile;
    }

    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) {
        return HEALTH_DATA.profile;
      }

      const parsed = JSON.parse(raw);
      return isValidProfile(parsed) ? parsed : HEALTH_DATA.profile;
    } catch {
      return HEALTH_DATA.profile;
    }
  });

  const [showInitialSetup, setShowInitialSetup] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return !hasStoredValidProfile();
  });

  const [setupName, setSetupName] = useState(profile.patientName);
  const [setupBirthDate, setSetupBirthDate] = useState(profile.birthDate ?? "");
  const [setupSex, setSetupSex] = useState<"male" | "female">(profile.sex);
  const [setupHeight, setSetupHeight] = useState(`${profile.heightCm}`);
  const [setupError, setSetupError] = useState("");

  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const [dataMenuMode, setDataMenuMode] = useState<EntryMode>("skinfolds");

  const [biaMeasurements, setBiaMeasurements] = useState(() =>
    readStoredArray(
      BIA_STORAGE_KEY,
      HEALTH_DATA.bia.measurements,
      isValidBiaMeasurement,
    ),
  );
  const [skinfoldMeasurements, setSkinfoldMeasurements] = useState(() =>
    readStoredArray(
      SKINFOLD_STORAGE_KEY,
      HEALTH_DATA.skinfolds.measurements,
      isValidSkinfoldMeasurement,
    ),
  );
  const [circumferenceMeasurements, setCircumferenceMeasurements] = useState(
    () =>
      readStoredArray(
        CIRC_STORAGE_KEY,
        HEALTH_DATA.circumferences.measurements,
        isValidCircumferenceMeasurement,
      ),
  );

  const healthData = useMemo(
    () => ({
      ...HEALTH_DATA,
      profile: {
        ...profile,
        ageYears: calculateAgeFromBirthDate(profile.birthDate),
      },
      bia: {
        measurements: biaMeasurements,
      },
      skinfolds: {
        measurements: skinfoldMeasurements,
      },
      circumferences: {
        measurements: circumferenceMeasurements,
      },
    }),
    [profile, biaMeasurements, skinfoldMeasurements, circumferenceMeasurements],
  );

  const handleAddSkinfold = (input: SkinfoldInput) => {
    setSkinfoldMeasurements((previous) => {
      const next = buildSkinfoldMeasurement(input, previous.length + 1);
      return [...previous, next];
    });
  };

  const handleAddCircumference = (input: CircumferenceInput) => {
    setCircumferenceMeasurements((previous) => {
      const next = buildCircumferenceMeasurement(
        input,
        previous.length + 1,
        profile.heightCm,
      );
      return [...previous, next];
    });
  };

  const openInitialSetup = () => {
    setSetupName(profile.patientName);
    setSetupBirthDate(profile.birthDate ?? "");
    setSetupSex(profile.sex);
    setSetupHeight(`${profile.heightCm}`);
    setSetupError("");
    setShowInitialSetup(true);
  };

  const handleResetAllMemory = () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(SKINFOLD_STORAGE_KEY);
      window.localStorage.removeItem(CIRC_STORAGE_KEY);
      window.localStorage.removeItem(BIA_STORAGE_KEY);
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      window.localStorage.removeItem(SETUP_DONE_STORAGE_KEY);
    } catch {
      // Ignore storage errors and still reset in-memory state.
    }

    setProfile(HEALTH_DATA.profile);
    setSetupName(HEALTH_DATA.profile.patientName);
    setSetupBirthDate(HEALTH_DATA.profile.birthDate ?? "");
    setSetupSex(HEALTH_DATA.profile.sex);
    setSetupHeight(`${HEALTH_DATA.profile.heightCm}`);
    setSetupError("");

    setBiaMeasurements(HEALTH_DATA.bia.measurements);
    setSkinfoldMeasurements(HEALTH_DATA.skinfolds.measurements);
    setCircumferenceMeasurements(HEALTH_DATA.circumferences.measurements);

    setIsDataMenuOpen(false);
    setShowInitialSetup(true);
  };

  const handleSaveInitialSetup = () => {
    const parsedHeight = Number(setupHeight);
    const trimmedName = setupName.trim();

    if (!trimmedName) {
      setSetupError(m.setupNameError);
      return;
    }

    if (!setupBirthDate) {
      setSetupError(m.setupBirthDateError);
      return;
    }

    const birth = new Date(setupBirthDate);
    if (Number.isNaN(birth.getTime())) {
      setSetupError(m.setupBirthDateInvalidError);
      return;
    }

    if (!Number.isFinite(parsedHeight) || parsedHeight <= 0) {
      setSetupError(m.setupHeightError);
      return;
    }

    const nextProfile: HealthProfile = {
      patientName: trimmedName,
      birthDate: setupBirthDate,
      sex: setupSex,
      heightCm: parsedHeight,
      ageYears: calculateAgeFromBirthDate(setupBirthDate),
    };

    setProfile(nextProfile);
    setSetupError("");
    setShowInitialSetup(false);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify(nextProfile),
        );
        window.localStorage.setItem(SETUP_DONE_STORAGE_KEY, "1");
      } catch {
        // Keep working even if storage is blocked.
      }
    }
  };

  const handleDeleteBia = (id: string) => {
    setBiaMeasurements((previous) =>
      previous.filter((measurement) => measurement.id !== id),
    );
  };

  const handleDeleteBiaGroup = (groupKey: string) => {
    setBiaMeasurements((previous) =>
      previous.filter((measurement) => {
        const key = measurement.date ?? measurement.dateLabel ?? "undated";
        return key !== groupKey;
      }),
    );
  };

  const handleDeleteSkinfold = (id: string) => {
    setSkinfoldMeasurements((previous) =>
      previous
        .filter((measurement) => measurement.id !== id)
        .map((measurement, index) => ({
          ...measurement,
          measurementNumber: index + 1,
        })),
    );
  };

  const handleDeleteSkinfoldGroup = (date: string) => {
    setSkinfoldMeasurements((previous) =>
      previous
        .filter((measurement) => (measurement.date ?? "") !== date)
        .map((measurement, index) => ({
          ...measurement,
          measurementNumber: index + 1,
        })),
    );
  };

  const handleDeleteCircumference = (id: string) => {
    setCircumferenceMeasurements((previous) =>
      previous
        .filter((measurement) => measurement.id !== id)
        .map((measurement, index) => ({
          ...measurement,
          measurementNumber: index + 1,
        })),
    );
  };

  const handleDeleteCircumferenceGroup = (date: string) => {
    setCircumferenceMeasurements((previous) =>
      previous
        .filter((measurement) => (measurement.date ?? "") !== date)
        .map((measurement, index) => ({
          ...measurement,
          measurementNumber: index + 1,
        })),
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        SKINFOLD_STORAGE_KEY,
        JSON.stringify(skinfoldMeasurements),
      );
    } catch {
      // Keep UI responsive even when storage is unavailable.
    }
  }, [skinfoldMeasurements]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        CIRC_STORAGE_KEY,
        JSON.stringify(circumferenceMeasurements),
      );
    } catch {
      // Keep UI responsive even when storage is unavailable.
    }
  }, [circumferenceMeasurements]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        BIA_STORAGE_KEY,
        JSON.stringify(biaMeasurements),
      );
    } catch {
      // Keep UI responsive even when storage is unavailable.
    }
  }, [biaMeasurements]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Keep UI responsive even when storage is unavailable.
    }
  }, [profile]);

  const sourceBadge = `${m.sourcesPrefix}: ${HEALTH_DATA.sources.bia} + ${HEALTH_DATA.sources.anthropometry}`;

  const openMenu = (mode: EntryMode) => {
    setDataMenuMode(mode);
    setIsDataMenuOpen(true);
  };

  useEffect(() => {
    if (isDataMenuOpen) {
      dataMenuRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isDataMenuOpen, dataMenuMode]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1500px] px-4 pb-12 pt-6 md:px-6 lg:px-10">
      {showInitialSetup ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700/70 bg-surface-900 p-6 shadow-panel">
            <h2 className="font-display text-2xl font-semibold text-slate-100">
              {m.setupTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{m.setupSubtitle}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-slate-400">
                {m.patientName}
                <input
                  value={setupName}
                  onChange={(event) => setSetupName(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                />
              </label>

              <label className="text-xs text-slate-400">
                {m.birthDate}
                <input
                  type="date"
                  value={setupBirthDate}
                  onChange={(event) => setSetupBirthDate(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                />
              </label>

              <label className="text-xs text-slate-400">
                {m.sex}
                <select
                  value={setupSex}
                  onChange={(event) =>
                    setSetupSex(event.target.value as "male" | "female")
                  }
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="male">{m.male}</option>
                  <option value="female">{m.female}</option>
                </select>
              </label>

              <label className="text-xs text-slate-400">
                {m.heightCm}
                <input
                  type="number"
                  step="0.1"
                  value={setupHeight}
                  onChange={(event) => setSetupHeight(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                />
              </label>
            </div>

            {setupError ? (
              <p className="mt-3 rounded-lg border border-rose-700/50 bg-rose-900/20 px-3 py-2 text-xs text-rose-200">
                {setupError}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveInitialSetup}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-900/45"
              >
                <Settings2 className="h-4 w-4" />
                {m.saveSetup}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header className="no-print mb-6 rounded-2xl border border-slate-700/70 bg-surface-900/90 p-5 shadow-panel backdrop-blur">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
              MyHealth Hub
            </h1>
            <p className="mt-2 text-xs text-slate-500">{sourceBadge}</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/60 px-2 py-1 text-xs text-slate-300">
              {m.languageLabel}
              <select
                value={locale}
                onChange={(event) =>
                  setLocale(event.target.value as "it" | "en")
                }
                className="rounded border border-slate-500 bg-slate-900 px-2 py-1 text-xs text-slate-100"
              >
                <option value="it">{m.languageItalian}</option>
                <option value="en">{m.languageEnglish}</option>
              </select>
            </label>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
              <Stethoscope className="h-4 w-4 text-cyan-300" />
              {m.patientPrefix}: {healthData.profile.patientName}
            </span>
            <button
              type="button"
              onClick={openInitialSetup}
              className="no-print inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-2 text-xs text-slate-200 hover:bg-slate-700/70"
            >
              <Settings2 className="h-4 w-4" />
              {m.initialSetupButton}
            </button>
            <button
              type="button"
              onClick={handleResetAllMemory}
              className="no-print inline-flex items-center gap-2 rounded-lg border border-rose-700/60 bg-rose-900/25 px-3 py-2 text-xs text-rose-200 hover:bg-rose-900/45"
            >
              <RefreshCcw className="h-4 w-4" />
              {m.resetMemoryButton}
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-5">
        <section className="no-print rounded-2xl border border-slate-700/60 bg-surface-900/85 p-4 shadow-panel backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openMenu("skinfolds")}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-3 py-1.5 text-sm text-cyan-100 hover:bg-cyan-900/45"
            >
              <Dna className="h-4 w-4" />
              {m.addSkinfolds}
            </button>
            <button
              type="button"
              onClick={() => openMenu("circumferences")}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-3 py-1.5 text-sm text-cyan-100 hover:bg-cyan-900/45"
            >
              <Ruler className="h-4 w-4" />
              {m.addCircumferences}
            </button>
            <button
              type="button"
              onClick={() => setIsDataMenuOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700/70"
            >
              <Wrench className="h-4 w-4" />
              {isDataMenuOpen ? m.hideDataManagement : m.openDataManagement}
            </button>
          </div>
        </section>

        {isDataMenuOpen ? (
          <div ref={dataMenuRef}>
            <DataEntryMenu
              healthData={healthData}
              onAddSkinfold={handleAddSkinfold}
              onAddCircumference={handleAddCircumference}
              onDeleteBia={handleDeleteBia}
              onDeleteBiaGroup={handleDeleteBiaGroup}
              onDeleteSkinfold={handleDeleteSkinfold}
              onDeleteSkinfoldGroup={handleDeleteSkinfoldGroup}
              onDeleteCircumference={handleDeleteCircumference}
              onDeleteCircumferenceGroup={handleDeleteCircumferenceGroup}
              initialMode={dataMenuMode}
              locale={locale}
              onClose={() => setIsDataMenuOpen(false)}
            />
          </div>
        ) : null}

        <ExecutiveSummary healthData={healthData} locale={locale} />
        <BiaModule healthData={healthData} locale={locale} />
        <SkinfoldModule healthData={healthData} locale={locale} />
        <CircumferenceModule healthData={healthData} locale={locale} />
      </main>
    </div>
  );
};

export default App;
