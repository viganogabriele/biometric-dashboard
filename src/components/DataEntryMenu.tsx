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
  onClose,
}: DataEntryMenuProps) => {
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
      setMessage("Compila data e peso prima di salvare le pliche.");
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
      setMessage(
        "Inserisci tutte le pliche con valori numerici maggiori di zero.",
      );
      return;
    }

    const weight = Number(skinfoldWeight);
    const age = calculateAgeFromBirthDate(
      healthData.profile.birthDate,
      skinfoldDate,
    );

    if (!Number.isFinite(weight) || weight <= 0) {
      setMessage("Inserisci un peso valido maggiore di zero.");
      return;
    }

    if (age === null) {
      setMessage(
        "Imposta una data di nascita valida nel profilo: l'eta viene calcolata in base alla data della misurazione.",
      );
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
      setMessage("Errore nel calcolo pliche. Controlla i dati inseriti.");
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
    setMessage("Nuova misurazione pliche aggiunta con successo.");
  };

  const handleAddCircumference = (event: React.FormEvent) => {
    event.preventDefault();
    if (!circDate) {
      setMessage("Compila la data prima di salvare le circonferenze.");
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
      setMessage(
        "Inserisci tutte le circonferenze con valori numerici maggiori di zero.",
      );
      return;
    }

    if (parsedSites.vita <= parsedSites.collo) {
      setMessage(
        "Per il calcolo BF da circonferenze: la vita deve essere maggiore del collo.",
      );
      return;
    }

    try {
      onAddCircumference({
        date: circDate,
        sitesCm: parsedSites,
      });
    } catch {
      setMessage(
        "Errore nel calcolo circonferenze. Controlla i dati inseriti.",
      );
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
    setMessage("Nuova misurazione circonferenze aggiunta con successo.");
  };

  const handleExportJson = () => {
    const payload = buildAnthropometryExport(healthData);
    downloadTextFile(
      payload.json,
      `riepilogo-antropometria-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json;charset=utf-8",
    );
    setMessage("File JSON esportato.");
  };

  const handleExportCsv = () => {
    const payload = buildAnthropometryExport(healthData);
    downloadTextFile(
      payload.csv,
      `riepilogo-antropometria-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );
    setMessage("File CSV esportato.");
  };

  const handleExportNutritionistPdf = async () => {
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const rows = buildNutritionReportRows(healthData);
      const righePliche = rows.filter((row) => row.categoria === "Pliche");
      const righeCirconferenze = rows.filter(
        (row) => row.categoria === "Circonferenze",
      );
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      doc.setFontSize(16);
      doc.text("Report Nutrizionista", 40, 44);
      doc.setFontSize(10);
      doc.text(`Paziente: ${healthData.profile.patientName}`, 40, 62);
      doc.text(`Generato il: ${new Date().toLocaleString("it-IT")}`, 40, 76);
      doc.text("Nota: BIA gestita separatamente da file .md", 40, 90);

      autoTable(doc, {
        startY: 108,
        head: [
          [
            "Data",
            "#",
            "Peso (kg)",
            "BF%",
            "Media pliche (mm)",
            "Tricipite",
            "Addome",
            "Soprailiaca",
            "Sottoscapolare",
            "Ascellare",
            "Pettorale",
            "Coscia",
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
        "Misure circonferenze",
        40,
        ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
          ?.finalY ?? 108) + 24,
      );

      autoTable(doc, {
        startY:
          ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
            ?.finalY ?? 108) + 32,
        head: [
          [
            "Data",
            "#",
            "BF%",
            "Braccio",
            "Torace",
            "Vita",
            "Fianchi",
            "Coscia",
            "Polpaccio",
            "Collo",
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
        `report-nutrizionista-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      setMessage("Report nutrizionista PDF esportato.");
    } catch {
      setMessage("Errore export PDF. Riprova tra qualche secondo.");
    }
  };

  const handleExportNutritionistExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = buildNutritionReportRows(healthData);
      const workbook = XLSX.utils.book_new();
      const righePliche = rows
        .filter((row) => row.categoria === "Pliche")
        .map((row) => ({
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
        }));

      const righeCirconferenze = rows
        .filter((row) => row.categoria === "Circonferenze")
        .map((row) => ({
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
        }));

      const summarySheet = XLSX.utils.json_to_sheet([
        {
          paziente: healthData.profile.patientName,
          eta_anni: healthData.profile.ageYears,
          altezza_cm: healthData.profile.heightCm,
          generato_il: new Date().toISOString(),
          nota: "BIA gestita separatamente da input .md",
        },
      ]);

      const plicheSheet = XLSX.utils.json_to_sheet(righePliche);
      const circonferenzeSheet = XLSX.utils.json_to_sheet(righeCirconferenze);

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Riepilogo");
      XLSX.utils.book_append_sheet(workbook, plicheSheet, "Pliche");
      XLSX.utils.book_append_sheet(
        workbook,
        circonferenzeSheet,
        "Circonferenze",
      );
      XLSX.writeFile(
        workbook,
        `report-nutrizionista-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      setMessage("Report nutrizionista Excel esportato.");
    } catch {
      setMessage("Errore export Excel. Riprova tra qualche secondo.");
    }
  };

  return (
    <Panel
      title="Menu Inserimento Dati"
      subtitle="Aggiungi rapidamente pliche e circonferenze, poi esporta un riepilogo comodo per la nutrizionista."
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
              Chiudi
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleExportNutritionistPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-900/45"
          >
            <FileDown className="h-4 w-4" />
            Report PDF
          </button>
          <button
            type="button"
            onClick={handleExportNutritionistExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-900/45"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Report Excel
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/70"
          >
            <FileText className="h-4 w-4" />
            Esporta JSON
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700/70"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Esporta CSV
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
          Pliche
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
          Circonferenze
        </button>
      </div>

      {mode === "skinfolds" ? (
        <form
          className="grid gap-3 md:grid-cols-3"
          onSubmit={handleAddSkinfold}
        >
          <label className="text-xs text-slate-400">
            Data
            <input
              className={inputClassName}
              type="date"
              value={skinfoldDate}
              onChange={(event) => setSkinfoldDate(event.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            Peso (kg)
            <input
              className={inputClassName}
              type="number"
              step="0.1"
              value={skinfoldWeight}
              onChange={(event) => setSkinfoldWeight(event.target.value)}
            />
          </label>

          <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
            Eta formula: calcolata automaticamente da data nascita
            {healthData.profile.birthDate
              ? ` (${healthData.profile.birthDate})`
              : " del profilo"}
          </div>

          {Object.entries(skinfoldSites).map(([key, value]) => (
            <label key={key} className="text-xs text-slate-400">
              {key}
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
              Prossima misurazione pliche: #{nextSkinfoldNumber}
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-600 bg-cyan-900/30 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-900/45"
            >
              <PlusCircle className="h-4 w-4" />
              Aggiungi pliche
            </button>
          </div>
        </form>
      ) : (
        <form
          className="grid gap-3 md:grid-cols-3"
          onSubmit={handleAddCircumference}
        >
          <label className="text-xs text-slate-400">
            Data
            <input
              className={inputClassName}
              type="date"
              value={circDate}
              onChange={(event) => setCircDate(event.target.value)}
            />
          </label>

          {Object.entries(circSites).map(([key, value]) => (
            <label key={key} className="text-xs text-slate-400">
              {key}
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
              Prossima misurazione circonferenze: #{nextCircNumber}
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-600 bg-cyan-900/30 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-900/45"
            >
              <PlusCircle className="h-4 w-4" />
              Aggiungi circonferenze
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
        <p>
          Per BIA: inviami il file .md come concordato e aggiornero io i dati
          nella dashboard.
        </p>
        <span className="inline-flex items-center gap-1 text-slate-300">
          <Download className="h-3.5 w-3.5" />
          Export pronto
        </span>
      </div>

      {message ? <p className="mt-3 text-sm text-cyan-200">{message}</p> : null}

      <div className="mt-5 rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">
          Elimina misurazioni
        </h3>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              BIA
            </p>
            <div className="space-y-2">
              {healthData.bia.measurements.map((measurement) => {
                const groupKey =
                  measurement.date ?? measurement.dateLabel ?? "senza-data";
                return (
                  <div
                    key={`bia-delete-${measurement.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2"
                  >
                    <span className="text-xs text-slate-300">
                      {measurement.date ??
                        measurement.dateLabel ??
                        "Senza data"}{" "}
                      - {measurement.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteBia(measurement.id);
                          setMessage("Misurazione BIA eliminata.");
                        }}
                        className="rounded-md border border-rose-700/60 bg-rose-900/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/50"
                      >
                        Elimina singolo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteBiaGroup(groupKey);
                          setMessage("Blocco BIA eliminato.");
                        }}
                        className="rounded-md border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900/45"
                      >
                        Elimina blocco
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              Pliche
            </p>
            <div className="space-y-2">
              {healthData.skinfolds.measurements.map((measurement) => (
                <div
                  key={`skinfold-delete-${measurement.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2"
                >
                  <span className="text-xs text-slate-300">
                    {measurement.date ?? "Senza data"} - #
                    {measurement.measurementNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteSkinfold(measurement.id);
                        setMessage("Misurazione pliche eliminata.");
                      }}
                      className="rounded-md border border-rose-700/60 bg-rose-900/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/50"
                    >
                      Elimina singolo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteSkinfoldGroup(measurement.date ?? "");
                        setMessage("Blocco pliche eliminato.");
                      }}
                      className="rounded-md border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900/45"
                    >
                      Elimina blocco
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              Circonferenze
            </p>
            <div className="space-y-2">
              {healthData.circumferences.measurements.map((measurement) => (
                <div
                  key={`circ-delete-${measurement.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2"
                >
                  <span className="text-xs text-slate-300">
                    {measurement.date ?? "Senza data"} - #
                    {measurement.measurementNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteCircumference(measurement.id);
                        setMessage("Misurazione circonferenze eliminata.");
                      }}
                      className="rounded-md border border-rose-700/60 bg-rose-900/30 px-2 py-1 text-xs text-rose-200 hover:bg-rose-900/50"
                    >
                      Elimina singolo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteCircumferenceGroup(measurement.date ?? "");
                        setMessage("Blocco circonferenze eliminato.");
                      }}
                      className="rounded-md border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-xs text-amber-200 hover:bg-amber-900/45"
                    >
                      Elimina blocco
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
