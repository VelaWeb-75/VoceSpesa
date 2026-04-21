# VoceSpesa — Direttiva App Expense Tracker

## Obiettivo
App iOS nativa per tracciamento spese giornaliere tramite input vocale, con dashboard interattiva, report settimanali automatici e modello freemium.

## Stack Tecnologico
- **Framework**: React Native + Expo SDK 54
- **Voice**: expo-speech-recognition (nativo iOS SFSpeechRecognizer)
- **Database**: expo-sqlite (local-first, nessun server)
- **Charts**: react-native-gifted-charts
- **Navigation**: expo-router (file-based, 3 tabs)
- **State**: React Context + useReducer
- **Fonts**: Inter (Google Fonts via @expo-google-fonts/inter)

## Struttura App
```
frontend/
├── app/                    # Expo Router
│   ├── _layout.tsx         # Root layout (font, context provider)
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Tab bar (Home, Dashboard, Report)
│   │   ├── index.tsx       # Home — Input vocale + spese recenti
│   │   ├── dashboard.tsx   # Dashboard — Pie chart + filtri
│   │   └── reports.tsx     # Report — Lista report settimanali
├── components/
│   ├── VoiceInput.tsx      # Pulsante vocale con animazioni
│   ├── ExpenseCard.tsx     # Card singola spesa
│   ├── CategoryPicker.tsx  # Selettore categorie suggerite
│   ├── PieChartView.tsx    # Grafico a torta interattivo
│   ├── FilterBar.tsx       # Filtri temporali
│   ├── WeeklyReportCard.tsx# Card report settimanale
│   └── PaywallModal.tsx    # Modal upgrade freemium
├── lib/
│   ├── database.ts         # SQLite setup + queries CRUD
│   ├── categories.ts       # 10 categorie con keywords italiane
│   ├── classifier.ts       # NLP locale: parsing importo + classificazione
│   ├── reportGenerator.ts  # Generazione report settimanali
│   └── subscription.ts     # Logica freemium + paywall
├── contexts/
│   └── ExpenseContext.tsx   # State globale
└── constants/
    └── theme.ts            # Design system dark mode
```

## Flow Principale
1. Utente tocca il microfono
2. Parla (es. "Ho speso 35 euro dal meccanico")
3. App trascrive con SFSpeechRecognizer
4. Classifier estrae: importo=35, descrizione="Meccanico", categoria suggerita=Trasporti
5. Utente conferma o modifica nel modal
6. Spesa salvata in SQLite
7. Dashboard e report aggiornati automaticamente

## Modello Freemium
- **Free**: 30 spese/mese, 5+1 categorie, solo filtro mensile, ads
- **Pro (€3.99/mese)**: illimitato, AI, export, backup, no ads
- **Business (€9.99/mese)**: team, OCR, report fiscali

## Comandi
- **Dev**: `cd frontend && npx expo start`
- **iOS**: `cd frontend && npx expo run:ios`
- **Web preview**: `cd frontend && npx expo start --web`

## Note
- Il classificatore usa regex + dizionario keywords italiano (nessuna API esterna in Free)
- Su web/Expo Go il voice input usa fallback con input manuale
- I report vengono rigenerati al caricamento della schermata Reports
- Il database è local-first, nessun backend necessario
