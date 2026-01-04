import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SimulationData, StrategyReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the simulation phase
const simulationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    interceptedQueries: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Die hypothetischen internen Suchanfragen, die ein LLM generiert (auf Deutsch).",
    },
    detectedIntent: {
      type: Type.STRING,
      description: "Die erkannte Nutzerabsicht (z.B. Transaktional, Informativ) auf Deutsch.",
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        priceSensitivity: { type: Type.STRING, description: "Preissensibilität (Niedrig, Mittel, Hoch) auf Deutsch." },
        technicalDepth: { type: Type.STRING, description: "Technische Tiefe (Niedrig, Mittel, Hoch) auf Deutsch." },
        reviewImportance: { type: Type.NUMBER, description: "Wichtigkeit von Bewertungen (0-100)" },
      },
      required: ["priceSensitivity", "technicalDepth", "reviewImportance"],
    },
  },
  required: ["interceptedQueries", "detectedIntent", "metadata"],
};

// Schema for the analysis phase
const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: "Zusammenfassung der Strategie auf Deutsch." },
    rankingFactors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name des Rankingfaktors auf Deutsch." },
          score: { type: Type.NUMBER },
          description: { type: Type.STRING, description: "Erklärung auf Deutsch." },
        },
        required: ["name", "score", "description"],
      },
    },
    keywordClusters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: "Thema des Clusters auf Deutsch." },
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
          title: { type: Type.STRING, description: "Titel der Massnahme auf Deutsch." },
          description: { type: Type.STRING, description: "Beschreibung der Massnahme auf Deutsch." },
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
 * Simulates the "Hacker" phase
 */
export const simulateNetworkTraffic = async (keyword: string): Promise<SimulationData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Du bist eine Reverse-Engineering-Engine, die den internen Suchprozess eines LLMs simuliert.
      Der Benutzer möchte Informationen zu: "${keyword}".
      
      Simuliere den "Netzwerkverkehr" des Denkprozesses eines LLMs.
      Welche Unterabfragen (Sub-Queries) würde es generieren? Welche Metadaten (Preis, Specs, Bewertungen) analysiert es?
      
      Antworte strikt auf Deutsch (Swiss German Context allowed but standard German preferred for UI).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: simulationSchema,
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    return {
      targetKeyword: keyword,
      timestamp: new Date().toISOString(),
      interceptedQueries: parsed.interceptedQueries || [],
      detectedIntent: parsed.detectedIntent || "Unbekannt",
      simulatedNetworkLatencyMs: Math.floor(Math.random() * 400) + 100,
      metadata: parsed.metadata || { priceSensitivity: "Mittel", technicalDepth: "Niedrig", reviewImportance: 50 },
    };
  } catch (error) {
    console.error("Simulation Error:", error);
    throw new Error("Fehler bei der Simulation des Netzwerkverkehrs.");
  }
};

/**
 * Analyzes the simulated data
 */
export const generateStrategyReport = async (simulation: SimulationData): Promise<StrategyReport> => {
  try {
    const prompt = `
      Analysiere die folgenden abgefangenen LLM-Suchdaten, um eine LLM-SEO-Strategie zu erstellen.
      Ziel-Keyword: ${simulation.targetKeyword}
      Interne Abfragen: ${JSON.stringify(simulation.interceptedQueries)}
      Erkannte Metadaten: ${JSON.stringify(simulation.metadata)}

      Dein Ziel ist es, dem Nutzer zu erklären, wie er für dieses Thema auf Platz 1 der KI-Antworten landet.
      Antworte ausschliesslich auf Deutsch.
      1. Identifiziere Ranking-Faktoren.
      2. Gruppiere Keywords in Cluster.
      3. Erstelle einen umsetzbaren Massnahmenplan.
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
    throw new Error("Fehler bei der Erstellung des Strategieberichts.");
  }
};