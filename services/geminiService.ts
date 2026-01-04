import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SimulationData, StrategyReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the simulation phase
const simulationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    providers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, enum: ["ChatGPT", "Perplexity", "Gemini"] },
          interceptedQueries: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Die spezifischen Such-Queries, die dieses Modell intern generiert hat."
          }
        },
        required: ["name", "interceptedQueries"]
      }
    },
    detectedIntent: {
      type: Type.STRING,
      description: "Die konsolidierte Nutzerabsicht (z.B. Transaktional, Informativ) auf Deutsch.",
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        citationProbability: { type: Type.STRING, description: "Wahrscheinlichkeit einer Verlinkung (z.B. 'Hoch (80%)')." },
        tableInclusion: { type: Type.STRING, description: "Wird eine Tabelle erstellt? (Ja/Nein)." },
        brandSentiment: { type: Type.STRING, description: "Erwartetes Sentiment (Positiv, Neutral, Kritisch)." },
        priceSensitivity: { type: Type.STRING },
        technicalDepth: { type: Type.STRING },
      },
      required: ["citationProbability", "tableInclusion", "brandSentiment", "priceSensitivity", "technicalDepth"],
    },
  },
  required: ["providers", "detectedIntent", "metadata"],
};

// Schema for the analysis phase
const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: "Strategische Zusammenfassung auf Deutsch." },
    rankingFactors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name des Kriteriums (z.B. 'Informations-Dichte', 'Schema.org')" },
          score: { type: Type.NUMBER, description: "Wichtigkeit 0-100" },
          description: { type: Type.STRING },
        },
        required: ["name", "score", "description"],
      },
    },
    keywordClusters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["topic", "keywords"],
      },
    },
    actionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["Hoch", "Mittel", "Niedrig"] },
          effort: { type: Type.STRING, enum: ["Leicht", "Mittel", "Schwer"] },
        },
        required: ["title", "description", "priority", "effort"],
      },
    },
  },
  required: ["executiveSummary", "rankingFactors", "keywordClusters", "actionPlan"],
};

/**
 * Simulates the Multi-LLM Scraping Phase (Updated for GEO metrics)
 */
export const simulateNetworkTraffic = async (keyword: string): Promise<SimulationData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Du bist eine 'Integration Layer'-Simulation für BEYONDER. Deine Aufgabe ist das Reverse Engineering des internen Suchverhaltens von LLMs.
  
      User Input: "${keyword}".
      
      Simuliere den Prozess für ChatGPT, Perplexity und Gemini:
      1. Welche präzisen Keywords triggern die "Browse with Bing" oder "Google Search" Funktionen?
      2. Welche Quell-Typen (Reddit, Fachportale, Konkurrenzseiten) priorisieren die Modelle für dieses Keyword?
      3. Berechne basierend auf aktuellen Trainingsdaten das erwartete Marken-Sentiment in den Antworten.
      
      Zusatz-Metriken für GEO:
      - Citation Probability: Wie hoch ist die Chance, dass Quellen verlinkt werden? (String, z.B. "Hoch")
      - Table-Inclusion: Wird die KI eine Vergleichstabelle erstellen? (String, z.B. "Ja")
      - Brand Sentiment: Erwartetes Sentiment? (String, z.B. "Neutral")
      - Price Sensitivity & Technical Depth (wie bisher)
      
      Antworte strikt als JSON Objekt passend zum Schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: simulationSchema,
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    // Map the parsed data to include UI-specific fields like latency
    const providers = (parsed.providers || []).map((p: any) => ({
      name: p.name,
      status: 'intercepted',
      interceptedQueries: p.interceptedQueries || [],
      latency: Math.floor(Math.random() * 300) + 150
    }));

    return {
      targetKeyword: keyword,
      timestamp: new Date().toISOString(),
      providers: providers,
      detectedIntent: parsed.detectedIntent || "Unbekannt",
      metadata: parsed.metadata || { 
        citationProbability: "Mittel", 
        tableInclusion: "Vielleicht", 
        brandSentiment: "Neutral",
        priceSensitivity: "Mittel", 
        technicalDepth: "Niedrig" 
      },
    };
  } catch (error) {
    console.error("Simulation Error:", error);
    throw new Error("Fehler bei der Multi-LLM Simulation.");
  }
};

/**
 * Analyzes the simulated data (Updated for E-E-A-T and Information Gains)
 */
export const generateStrategyReport = async (simulation: SimulationData): Promise<StrategyReport> => {
  try {
    // Combine all queries for analysis
    const allQueries = simulation.providers.flatMap(p => p.interceptedQueries);

    const prompt = `
      Analysiere die Simulation für das Keyword: ${simulation.targetKeyword}.
      Extrahierte Such-Muster: ${JSON.stringify(allQueries)}
      Metadaten (GEO): ${JSON.stringify(simulation.metadata)}
      
      Erstelle eine GEO-Strategie (Generative Engine Optimization) auf Deutsch:
      
      1. KI-RANKING-FAKTOREN (WICHTIG): Identifiziere die 5-7 wichtigsten quantitativen Faktoren (Score 0-100), die für dieses spezifische Keyword den Ausschlag bei KI-Modellen geben.
         (Beispiele: 'Semantische Dichte', 'Strukturierte Daten', 'Marken-Autorität', 'Zitat-Qualität', 'Frischegrad').
      
      2. Content-Strategie:
         - Identifiziere 'Information Gains': Welche einzigartigen Daten fehlen den KIs noch?
         - E-E-A-T Optimierung: Wie wird die Seite als Primärquelle etabliert?
         - Sentiment-Tweak: Wording-Anpassungen für positives KI-Sentiment.
      
      3. Erstelle einen konkreten Massnahmenplan ('Action Plan').
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return parsed as StrategyReport;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Fehler bei der Strategie-Generierung.");
  }
};