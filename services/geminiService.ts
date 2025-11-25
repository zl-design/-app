
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BaziAnalysis, DailyFortune, CalendarType, CompatibilityAnalysis, BaziChart } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get today's date string
const getTodayString = () => new Date().toISOString().split('T')[0];

/**
 * Analyzes Bazi based on PRE-CALCULATED Pillars.
 * The chart generation is now deterministic (done locally), AI only interprets.
 */
export const analyzeBazi = async (
    calculatedChart: BaziChart,
    birthDetails: { date: string, time: string, location: string, gender: string }
): Promise<BaziAnalysis> => {
    const model = 'gemini-2.5-flash';

    const detailedAnalysisSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.NUMBER, description: "Score out of 100" },
            conclusion: { type: Type.STRING, description: "Detailed conclusion (min 100 words)." },
            reasoning: { type: Type.STRING, description: "Technical Bazi reasoning (e.g., 'Due to strong Fire...')." },
            actionableAdvice: { type: Type.STRING, description: "Practical advice regarding this aspect." }
        }
    };

    // Schema excludes the Pillar generation part because we already have it.
    // We only ask AI to fill in the analysis fields.
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            // We ask AI to confirm/refine these analysis fields
            strength: { type: Type.STRING, description: "Strength (身强/身弱/从格)" },
            structure: { type: Type.STRING, description: "Pattern name, e.g., 伤官格" },
            favorableElements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Yong Shen" },
            unfavorableElements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ji Shen" },
            missingElements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Elements completely missing from the chart" },
            luckyColors: { type: Type.ARRAY, items: { type: Type.STRING } },
            luckyNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
            fiveElements: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: {
                        name: {type: Type.STRING},
                        percentage: {type: Type.NUMBER},
                        score: {type: Type.NUMBER}
                    }
                } 
            },
            globalComment: { type: Type.STRING, description: "A comprehensive summary of the person's destiny (min 150 words)." },
            personality: detailedAnalysisSchema,
            career: detailedAnalysisSchema,
            relationships: detailedAnalysisSchema,
            wealth: detailedAnalysisSchema,
            health: detailedAnalysisSchema
        }
    };
    
    // Construct the fixed chart string
    const chartStr = `
        年柱: ${calculatedChart.year.gan}${calculatedChart.year.zhi}
        月柱: ${calculatedChart.month.gan}${calculatedChart.month.zhi}
        日柱: ${calculatedChart.day.gan}${calculatedChart.day.zhi}
        时柱: ${calculatedChart.hour.gan}${calculatedChart.hour.zhi}
        日主: ${calculatedChart.dayMaster}
        生肖: ${calculatedChart.zodiac}
    `;

    const prompt = `
        扮演一位拥有50年经验的国学大师、八字命理专家。
        
        **已确定的八字排盘（不可修改，以此为准）：**
        ${chartStr}
        
        **用户信息：**
        - 性别：${birthDetails.gender}
        - 出生地点：${birthDetails.location}

        **任务要求：**
        1. **深度解读：** 基于上述给定的八字，分析日主在月令的状态，判断身强身弱及格局。
        2. **喜忌分析：** 明确喜用神和忌神。
        3. **深度推演：**
           - **性格**：结合十神心性分析。
           - **事业**：分析官杀、印星，适合的行业方向。
           - **财运**：分析正财偏财，财库情况。
           - **感情**：分析配偶宫状态，有无刑冲克害。
           - **健康**：五行过旺或过弱对应的风险。

        请使用**简体中文**输出 JSON 格式。
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                thinkingConfig: { thinkingBudget: 4096 }
            }
        });

        const text = response.text;
        if (!text) throw new Error("无法获取回应");
        
        const aiData = JSON.parse(text);

        // Merge AI analysis with the pre-calculated immutable chart
        const finalAnalysis: BaziAnalysis = {
            chart: {
                ...calculatedChart,
                ...aiData // Fill in strength, structure, fiveElements, etc.
            },
            globalComment: aiData.globalComment,
            personality: aiData.personality,
            career: aiData.career,
            relationships: aiData.relationships,
            wealth: aiData.wealth,
            health: aiData.health
        };

        return finalAnalysis;
    } catch (error) {
        console.error("Bazi Error:", error);
        throw error;
    }
};

/**
 * Compatibility Analysis for Two People (He Pan)
 * Now accepts pre-calculated charts to ensure stability.
 */
export const analyzeCompatibility = async (
    c1: BaziChart, p1Info: { name: string, gender: string },
    c2: BaziChart, p2Info: { name: string, gender: string }
): Promise<CompatibilityAnalysis> => {
    const model = 'gemini-2.5-flash';

    const matchAspectSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            score: { type: Type.NUMBER },
            description: { type: Type.STRING },
            technicalReason: { type: Type.STRING, description: "Explain the Bazi theory used (e.g. 'Rat and Horse clash')" }
        }
    };

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            overallScore: { type: Type.NUMBER },
            synopsis: { type: Type.STRING },
            dayMasterRelation: matchAspectSchema,
            zodiacRelation: matchAspectSchema,
            elementalBalance: matchAspectSchema,
            spousePalace: matchAspectSchema,
            advice: { type: Type.STRING }
        }
    };

    const prompt = `
        扮演一位精通“八字合婚”的命理大师。请分析以下两人的八字匹配度。
        
        **甲方（${p1Info.name} / ${p1Info.gender}）八字：**
        年: ${c1.year.gan}${c1.year.zhi}
        月: ${c1.month.gan}${c1.month.zhi}
        日: ${c1.day.gan}${c1.day.zhi} (日主: ${c1.dayMaster})
        时: ${c1.hour.gan}${c1.hour.zhi}

        **乙方（${p2Info.name} / ${p2Info.gender}）八字：**
        年: ${c2.year.gan}${c2.year.zhi}
        月: ${c2.month.gan}${c2.month.zhi}
        日: ${c2.day.gan}${c2.day.zhi} (日主: ${c2.dayMaster})
        时: ${c2.hour.gan}${c2.hour.zhi}

        **分析任务：**
        1. **日主关系**：分析甲乙日干的生克合关系。
        2. **生肖/根基**：分析年支的冲合刑害。
        3. **五行互补**：分析两人五行是否互补（例如一人缺火，另一人火旺）。
        4. **夫妻宫**：分析日支（夫妻宫）的相互作用。

        **输出要求：**
        - **technicalReason**：必须明确指出是通过什么原理得出的结论。
        - **建议**：基于命理给出相处之道的建议。
        
        请用**简体中文**输出 JSON。
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                thinkingConfig: { thinkingBudget: 4096 }
            }
        });

        const text = response.text;
        if (!text) throw new Error("无法获取合盘结果");
        return JSON.parse(text) as CompatibilityAnalysis;
    } catch (error) {
        console.error("Compatibility Error:", error);
        throw error;
    }
};

