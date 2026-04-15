import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "it" | "en";

const LANGUAGE_STORAGE_KEY = "myhealthhub.language";

const readStoredLocale = (): Locale => {
  if (typeof window === "undefined") {
    return "it";
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "en" ? "en" : "it";
};

const MESSAGES = {
  it: {
    languageLabel: "Lingua",
    languageItalian: "Italiano",
    languageEnglish: "Inglese",
    setupTitle: "Configurazione iniziale",
    setupSubtitle: "Inserisci una volta sola i dati base del profilo.",
    patientName: "Nome paziente",
    birthDate: "Data di nascita",
    sex: "Sesso",
    male: "Maschio",
    female: "Femmina",
    heightCm: "Altezza (cm)",
    saveSetup: "Salva configurazione",
    setupNameError: "Inserisci un nome paziente valido.",
    setupBirthDateError: "Inserisci la data di nascita.",
    setupBirthDateInvalidError: "Data di nascita non valida.",
    setupHeightError: "Inserisci un'altezza valida (cm).",
    sourcesPrefix: "Fonti",
    patientPrefix: "Paziente",
    initialSetupButton: "Configurazione iniziale",
    resetMemoryButton: "Reset memoria",
    addSkinfolds: "Inserisci pliche",
    addCircumferences: "Inserisci circonferenze",
    hideDataManagement: "Nascondi gestione dati",
    openDataManagement: "Apri gestione dati",
    latestResults: "Ultimi risultati",
    latestResultsSubtitle:
      "Date asincrone gestite automaticamente: ogni card mostra il dato piu recente per la sua categoria.",
    bodyFat: "Massa grassa",
    weight: "Peso",
    skinfolds: "Pliche",
    averageSkinfold: "Media pliche",
    bodyDensity: "Densita corporea",
    circumferences: "Circonferenze",
    waist: "Vita",
    neck: "Collo",
    directComparison: "Confronto diretto",
    directComparisonSubtitle:
      "BIA vs Pliche nello stesso punto: confronto rapido dei valori attuali.",
    biaBodyFat: "Massa grassa BIA",
    skinfoldBodyFat: "Massa grassa Pliche",
    differenceBiaSkinfold: "Differenza (BIA - Pliche)",
    biaSubtitle:
      "Grafico andamento + dati singoli misurazione per misurazione.",
    primaryCharts: "Grafici principali",
    singleData: "Dati singoli",
    date: "Data",
    measurement: "Misura #",
    bodyFatPct: "Massa grassa %",
    skinfoldsSubtitle: "Grafico andamento + dati singoli delle pliche.",
    circumferencesSubtitle:
      "Grafico andamento + dati singoli delle misure corporee.",
    dataEntryTitle: "Menu inserimento dati",
    dataEntrySubtitle:
      "Aggiungi rapidamente pliche e circonferenze, poi esporta un riepilogo comodo per la nutrizionista.",
    close: "Chiudi",
    reportPdf: "Report PDF",
    reportExcel: "Report Excel",
    exportJson: "Esporta JSON",
    exportCsv: "Esporta CSV",
    ageFormula: "Eta formula: calcolata automaticamente da data nascita",
    profileSuffix: "del profilo",
    nextSkinfoldMeasurement: "Prossima misurazione pliche",
    addSkinfold: "Aggiungi pliche",
    nextCircumferenceMeasurement: "Prossima misurazione circonferenze",
    addCircumference: "Aggiungi circonferenze",
    biaMdNote:
      "Per BIA: inviami il file .md come concordato e aggiornero io i dati nella dashboard.",
    exportReady: "Export pronto",
    deleteMeasurements: "Elimina misurazioni",
    noDate: "Senza data",
    deleteSingle: "Elimina singolo",
    deleteGroup: "Elimina blocco",
    messageFillDateWeight: "Compila data e peso prima di salvare le pliche.",
    messageInvalidSkinfolds:
      "Inserisci tutte le pliche con valori numerici maggiori di zero.",
    messageInvalidWeight: "Inserisci un peso valido maggiore di zero.",
    messageInvalidBirthDateProfile:
      "Imposta una data di nascita valida nel profilo: l'eta viene calcolata in base alla data della misurazione.",
    messageSkinfoldCalcError:
      "Errore nel calcolo pliche. Controlla i dati inseriti.",
    messageSkinfoldAdded: "Nuova misurazione pliche aggiunta con successo.",
    messageFillDateCirc: "Compila la data prima di salvare le circonferenze.",
    messageInvalidCirc:
      "Inserisci tutte le circonferenze con valori numerici maggiori di zero.",
    messageWaistNeck:
      "Per il calcolo BF da circonferenze: la vita deve essere maggiore del collo.",
    messageCircCalcError:
      "Errore nel calcolo circonferenze. Controlla i dati inseriti.",
    messageCircAdded: "Nuova misurazione circonferenze aggiunta con successo.",
    messageJsonExported: "File JSON esportato.",
    messageCsvExported: "File CSV esportato.",
    messagePdfExported: "Report nutrizionista PDF esportato.",
    messagePdfError: "Errore export PDF. Riprova tra qualche secondo.",
    messageExcelExported: "Report nutrizionista Excel esportato.",
    messageExcelError: "Errore export Excel. Riprova tra qualche secondo.",
    messageBiaDeleted: "Misurazione BIA eliminata.",
    messageBiaGroupDeleted: "Blocco BIA eliminato.",
    messageSkinfoldDeleted: "Misurazione pliche eliminata.",
    messageSkinfoldGroupDeleted: "Blocco pliche eliminato.",
    messageCircDeleted: "Misurazione circonferenze eliminata.",
    messageCircGroupDeleted: "Blocco circonferenze eliminato.",
    filePrefixAnthropometrySummary: "riepilogo-antropometria",
    filePrefixNutritionistReport: "report-nutrizionista",
    pdfTitle: "Report nutrizionista",
    generatedOn: "Generato il",
    noteLabel: "Nota",
    pdfSkinfoldTableTitle: "Misure pliche",
    pdfCircTableTitle: "Misure circonferenze",
    summarySheet: "Riepilogo",
    skinfoldSheet: "Pliche",
    circumferenceSheet: "Circonferenze",
    reportCategory: "Categoria",
    reportDate: "Data",
    reportMeasurement: "Misurazione",
    reportMetric: "Metrica",
    reportValue: "Valore",
    reportDelta: "Delta vs precedente",
    nutritionModeTitle: "Modalita nutrizionista",
    nutritionModeSubtitle:
      "Vista compatta ottimizzata per stampa ed export PDF.",
    printSavePdf: "Stampa / Salva PDF",
    formulaSkinDensity: "Densita da pliche",
    formulaBodyFatDensity: "Massa grassa da densita",
    formulaBodyFatCirc: "Massa grassa da circonferenze",
    deltaNA: "Delta N/D",
    deltaPrefix: "Delta",
    renderErrorBadge: "Errore visualizzazione",
    renderErrorTitle: "La dashboard ha incontrato un problema",
    renderErrorDescription:
      "Ho bloccato il crash per evitare la schermata vuota. Puoi ripristinare la visualizzazione con il pulsante sotto.",
    errorDetail: "Dettaglio",
    recoverReload: "Ripristina e ricarica",
    dateUnavailable: "Data non disponibile",
    skinfoldAvgLegend: "Media pliche (mm)",
    bodyFatLegend: "Massa grassa (%)",
    bodyFatFromSkinfolds: "Massa grassa da pliche",
    bodyFatFromCircumferences: "Massa grassa da circonferenze",
  },
  en: {
    languageLabel: "Language",
    languageItalian: "Italian",
    languageEnglish: "English",
    setupTitle: "Initial setup",
    setupSubtitle: "Enter the base profile data only once.",
    patientName: "Patient name",
    birthDate: "Birth date",
    sex: "Sex",
    male: "Male",
    female: "Female",
    heightCm: "Height (cm)",
    saveSetup: "Save setup",
    setupNameError: "Enter a valid patient name.",
    setupBirthDateError: "Enter birth date.",
    setupBirthDateInvalidError: "Invalid birth date.",
    setupHeightError: "Enter a valid height (cm).",
    sourcesPrefix: "Sources",
    patientPrefix: "Patient",
    initialSetupButton: "Initial setup",
    resetMemoryButton: "Reset memory",
    addSkinfolds: "Add skinfolds",
    addCircumferences: "Add circumferences",
    hideDataManagement: "Hide data management",
    openDataManagement: "Open data management",
    latestResults: "Latest results",
    latestResultsSubtitle:
      "Asynchronous dates are handled automatically: each card shows the latest value for its category.",
    bodyFat: "Body fat",
    weight: "Weight",
    skinfolds: "Skinfolds",
    averageSkinfold: "Average skinfold",
    bodyDensity: "Body density",
    circumferences: "Circumferences",
    waist: "Waist",
    neck: "Neck",
    directComparison: "Direct comparison",
    directComparisonSubtitle:
      "BIA vs Skinfolds at the same point: quick comparison of current values.",
    biaBodyFat: "BIA body fat",
    skinfoldBodyFat: "Skinfold body fat",
    differenceBiaSkinfold: "Difference (BIA - Skinfolds)",
    biaSubtitle: "Trend chart + single values for each measurement.",
    primaryCharts: "Main charts",
    singleData: "Single data",
    date: "Date",
    measurement: "Measure #",
    bodyFatPct: "Body fat %",
    skinfoldsSubtitle: "Trend chart + single skinfold values.",
    circumferencesSubtitle: "Trend chart + single body circumference values.",
    dataEntryTitle: "Data entry menu",
    dataEntrySubtitle:
      "Quickly add skinfolds and circumferences, then export a practical report for the nutritionist.",
    close: "Close",
    reportPdf: "PDF report",
    reportExcel: "Excel report",
    exportJson: "Export JSON",
    exportCsv: "Export CSV",
    ageFormula: "Formula age: automatically calculated from birth date",
    profileSuffix: "from profile",
    nextSkinfoldMeasurement: "Next skinfold measurement",
    addSkinfold: "Add skinfolds",
    nextCircumferenceMeasurement: "Next circumference measurement",
    addCircumference: "Add circumferences",
    biaMdNote:
      "For BIA: send me the .md file as agreed and I will update the dashboard data.",
    exportReady: "Export ready",
    deleteMeasurements: "Delete measurements",
    noDate: "No date",
    deleteSingle: "Delete single",
    deleteGroup: "Delete block",
    messageFillDateWeight: "Fill date and weight before saving skinfolds.",
    messageInvalidSkinfolds:
      "Enter all skinfolds with numeric values greater than zero.",
    messageInvalidWeight: "Enter a valid weight greater than zero.",
    messageInvalidBirthDateProfile:
      "Set a valid birth date in profile: age is calculated from measurement date.",
    messageSkinfoldCalcError: "Skinfold calculation error. Check entered data.",
    messageSkinfoldAdded: "New skinfold measurement added successfully.",
    messageFillDateCirc: "Fill the date before saving circumferences.",
    messageInvalidCirc:
      "Enter all circumferences with numeric values greater than zero.",
    messageWaistNeck:
      "For body fat from circumferences: waist must be greater than neck.",
    messageCircCalcError:
      "Circumference calculation error. Check entered data.",
    messageCircAdded: "New circumference measurement added successfully.",
    messageJsonExported: "JSON file exported.",
    messageCsvExported: "CSV file exported.",
    messagePdfExported: "Nutritionist PDF report exported.",
    messagePdfError: "PDF export error. Try again in a few seconds.",
    messageExcelExported: "Nutritionist Excel report exported.",
    messageExcelError: "Excel export error. Try again in a few seconds.",
    messageBiaDeleted: "BIA measurement deleted.",
    messageBiaGroupDeleted: "BIA block deleted.",
    messageSkinfoldDeleted: "Skinfold measurement deleted.",
    messageSkinfoldGroupDeleted: "Skinfold block deleted.",
    messageCircDeleted: "Circumference measurement deleted.",
    messageCircGroupDeleted: "Circumference block deleted.",
    filePrefixAnthropometrySummary: "anthropometry-summary",
    filePrefixNutritionistReport: "nutritionist-report",
    pdfTitle: "Nutritionist report",
    generatedOn: "Generated on",
    noteLabel: "Note",
    pdfSkinfoldTableTitle: "Skinfold measurements",
    pdfCircTableTitle: "Circumference measurements",
    summarySheet: "Summary",
    skinfoldSheet: "Skinfolds",
    circumferenceSheet: "Circumferences",
    reportCategory: "Category",
    reportDate: "Date",
    reportMeasurement: "Measurement",
    reportMetric: "Metric",
    reportValue: "Value",
    reportDelta: "Delta vs previous",
    nutritionModeTitle: "Nutritionist mode",
    nutritionModeSubtitle: "Compact view optimized for print and PDF export.",
    printSavePdf: "Print / Save PDF",
    formulaSkinDensity: "Skinfold density",
    formulaBodyFatDensity: "Body fat from density",
    formulaBodyFatCirc: "Body fat from circumferences",
    deltaNA: "Delta N/A",
    deltaPrefix: "Delta",
    renderErrorBadge: "Rendering error",
    renderErrorTitle: "The dashboard encountered a problem",
    renderErrorDescription:
      "I blocked the crash to avoid a blank screen. You can restore the view with the button below.",
    errorDetail: "Detail",
    recoverReload: "Recover and reload",
    dateUnavailable: "Date unavailable",
    skinfoldAvgLegend: "Average skinfold (mm)",
    bodyFatLegend: "Body fat (%)",
    bodyFatFromSkinfolds: "Body fat from skinfolds",
    bodyFatFromCircumferences: "Body fat from circumferences",
  },
} as const;

type MessageSet = (typeof MESSAGES)[Locale];

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: MessageSet;
  numberLocale: string;
  dateLocale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors and keep runtime language in memory.
      }
    }
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      m: MESSAGES[locale],
      numberLocale: locale === "it" ? "it-IT" : "en-US",
      dateLocale: locale === "it" ? "it-IT" : "en-GB",
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
};

