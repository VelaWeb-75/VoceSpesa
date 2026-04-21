/**
 * Classificatore di spese basato su keywords.
 * Analizza il testo trascritto dalla voce per estrarre importo, descrizione
 * e suggerire la categoria più appropriata.
 */
import { DEFAULT_CATEGORIES, Category } from './categories';

// Risultato del parsing vocale
export interface ParsedExpense {
  amount: number | null;
  description: string;
  rawText: string;
}

// Suggerimento categoria con confidence
export interface CategorySuggestion {
  category: Category;
  confidence: number; // 0-1
  matchedKeywords: string[];
}

/**
 * Estrae l'importo dal testo trascritto.
 * Gestisce formati italiani come "35 euro", "€35", "35,50", "trentacinque euro"
 */
export function extractAmount(text: string): number | null {
  const lowerText = text.toLowerCase().trim();

  // Mappa numeri in lettere → cifre (italiano)
  const wordToNumber: Record<string, number> = {
    'zero': 0, 'uno': 1, 'una': 1, 'due': 2, 'tre': 3, 'quattro': 4,
    'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9,
    'dieci': 10, 'undici': 11, 'dodici': 12, 'tredici': 13, 'quattordici': 14,
    'quindici': 15, 'sedici': 16, 'diciassette': 17, 'diciotto': 18, 'diciannove': 19,
    'venti': 20, 'ventuno': 21, 'ventidue': 22, 'ventitré': 23, 'ventitre': 23,
    'ventiquattro': 24, 'venticinque': 25, 'ventisei': 26, 'ventisette': 27,
    'ventotto': 28, 'ventinove': 29,
    'trenta': 30, 'trentuno': 31, 'trentadue': 32, 'trentatré': 33, 'trentatre': 33,
    'trentaquattro': 34, 'trentacinque': 35, 'trentasei': 36, 'trentasette': 37,
    'trentotto': 38, 'trentanove': 39,
    'quaranta': 40, 'cinquanta': 50, 'sessanta': 60, 'settanta': 70,
    'ottanta': 80, 'novanta': 90, 'cento': 100,
    'duecento': 200, 'trecento': 300, 'quattrocento': 400, 'cinquecento': 500,
    'mille': 1000, 'duemila': 2000,
  };

  // Prova prima con numeri in lettere
  for (const [word, num] of Object.entries(wordToNumber)) {
    if (lowerText.includes(word)) {
      // Controlla se c'è "e cinquanta" (centesimi)
      const centMatch = lowerText.match(new RegExp(`${word}\\s+e\\s+(\\w+)`));
      if (centMatch) {
        const centWord = centMatch[1];
        const cents = wordToNumber[centWord];
        if (cents !== undefined && cents < 100) {
          return num + cents / 100;
        }
      }
      return num;
    }
  }

  // Pattern per numeri con decimali: "35,50", "35.50", "35,5"
  const decimalMatch = lowerText.match(/(\d+)[,.](\d{1,2})/);
  if (decimalMatch) {
    return parseFloat(`${decimalMatch[1]}.${decimalMatch[2]}`);
  }

  // Pattern per numeri interi con "euro": "35 euro", "€35", "euro 35"
  const euroPatterns = [
    /(\d+)\s*(?:euro|€)/,
    /(?:euro|€)\s*(\d+)/,
    /(\d+)/,
  ];

  for (const pattern of euroPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }

  return null;
}

/**
 * Estrae la descrizione dal testo, rimuovendo l'importo e parole comuni
 */
export function extractDescription(text: string): string {
  let desc = text.toLowerCase().trim();

  // Rimuovi importi numerici e simboli euro
  desc = desc.replace(/\d+[,.]?\d*\s*(?:euro|€)?/g, '');
  desc = desc.replace(/(?:euro|€)\s*\d+[,.]?\d*/g, '');

  // Rimuovi parole introduttive comuni
  const fillerWords = [
    'ho speso', 'ho pagato', 'speso', 'pagato', 'costato', 'costa',
    'per', 'dal', 'dalla', 'al', 'alla', 'di', 'del', 'della',
    'un', 'una', 'il', 'la', 'lo', 'gli', 'le', 'dei', 'delle',
    'euro', '€', 'circa', 'più o meno', 'quasi',
  ];

  for (const word of fillerWords) {
    // Rimuovi solo se all'inizio o come parola isolata
    desc = desc.replace(new RegExp(`^${word}\\s+`, 'g'), '');
  }

  // Pulisci spazi multipli e trim
  desc = desc.replace(/\s+/g, ' ').trim();

  // Capitalizza prima lettera
  if (desc.length > 0) {
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  return desc || 'Spesa generica';
}

/**
 * Classifica il testo in una categoria basandosi su keywords.
 * Restituisce le top 3 categorie suggerite ordinate per confidence.
 */
export function classifyExpense(text: string): CategorySuggestion[] {
  const lowerText = text.toLowerCase().trim();
  const words = lowerText.split(/\s+/);
  const suggestions: CategorySuggestion[] = [];

  for (const category of DEFAULT_CATEGORIES) {
    if (category.keywords.length === 0) continue; // Skip "Altro"

    const matchedKeywords: string[] = [];
    let score = 0;

    for (const keyword of category.keywords) {
      // Match esatto parola singola
      if (keyword.includes(' ')) {
        // Multi-word keyword: cerca nel testo completo
        if (lowerText.includes(keyword)) {
          matchedKeywords.push(keyword);
          score += 2; // Bonus per match multi-parola
        }
      } else {
        // Single word: cerca tra le parole
        if (words.includes(keyword) || lowerText.includes(keyword)) {
          matchedKeywords.push(keyword);
          score += 1;
        }
      }
    }

    if (score > 0) {
      // Normalizza il confidence tra 0 e 1
      // Max confidence con 3+ keyword matches
      const confidence = Math.min(score / 3, 1);
      suggestions.push({
        category,
        confidence,
        matchedKeywords,
      });
    }
  }

  // Ordina per confidence decrescente
  suggestions.sort((a, b) => b.confidence - a.confidence);

  // Se non ci sono suggerimenti, aggiungi "Altro" come fallback
  if (suggestions.length === 0) {
    const otherCategory = DEFAULT_CATEGORIES.find((c) => c.id === 10);
    if (otherCategory) {
      suggestions.push({
        category: otherCategory,
        confidence: 0.1,
        matchedKeywords: [],
      });
    }
  }

  // Restituisci al massimo 3 suggerimenti
  return suggestions.slice(0, 3);
}

/**
 * Parsing completo del testo vocale.
 * Estrae importo, descrizione e classifica la spesa.
 */
export function parseVoiceInput(text: string): {
  parsed: ParsedExpense;
  suggestions: CategorySuggestion[];
} {
  const amount = extractAmount(text);
  const description = extractDescription(text);
  const suggestions = classifyExpense(text);

  return {
    parsed: {
      amount,
      description,
      rawText: text,
    },
    suggestions,
  };
}
