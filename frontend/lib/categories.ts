/**
 * Definizione delle categorie di spesa predefinite.
 * Ogni categoria ha un nome, icona emoji, colore, e keywords per il matching vocale.
 */

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  keywords: string[];
  isCustom: boolean;
  budgetLimit?: number;
}

/**
 * Categorie predefinite per la versione Free (10 categorie, 5 disponibili in Free)
 * Le prime 5 sono disponibili nella versione Free
 */
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Cibo & Ristoranti',
    icon: '🍕',
    color: '#FF6B6B',
    keywords: [
      'pranzo', 'cena', 'colazione', 'pizza', 'sushi', 'bar', 'caffè', 'caffe',
      'supermercato', 'spesa', 'ristorante', 'trattoria', 'osteria', 'pizzeria',
      'panino', 'gelato', 'aperitivo', 'birra', 'vino', 'mangiare', 'mangiato',
      'cibo', 'alimentari', 'frutta', 'verdura', 'pane', 'latte', 'pasta',
      'carne', 'pesce', 'dolce', 'cornetto', 'brioche', 'hamburger', 'kebab',
      'mcdonalds', 'mcdonald', 'burger king', 'deliveroo', 'glovo', 'just eat',
      'uber eats', 'take away', 'asporto', 'mensa', 'tavola calda', 'rosticceria',
      'pasticceria', 'gelateria', 'paninoteca', 'pub', 'enoteca', 'cocktail',
    ],
    isCustom: false,
  },
  {
    id: 2,
    name: 'Trasporti',
    icon: '🚗',
    color: '#4ECDC4',
    keywords: [
      'benzina', 'diesel', 'gasolio', 'treno', 'taxi', 'uber', 'bus', 'autobus',
      'metro', 'metropolitana', 'autostrada', 'pedaggio', 'telepass', 'parcheggio',
      'garage', 'meccanico', 'officina', 'gomme', 'pneumatici', 'revisione',
      'bollo', 'assicurazione auto', 'manutenzione auto', 'carburante', 'rifornimento',
      'distributore', 'aereo', 'volo', 'biglietto treno', 'abbonamento trasporti',
      'monopattino', 'bici', 'car sharing', 'enjoy', 'share now', 'car2go',
      'italo', 'trenitalia', 'flixbus', 'blablacar', 'nave', 'traghetto',
    ],
    isCustom: false,
  },
  {
    id: 3,
    name: 'Casa & Bollette',
    icon: '🏠',
    color: '#45B7D1',
    keywords: [
      'affitto', 'mutuo', 'rata', 'luce', 'elettricità', 'gas', 'acqua',
      'internet', 'wifi', 'fibra', 'telefono', 'condominio', 'spese condominiali',
      'riscaldamento', 'tari', 'immondizia', 'rifiuti', 'bolletta', 'bollette',
      'enel', 'eni', 'a2a', 'iren', 'tim', 'vodafone', 'wind', 'fastweb',
      'iliad', 'sky', 'canone', 'rai', 'mobili', 'ikea', 'arredamento',
      'elettrodomestico', 'lavatrice', 'frigorifero', 'pulizie', 'detersivo',
    ],
    isCustom: false,
  },
  {
    id: 4,
    name: 'Salute',
    icon: '💊',
    color: '#96CEB4',
    keywords: [
      'farmacia', 'farmaco', 'medicina', 'medico', 'dottore', 'dentista',
      'visita', 'visita medica', 'analisi', 'esami', 'esame del sangue',
      'ospedale', 'pronto soccorso', 'specialista', 'oculista', 'dermatologo',
      'ortopedico', 'fisioterapia', 'fisioterapista', 'psicologo', 'terapia',
      'ticket', 'ricetta', 'integratore', 'vitamine', 'crema', 'pomata',
      'antibiotico', 'antidolorifico', 'aspirina', 'tachipirina',
    ],
    isCustom: false,
  },
  {
    id: 5,
    name: 'Shopping',
    icon: '🛍️',
    color: '#FFEAA7',
    keywords: [
      'vestiti', 'vestito', 'scarpe', 'amazon', 'online', 'shopping',
      'maglietta', 'pantaloni', 'giacca', 'cappotto', 'borsa', 'zaino',
      'accessori', 'gioielli', 'orologio', 'profumo', 'cosmetici', 'trucchi',
      'makeup', 'zara', 'h&m', 'primark', 'gucci', 'nike', 'adidas',
      'abbigliamento', 'intimo', 'calze', 'cinta', 'cintura', 'occhiali',
      'shein', 'zalando', 'asos', 'wish',
    ],
    isCustom: false,
  },
  {
    id: 6,
    name: 'Svago',
    icon: '🎮',
    color: '#DDA0DD',
    keywords: [
      'cinema', 'netflix', 'spotify', 'disney', 'prime video', 'palestra',
      'abbonamento', 'gym', 'fitness', 'piscina', 'vacanza', 'viaggio',
      'hotel', 'airbnb', 'booking', 'museo', 'mostra', 'concerto',
      'teatro', 'stadio', 'partita', 'calcio', 'sport', 'videogioco',
      'playstation', 'xbox', 'nintendo', 'steam', 'gioco', 'giocare',
      'discoteca', 'club', 'festa', 'party', 'karaoke', 'bowling',
      'escape room', 'parco', 'divertimento', 'luna park', 'zoo', 'acquario',
    ],
    isCustom: false,
  },
  {
    id: 7,
    name: 'Istruzione',
    icon: '📚',
    color: '#98D8C8',
    keywords: [
      'libro', 'libri', 'corso', 'scuola', 'università', 'master',
      'formazione', 'lezione', 'lezioni', 'ripetizioni', 'tutor',
      'udemy', 'coursera', 'skillshare', 'ebook', 'kindle', 'audible',
      'quaderno', 'cancelleria', 'penna', 'matita', 'zaino scuola',
      'tasse universitarie', 'iscrizione', 'certificazione', 'esame',
    ],
    isCustom: false,
  },
  {
    id: 8,
    name: 'Lavoro',
    icon: '💼',
    color: '#F7DC6F',
    keywords: [
      'ufficio', 'materiale ufficio', 'software', 'licenza', 'computer',
      'portatile', 'laptop', 'monitor', 'tastiera', 'mouse', 'stampante',
      'cartuccia', 'toner', 'carta', 'scrivania', 'sedia', 'coworking',
      'hosting', 'dominio', 'server', 'cloud', 'abbonamento software',
      'canva', 'adobe', 'microsoft', 'apple', 'telefono lavoro',
    ],
    isCustom: false,
  },
  {
    id: 9,
    name: 'Regali',
    icon: '🎁',
    color: '#FF8A80',
    keywords: [
      'regalo', 'regali', 'compleanno', 'natale', 'pasqua', 'san valentino',
      'anniversario', 'matrimonio', 'battesimo', 'comunione', 'cresima',
      'laurea', 'nascita', 'fiori', 'mazzo di fiori', 'bomboniere',
      'festa', 'sorpresa', 'pensierino', 'dono',
    ],
    isCustom: false,
  },
  {
    id: 10,
    name: 'Altro',
    icon: '❓',
    color: '#B0BEC5',
    keywords: [],
    isCustom: false,
  },
];

/**
 * Categorie disponibili nella versione Free (prime 5 + Altro)
 */
export const FREE_CATEGORY_IDS = [1, 2, 3, 4, 5, 10];

/**
 * Restituisce una categoria per ID
 */
export function getCategoryById(id: number): Category | undefined {
  return DEFAULT_CATEGORIES.find((c) => c.id === id);
}

/**
 * Restituisce il colore di una categoria dato il suo ID
 */
export function getCategoryColor(id: number): string {
  return getCategoryById(id)?.color ?? '#B0BEC5';
}

/**
 * Restituisce l'icona di una categoria dato il suo ID
 */
export function getCategoryIcon(id: number): string {
  return getCategoryById(id)?.icon ?? '❓';
}
