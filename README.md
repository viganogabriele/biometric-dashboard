# MyHealth Hub

Personal dashboard to track BIA, skinfold, and circumference measurements with charts and exportable reports.

## Project Origin

This project is **vibe-coded**: it comes from a real personal need to have a practical tool for reading my health data over time, and it was also built from my passion for health metrics and software development.

## What It Does

- Visualizes BIA, skinfold, and circumference trends
- Supports manual data entry
- Exports reports in JSON, CSV, PDF, and Excel
- Supports IT/EN language switching in the UI
- Stores data locally (localStorage)

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Recharts
- jsPDF + AutoTable
- SheetJS (xlsx)

## Local Development

Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Important Notes

- Health data can be sensitive: use this project carefully.
- This software **does not replace** professional medical advice.

## License

This project is released under the MIT License.

In short: you can use, copy, modify, redistribute, and use it commercially.
See [LICENSE](LICENSE).
