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
        priceSensitivity: { type: Type.STRING, description: "Preissensibilität (Niedrig, Mittel, Hoch)." },
        technicalDepth: { type: Type.STRING, description: "Technische Tiefe (Niedrig, Mittel, Hoch)." },
        reviewImportance: { type: Type.NUMBER, description: "Wichtigkeit von Bewertungen (0-100)" },
      },
      required: ["priceSensitivity", "technicalDepth", "reviewImportance"],
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
          name: { type: Type.STRING },
          score: { type: Type.NUMBER },
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
 * Simulates the Multi-LLM Scraping Phase
 */
export const simulateNetworkTraffic = async (keyword: string): Promise<SimulationData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Du bist eine 'Integration Layer'-Simulation. Deine Aufgabe ist es, den internen Suchprozess von 3 verschiedenen LLMs (ChatGPT, Perplexity, Gemini) zu simulieren (Reverse Engineering).
      
      User Input: "${keyword}".
      
      Simuliere für JEDES der 3 Modelle separat:
      1. ChatGPT: Welche Suchbegriffe würde es intern nutzen? (Fokus auf Breite)
      2. Perplexity: Welche spezifischen Quellen-Suchanfragen würde es stellen? (Fokus auf Fakten)
      3. Gemini: Welche multimodalen oder Google-Suche-Queries würde es generieren?

      Analysiere zudem die JSON-Metadaten, die in diesen Antworten enthalten wären (Preissensibilität, Tech-Level).
      
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
      metadata: parsed.metadata || { priceSensitivity: "Mittel", technicalDepth: "Niedrig", reviewImportance: 50 },
    };
  } catch (error) {
    console.error("Simulation Error:", error);
    throw new Error("Fehler bei der Multi-LLM Simulation.");
  }
};

/**
 * Analyzes the simulated data
 */
export const generateStrategyReport = async (simulation: SimulationData): Promise<StrategyReport> => {
  try {
    // Combine all queries for analysis
    const allQueries = simulation.providers.flatMap(p => p.interceptedQueries);

    const prompt = `
      Analysiere die abgefangenen Daten aus dem Multi-LLM-Scraping (ChatGPT, Perplexity, Gemini).
      Ziel-Keyword: ${simulation.targetKeyword}
      
      Extrahierte Such-Muster der KIs: ${JSON.stringify(allQueries)}
      Metadaten-Analyse: ${JSON.stringify(simulation.metadata)}

      Erstelle als 'Logic Layer' eine konsolidierte SEO-Strategie, um bei ALLEN 3 Modellen zu ranken.
      Antworte auf Deutsch.
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