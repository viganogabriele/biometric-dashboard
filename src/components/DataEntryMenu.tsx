import {
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { HealthData } from "../types";
import type { CircumferenceInput, SkinfoldInput } from "../utils/anthropometry";
import {
  buildAnthropometryExport,
  buildNutritionReportRows,
} from "../utils/anthropometry";
import { getSiteLabel, type Locale, useI18n } from "../i18n";
import { Panel } from "./common/Panel";

export type EntryMode = "skinfolds" | "circumferences";

interface DataEntryMenuProps {
  healthData: HealthData;
  onAddSkinfold: (input: SkinfoldInput) => void;
  onAddCircumference: (input: CircumferenceInput) => void;
  onDeleteBia: (id: string) => void;
  onDeleteBiaGroup: (groupKey: string) => void;
  onDeleteSkinfold: (id: string) => void;
  onDeleteSkinfoldGroup: (date: string) => void;
  onDeleteCircumference: (id: string) => void;
  onDeleteCircumferenceGroup: (date: string) => void;
  initialMode?: EntryMode;
  locale: Locale;
  onClose?: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 focus:ring";

const downloadTextFile = (
  content: string,
  filename: string,
  mimeType: string,
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const calculateAgeFromBirthDate = (
  birthDate: string | undefined,
  onDate: string,
): number | null => {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);
  const reference = new Date(onDate);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) {
    return null;
  }

  let age = reference.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    reference.getMonth() < birth.getMonth() ||
    (reference.getMonth() === birth.getMonth() &&
      reference.getDate() < birth.getDate());

  if (beforeBirthday) {
    age -= 1;
  }

  return age > 0 ? age : null;
};

export const DataEntryMenu = ({
  healthData,
  onAddSkinfold,
  onAddCircumference,
  onDeleteBia,
  onDeleteBiaGroup,
  onDeleteSkinfold,
  onDeleteSkinfoldGroup,
  onDeleteCircumference,
  onDeleteCircumferenceGroup,
  initialMode,
  locale,
  onClose,
}: DataEntryMenuProps) => {
  const { m } = useI18n();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  const [mode, setMode] = useState<EntryMode>(initialMode ?? "skinfolds");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  const [skinfoldDate, setSkinfoldDate] = useState("");
  const [skinfoldWeight, setSkinfoldWeight] = useState("");
  const [skinfoldSites, setSkinfoldSites] = useState({
    tricipite: "",
    addome: "",
    soprailiaca: "",
    sottoscapolare: "",
    ascellare: "",
    pettorale: "",
    coscia: "",
  });

  const [circDate, setCircDate] = useState("");
  const [circSites, setCircSites] = useState({
    braccio: "",
    torace: "",
    vita: "",
    fianchi: "",
    coscia: "",
    polpaccio: "",
    collo: "",
  });

  const nextSkinfoldNumber = useMemo(
    () => healthData.skinfolds.measurements.length + 1,
    [healthData.skinfolds.measurements.length],
  );

  const nextCircNumber = useMemo(
    () => healthData.circumferences.measurements.length + 1,
    [healthData.circumferences.measurements.length],
  );

  const handleAddSkinfold = (event: React.FormEvent) => {
    event.preventDefault();
    if (!skinfoldDate || !skinfoldWeight) {
      setMessage(m.messageFillDateWeight);
      return;
    }

    const parsedSites: SkinfoldInput["sitesMm"] = {
      tricipite: Number(skinfoldSites.tricipite),
      addome: Number(skinfoldSites.addome),
      soprailiaca: Number(skinfoldSites.soprailiaca),
      sottoscapolare: Number(skinfoldSites.sottoscapolare),
      ascellare: Number(skinfoldSites.ascellare),
      pettorale: Number(skinfoldSites.pettorale),
      coscia: Number(skinfoldSites.coscia),
    };

    if (
      Object.values(parsedSites).some(
        (value) => Number.isNaN(value) || value <= 0,
      )
    ) {
      setMessage(m.messageInvalidSkinfolds);
      return;
    }

    const weight = Number(skinfoldWeight);
    const age = calculateAgeFromBirthDate(
      healthData.profile.birthDate,
      skinfoldDate,
    );

    if (!Number.isFinite(weight) || weight <= 0) {
      setMessage(m.messageInvalidWeight);
      return;
    }

    if (age === null) {
      setMessage(m.messageInvalidBirthDateProfile);
      return;
    }

    try {
      onAddSkinfold({
        date: skinfoldDate,
        weightKg: weight,
        ageYears: age,
        sitesMm: parsedSites,
      });
    } catch {
      setMessage(m.messageSkinfoldCalcError);
      return;
    }

    setSkinfoldWeight("");
    setSkinfoldSites({
      tricipite: "",
      addome: "",
      soprailiaca: "",
      sottoscapolare: "",
      ascellare: "",
      pettorale: "",
      coscia: "",
    });
    setMessage(m.messageSkinfoldAdded);
  };

  const handleAddCircumference = (event: React.FormEvent) => {
    event.preventDefault();
    if (!circDate) {
      setMessage(m.messageFillDateCirc);
      return;
    }

    const parsedSites: CircumferenceInput["sitesCm"] = {
      braccio: Number(circSites.braccio),
      torace: Number(circSites.torace),
      vita: Number(circSites.vita),
      fianchi: Number(circSites.fianchi),
      coscia: Number(circSites.coscia),
      polpaccio: Number(circSites.polpaccio),
      collo: Number(circSites.collo),
    };

    if (
      Object.values(parsedSites).some(
        (value) => Number.isNaN(value) || value <= 0,
      )
    ) {
      setMessage(m.messageInvalidCirc);
      return;
    }

    if (parsedSites.vita <= parsedSites.collo) {
      setMessage(m.messageWaistNeck);
      return;
    }

    try {
      onAddCircumference({
        date: circDate,
        sitesCm: parsedSites,
      });
    } catch {
      setMessage(m.messageCircCalcError);
      return;
    }

    setCircSites({
      braccio: "",
      torace: "",
      vita: "",
      fianchi: "",
      coscia: "",
      polpaccio: "",
      collo: "",
    });
    setMessage(m.messageCircAdded);
  };

  const handleExportJson = () => {
    const payload = buildAnthropometryExport(healthData, locale, m);
    downloadTextFile(
      payload.json,
      `${m.filePrefixAnthropometrySummary}-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json;charset=utf-8",
    );
    setMessage(m.messageJsonExported);
  };

  const handleExportCsv = () => {
    const payload = buildAnthropometryExport(healthData, locale, m);
    downloadTextFile(
      payload.csv,
      `${m.filePrefixAnthropometrySummary}-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );
    setMessage(m.messageCsvExported);
  };

  const handleExportNutritionistPdf = async () => {
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const rows = buildNutritionReportRows(healthData);
      const righePliche = rows.filter((row) => row.category === "skinfolds");
      const righeCirconferenze = rows.filter(
        (row) => row.category === "circumferences",
      );
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      doc.setFontSize(16);
      doc.text(m.pdfTitle, 40, 44);
      doc.setFontSize(10);
      doc.text(`${m.patientPrefix}: ${healthData.profile.patientName}`, 40, 62);
      doc.text(
        `${m.generatedOn}: ${new Date().toLocaleString(dateLocale)}`,
        40,
        76,
      );
      doc.text(`${m.noteLabel}: ${m.biaMdNote}`, 40, 90);

      autoTable(doc, {
        startY: 108,
        head: [
          [
            m.date,
            "#",
            `${m.weight} (kg)`,
            "BF%",
            `${m.averageSkinfold} (mm)`,
            getSiteLabel(locale, "tricipite"),
            getSiteLabel(locale, "addome"),
            getSiteLabel(locale, "soprailiaca"),
            getSiteLabel(locale, "sottoscapolare"),
            getSiteLabel(locale, "ascellare"),
            getSiteLabel(locale, "pettorale"),
            getSiteLabel(locale, "coscia"),
          ],
        ],
        body: righePliche.map((row) => [
          row.date,
          row.numeroMisurazione,
          row.pesoKg ?? "",
          row.bodyFatPct,
          row.mediaPlicheMm ?? "",
          row.tricipiteMm ?? "",
          row.addomeMm ?? "",
          row.soprailiacaMm ?? "",
          row.sottoscapolareMm ?? "",
          row.ascellareMm ?? "",
          row.pettoraleMm ?? "",
          row.cosciaMm ?? "",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [15, 23, 42],
        },
        theme: "grid",
      });

      doc.setFontSize(12);
      doc.text(
        m.pdfCircTableTitle,
        40,
        ((doc as unknown as { lastAutoTable?: { finalY: number } })
          .lastAutoTable?.finalY ?? 108) + 24,
      );

      autoTable(doc, {
        startY:
          ((doc as unknown as { lastAutoTable?: { finalY: number } })
            .lastAutoTable?.finalY ?? 108) + 32,
        head: [
          [
            m.date,
            "#",
            "BF%",
            getSiteLabel(locale, "braccio"),
            getSiteLabel(locale, "torace"),
            getSiteLabel(locale, "vita"),
            getSiteLabel(locale, "fianchi"),
            getSiteLabel(locale, "coscia"),
            getSiteLabel(locale, "polpaccio"),
            getSiteLabel(locale, "collo"),
          ],
        ],
        body: righeCirconferenze.map((row) => [
          row.date,
          row.numeroMisurazione,
          row.bodyFatPct,
          row.braccioCm ?? "",
          row.toraceCm ?? "",
          row.vitaCm ?? "",
          row.fianchiCm ?? "",
          row.cosciaCm ?? "",
          row.polpaccioCm ?? "",
          row.colloCm ?? "",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [15, 23, 42],
        },
        theme: "grid",
      });

      doc.save(
        `${m.filePrefixNutritionistReport}-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      setMessage(m.messagePdfExported);
    } catch {
      setMessage(m.messagePdfError);
    }
  };

  const handleExportNutritionistExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = buildNutritionReportRows(healthData);
      const workbook = XLSX.utils.book_new();
      const righePliche = rows
        .filter((row) => row.category === "skinfolds")
        .map((row) =>
          locale === "it"
            ? {
                data: row.date,
                numero_misurazione: row.numeroMisurazione,
                peso_kg: row.pesoKg ?? "",
                body_fat_pct: row.bodyFatPct,
                media_pliche_mm: row.mediaPlicheMm ?? "",
                tricipite_mm: row.tricipiteMm ?? "",
                addome_mm: row.addomeMm ?? "",
                soprailiaca_mm: row.soprailiacaMm ?? "",
                sottoscapolare_mm: row.sottoscapolareMm ?? "",
                ascellare_mm: row.ascellareMm ?? "",
                pettorale_mm: row.pettoraleMm ?? "",
                coscia_mm: row.cosciaMm ?? "",
              }
            : {
                date: row.date,
                measurement_number: row.numeroMisurazione,
                weight_kg: row.pesoKg ?? "",
                body_fat_pct: row.bodyFatPct,
                avg_skinfold_mm: row.mediaPlicheMm ?? "",
                triceps_mm: row.tricipiteMm ?? "",
                abdomen_mm: row.addomeMm ?? "",
                suprailiac_mm: row.soprailiacaMm ?? "",
                subscapular_mm: row.sottoscapolareMm ?? "",
                axillary_mm: row.ascellareMm ?? "",
                pectoral_mm: row.pettoraleMm ?? "",
                thigh_mm: row.cosciaMm ?? "",
              },
        );

      const righeCirconferenze = rows
        .filter((row) => row.category === "circumferences")
        .map((row) =>
          locale === "it"
            ? {
                data: row.date,
                numero_misurazione: row.numeroMisurazione,
                body_fat_pct: row.bodyFatPct,
                braccio_cm: row.braccioCm ?? "",
                torace_cm: row.toraceCm ?? "",
                vita_cm: row.vitaCm ?? "",
                fianchi_cm: row.fianchiCm ?? "",
                coscia_cm: row.cosciaCm ?? "",
                polpaccio_cm: row.polpaccioCm ?? "",
                collo_cm: row.colloCm ?? "",
              }
            : {
                date: row.date,
                measurement_number: row.numeroMisurazione,
                body_fat_pct: row.bodyFatPct,
                arm_cm: row.braccioCm ?? "",
                chest_cm: row.toraceCm ?? "",
                waist_cm: row.vitaCm ?? "",
                hips_cm: row.fianchiCm ?? "",
                thigh_cm: row.cosciaCm ?? "",
                calf_cm: row.polpaccioCm ?? "",
                neck_cm: row.colloCm ?? "",
              },
        );

      const summarySheet = XLSX.utils.json_to_sheet([
        locale === "it"
          ? {
              paziente: healthData.profile.patientName,
              eta_anni: healthData.profile.ageYears,
              altezza_cm: healthData.profile.heightCm,
              generato_il: new Date().toISOString(),
              nota: m.biaMdNote,
            }
          : {
              patient: healthData.profile.patientName,
              age_years: healthData.profile.ageYears,
              height_cm: healthData.profile.heightCm,
              generated_at: new Date().toISOString(),
              note: m.biaMdNote,
            },
      ]);

      const plicheSheet = XLSX.utils.json_to_sheet(righePliche);
      const circonferenzeSheet = XLSX.utils.json_to_sheet(righeCirconferenze);

      XLSX.utils.book_append_sheet(workbook, summarySheet, m.summarySheet);
      XLSX.utils.book_append_sheet(workbook, plicheSheet, m.skinfoldSheet);
      XLSX.utils.book_append_sheet(
        workbook,
        circonferenzeSheet,
        m.circumferenceSheet,
      );
      XLSX.writeFile(
        workbook,
        `${m.filePrefixNutritionistReport}-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      setMessage(m.messageExcelExported);
    } catch {
      setMessage(m.messageExcelError);
    }
  };

  return (
    <Panel
      title={m.dataEntryTitle}
      subtitle={m.dataEntrySubtitle}
      icon={PlusCircle}
      rightSlot={
        <div className="flex flex-wrap items-center gap-2">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/70"
            >
              <X className="h-4 w-4" />
              {m.close}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleExportNutritionistPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-900/45"
          >
            <FileDown className="h-4 w-4" />
            {m.reportPdf}
          </button>
          <button
            type="button"
            onClick={handleExportNutritionistExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-900/45"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {m.reportExcel}
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/70"
          >
            <FileText className="h-4 w-4" />
            {m.exportJson}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/70"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {m.exportCsv}
          </button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("skinfolds")}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            mode === "skinfolds"
              ? "border-cyan-500 bg-cyan-900/30 text-cyan-200"
              : "border-slate-600 bg-slate-800/70 text-slate-200"
          }`}
        >
          {m.skinfolds}
        </button>
        <button
          type="button"
          onClick={() => setMode("circumferences")}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            mode === "circumferences"
              ? "border-cyan-500 bg-cyan-900/30 text-cyan-200"
              : "border-slate-600 bg-slate-800/70 text-slate-200"
          }`}
        >
          {m.circumferences}
        </button>
      </div>

      {mode === "skinfolds" ? (
        <form
          className="grid gap-3 md:grid-cols-3"
          onSubmit={handleAddSkinfold}
        >
          <label className="text-xs text-slate-400">
            {m.date}
            <input
              className={inputClassName}
              type="date"
              value={skinfoldDate}
              onChange={(event) => setSkinfoldDate(event.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            {m.weight} (kg)
            <input
              className={inputClassName}
              type="number"
              step="0.1"
              value={skinfoldWeight}
              onChange={(event) => setSkinfoldWeight(event.target.value)}
            />
          </label>

          <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
            {m.ageFormula}
            {healthData.profile.birthDate
              ? ` (${healthData.profile.birthDate})`
              : ` ${m.profileSuffix}`}
          </div>

          {Object.entries(skinfoldSites).map(([key, value]) => (
            <label key={key} className="text-xs text-slate-400">
              {getSiteLabel(locale, key as Parameters<typeof getSiteLabel>[1])}
              <input
                className={inputClassName}
                type="number"
                step="0.1"
                value={value}
                onChange={(event) =>
                  setSkinfoldSites((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
              />
            </label>
          ))}

          <div className="md:col-span-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {m.nextSkinfoldMeasurement}: #{nextSkinfoldNumber}
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-600 bg-cyan-900/30 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-900/45"
            >
              <PlusCircle className="h-4 w-4" />
              {m.addSkinfold}
            </button>
          </div>
        </form>
      ) : (
        <form
          className="grid gap-3 md:grid-cols-3"
          onSubmit={handleAddCircumference}
        >
          <label className="text-xs text-slate-400">
            {m.date}
            <input
              className={inputClassName}
              type="date"
              value={circDate}
              onChange={(event) => setCircDate(event.target.value)}
            />
          </label>

          {Object.entries(circSites).map(([key, value]) => (
            <label key={key} className="text-xs text-slate-400">
              {getSiteLabel(locale, key as Parameters<typeof getSiteLabel>[1])}
              <input
                className={inputClassName}
                type="number"
                step="0.1"
                value={value}
                onChange={(event) =>
                  setCircSites((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
              />
            </label>
          ))}

          <div className="md:col-span-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {m.nextCircumferenceMeasurement}: #{nextCircNumber}
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-600 bg-cyan-900/30 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-900/45"
            >
              <PlusCircle className="h-4 w-4" />
              {m.addCircumference}
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
        <p>{m.biaMdNote}</p>
        <span className="inline-flex items-center gap-1 text-slate-300">
          <Download className="h-3.5 w-3.5" />
          {m.exportReady}
        </span>
      </div>

      {message ? <p className="mt-3 text-sm text-cyan-200">{message}</p> : null}

      <div className="mt-5 rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">
          {m.deleteMeasurements}
        </h3>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              BIA
            </p>
            <div className="space-y-2">
              {healthData.bia.measurements.map((measurement) => {
                const groupKey =
                  measurement.date ?? measurement.dateLabel ?? "no-date";
                return (
                  <div
                    key={`bia-delete-${measurement.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2"
                  >
                    <span className="text-xs text-slate-300">
                      {measurement.date ?? measurement.dateLabel ?? m.noDate} -{" "}
                      {measurement.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteBia(measurement.id);
                          setMessage(m.messageBiaDeleted);
                        }}
                        className="rounded-md border border-rose-700/60 bg-rose-900/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/50"
                      >
                        {m.deleteSingle}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteBiaGroup(groupKey);
                          setMessage(m.messageBiaGroupDeleted);
                        }}
                        className="rounded-md border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900/45"
                      >
                        {m.deleteGroup}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              {m.skinfolds}
            </p>
            <div className="space-y-2">
              {healthData.skinfolds.measurements.map((measurement) => (
                <div
                  key={`skinfold-delete-${measurement.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2"
                >
                  <span className="text-xs text-slate-300">
                    {measurement.date ?? m.noDate} - #
                    {measurement.measurementNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteSkinfold(measurement.id);
                        setMessage(m.messageSkinfoldDeleted);
                      }}
                      className="rounded-md border border-rose-700/60 bg-rose-900/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/50"
                    >
                      {m.deleteSingle}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteSkinfoldGroup(measurement.date ?? "");
                        setMessage(m.messageSkinfoldGroupDeleted);
                      }}
                      className="rounded-md border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900/45"
                    >
                      {m.deleteGroup}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              {m.circumferences}
            </p>
            <div className="space-y-2">
              {healthData.circumferences.measurements.map((measurement) => (
                <div
                  key={`circ-delete-${measurement.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2"
                >
                  <span className="text-xs text-slate-300">
                    {measurement.date ?? m.noDate} - #
                    {measurement.measurementNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteCircumference(measurement.id);
                        setMessage(m.messageCircDeleted);
                      }}
                      className="rounded-md border border-rose-700/60 bg-rose-900/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/50"
                    >
                      {m.deleteSingle}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteCircumferenceGroup(measurement.date ?? "");
                        setMessage(m.messageCircGroupDeleted);
                      }}
                      className="rounded-md border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900/45"
                    >
                      {m.deleteGroup}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};
