
// Enums for standardizing values
export enum ElementType {
    WOOD = 'Wood',
    FIRE = 'Fire',
    EARTH = 'Earth',
    METAL = 'Metal',
    WATER = 'Water'
}

export enum Gender {
    MALE = 'Male',
    FEMALE = 'Female'
}

export enum CalendarType {
    SOLAR = 'Solar', // 阳历
    LUNAR = 'Lunar'  // 阴历
}

export interface User {
    // Legacy support for older components, though mostly unused now
    phoneNumber: string;
    isLoggedIn: boolean;
}

export interface LocalHistoryItem {
    id: string;
    name: string; // Add a name/label for the record
    timestamp: number;
    birthDate: string;
    birthTime: string;
    gender: Gender;
    calendarType: CalendarType;
    chart: BaziChart; // Save the calculated chart
    analysis: BaziAnalysis; // Save the AI result
}

// Alias BaziRecord to LocalHistoryItem for usage in authService
export type BaziRecord = LocalHistoryItem;

// Bazi (Four Pillars) interfaces
export interface Pillar {
    gan: string; // Heavenly Stem
    zhi: string; // Earthly Branch
    element: string; // Visual color mapping
    animal: string; // Zodiac animal
    hiddenStems?: string[]; // Hidden heavenly stems
}

export interface FiveElementScore {
    name: string; // 木, 火, etc.
    percentage: number; // 0-100
    score: number; // Raw score
}

export interface DetailedAnalysis {
    score: number; // 0-100 score for this aspect
    conclusion: string; // The main advice/result
    reasoning: string; // The "Why" (e.g., "Because Day Master is weak...")
    actionableAdvice: string; // Specific things to do
}

export interface BaziChart {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
    dayMaster: string; 
    dayMasterElement: string;
    zodiac: string; // The Year animal
    // The following fields are derived/analyzed
    strength: string; // Strong/Weak
    structure: string; // Pattern (e.g., Shang Guan Ge)
    favorableElements: string[]; // Yong Shen
    unfavorableElements: string[]; // Ji Shen
    missingElements: string[]; // What is completely missing
    luckyColors: string[];
    luckyNumbers: string[];
    fiveElements: FiveElementScore[]; // Distribution
}

export interface BaziAnalysis {
    chart: BaziChart;
    globalComment: string; // Overall life comment
    personality: DetailedAnalysis;
    career: DetailedAnalysis;
    relationships: DetailedAnalysis;
    wealth: DetailedAnalysis;
    health: DetailedAnalysis;
}

// Compatibility Interfaces
export interface MatchAspect {
    title: string;
    score: number;
    description: string;
    technicalReason: string; // How the conclusion was reached
}

export interface CompatibilityAnalysis {
    overallScore: number;
    synopsis: string; // Short summary
    dayMasterRelation: MatchAspect; // Gan relationship
    zodiacRelation: MatchAspect; // Zhi relationship (Year)
    elementalBalance: MatchAspect; // Do they complete each other?
    spousePalace: MatchAspect; // Day branch interaction
    advice: string;
}

// Almanac interfaces
export interface DailyFortune {
    date: string;
    solarTerm: string; // Jie Qi
    ganZhi: string; // Today's stem/branch
    personalImpact: string; // How today affects THIS user based on Bazi
    score: number; // 0-100 luck score for the user
    auspicious: string[]; // Activities capable of doing (Yi)
    inauspicious: string[]; // Activities to avoid (Ji)
    luckyDirection: string;
    luckyColor: string;
}

// Chat interfaces
export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}