export const getSiteLabel = (
  locale: Locale,
  site:
    | "tricipite"
    | "addome"
    | "soprailiaca"
    | "sottoscapolare"
    | "ascellare"
    | "pettorale"
    | "coscia"
    | "braccio"
    | "torace"
    | "vita"
    | "fianchi"
    | "polpaccio"
    | "collo",
): string => {
  const labels: Record<Locale, Record<string, string>> = {
    it: {
      tricipite: "Tricipite",
      addome: "Addome",
      soprailiaca: "Soprailiaca",
      sottoscapolare: "Sottoscapolare",
      ascellare: "Ascellare",
      pettorale: "Pettorale",
      coscia: "Coscia",
      braccio: "Braccio",
      torace: "Torace",
      vita: "Vita",
      fianchi: "Fianchi",
      polpaccio: "Polpaccio",
      collo: "Collo",
    },
    en: {
      tricipite: "Triceps",
      addome: "Abdomen",
      soprailiaca: "Suprailiac",
      sottoscapolare: "Subscapular",
      ascellare: "Axillary",
      pettorale: "Pectoral",
      coscia: "Thigh",
      braccio: "Arm",
      torace: "Chest",
      vita: "Waist",
      fianchi: "Hips",
      polpaccio: "Calf",
      collo: "Neck",
    },
  };

  return labels[locale][site] ?? site;
};