/**
 * Generates Daily Almanac PERSONALIZED to the Bazi
 */
export const getDailyFortune = async (bazi: BaziAnalysis | null, date: string = getTodayString()): Promise<DailyFortune> => {
    const model = 'gemini-2.5-flash';
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            date: { type: Type.STRING },
            solarTerm: { type: Type.STRING },
            ganZhi: { type: Type.STRING, description: "Today's GanZhi" },
            personalImpact: { type: Type.STRING, description: "How today affects the user specifically (min 100 words)" },
            score: { type: Type.NUMBER, description: "Personal luck score 0-100" },
            auspicious: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Activities suitable" },
            inauspicious: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Activities to avoid" },
            luckyDirection: { type: Type.STRING },
            luckyColor: { type: Type.STRING }
        }
    };

    let userContext = "";
    if (bazi) {
        userContext = `
            **当前用户命盘信息：**
            - 日主：${bazi.chart.dayMasterElement} (${bazi.chart.dayMaster})
            - 日支（夫妻宫）：${bazi.chart.day.zhi}
            - 年支（生肖）：${bazi.chart.year.zhi} (${bazi.chart.zodiac})
            - 格局：${bazi.chart.structure}
            - 喜用神：${bazi.chart.favorableElements.join(', ')}
            
            **任务：**
            请结合今日的“日柱天干地支”与用户的“八字命盘”进行深度交互分析。
            - 检查今日地支是否与用户年支（生肖）或日支（夫妻宫）产生冲、合、刑、害。
            - 检查今日五行是否为用户的喜用神。
            - 在 "personalImpact" 字段中详细解释今日运势对该用户的具体影响。
        `;
    } else {
        userContext = "用户未提供命盘，请提供通用的每日运势。在 personalImpact 中提示用户'去排盘以获取专属运势'。";
    }

    const prompt = `
        扮演一位精通择日学的通书专家。
        分析日期：${date}。
        ${userContext}
        用**简体中文**返回结果。
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const text = response.text;
        if (!text) throw new Error("无法获取黄历");
        return JSON.parse(text) as DailyFortune;
    } catch (error) {
        console.error("Almanac Error:", error);
        throw error;
    }
};

/**
 * Chat Oracle with Bazi Context
 */
export const askOracle = async (history: { role: string, parts: { text: string }[] }[], message: string, bazi: BaziAnalysis | null): Promise<string> => {
    const model = 'gemini-2.5-flash';
    
    let systemInstruction = "你是玄机阁的守护者，一位融合了传统命理与现代哲学的智者。请用简体中文回答。";

    if (bazi) {
        systemInstruction += `
            **当前对话者的命盘背景（必须基于此回答问题）：**
            - 乾造/坤造：${bazi.chart.year.gan}${bazi.chart.year.zhi}年出生
            - 日主：${bazi.chart.dayMaster} (${bazi.chart.dayMasterElement})
            - 身强/弱：${bazi.chart.strength}
            - 格局：${bazi.chart.structure}
            - 喜用神：${bazi.chart.favorableElements.join(', ')}
            - 缺少的五行：${bazi.chart.missingElements.join(', ')}
            
            **回答规则：**
            1. 当用户询问事业、感情、财运时，**必须**引用上述命盘信息作为依据（例如：“因为你日主弱且缺火，所以...”）。
            2. 如果用户问通用问题，也可以结合其五行喜忌给出建议。
        `;
    } else {
        systemInstruction += "用户尚未进行八字排盘。如果用户问及个人运势，请礼貌引导用户先去‘八字排盘’页面进行测算。";
    }

    const chat = ai.chats.create({
        model,
        config: {
            systemInstruction: systemInstruction,
        },
        history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || "天机不可泄露...";
};
