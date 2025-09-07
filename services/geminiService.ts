import { GoogleGenAI, Modality } from "@google/genai";
import { NEGATIVE_PROMPTS_BLUEPRINT, NEGATIVE_PROMPTS_ARCH_INTERIOR, NEGATIVE_PROMPTS_INTERIOR_DESIGN } from '../constants';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const dataUrlToGenerativePart = (dataUrl: string) => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return {
        inlineData: { data, mimeType }
    };
};


export const getRoomListFromBlueprintPrompt = async (options: {
  goal: string;
  plotWidth: number;
  plotDepth: number;
  units: string;
  floors: number;
}): Promise<string[]> => {
    try {
        const prompt = `You are an expert architect. A user wants to build a house with the following specifications: ${JSON.stringify(options)}. Based on these, generate a list of all essential rooms and spaces. The output must be a valid JSON array of strings. Include standard rooms like bedrooms, bathrooms, kitchen, living area, and also consider utility spaces like garage, laundry, and storage if appropriate. Also, always include 'Isometric View of House' in the list. Example output: ["Living Room", "Kitchen", "Master Bedroom", "Master Bathroom", "Guest Bedroom", "Office", "Garage", "Isometric View of House"]`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text.trim().replace(/```json|```/g, '');
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating room list:", error);
        return ["Living Room", "Kitchen", "Master Bedroom", "Master Bathroom", "Isometric View of House"]; // Fallback
    }
};

export const generateBlueprint = async (options: {
  goal: string;
  plotWidth: number;
  plotDepth: number;
  units: string;
  floors: number;
}): Promise<string> => {
    // Cognitive Scaffolding & Structured Prompting Approach based on research
    const prompt = `
**ROLE:** You are a world-class AI architect specializing in creating precise, regulation-compliant 2D floor plans. Your work is clean, professional, and accurate.

**TASK:** Generate ONE top-down, 2D architectural blueprint based on the following detailed design brief.

---
**DESIGN BRIEF**
---

**1. PROJECT GOAL:**
   - The primary design focus is: "${options.goal}".

**2. PLOT CONSTRAINTS (NON-NEGOTIABLE):**
   - **Plot Width:** ${options.plotWidth} ${options.units}
   - **Plot Depth:** ${options.plotDepth} ${options.units}
   - **Total Floors:** ${options.floors}

**3. BLUEPRINT STYLE & FORMATTING:**
   - **Style:** Professional architectural schematic.
   - **Color:** Black and white ONLY. High contrast, sharp lines. No color, no grayscale, no textures.
   - **View:** Top-down 2D view. No perspective, no isometric, no 3D.

**4. CRITICAL REQUIREMENTS (MUST BE FOLLOWED):**

   **A. OVERALL DIMENSION LABELING (CRITICAL - FOLLOW EXACTLY):**
      - You MUST draw exterior dimension lines around the entire perimeter.
      - **Horizontal Dimensions (Top and Bottom):**
         - The label at the TOP of the drawing MUST be **EXACTLY** "${options.plotWidth}".
         - The label at the BOTTOM of the drawing MUST be **EXACTLY** "${options.plotWidth}".
         - Both horizontal labels must be present and identical.
      - **Vertical Dimensions (Left and Right):**
         - The label on the LEFT side of the drawing MUST be **EXACTLY** "${options.plotDepth}".
         - The label on the RIGHT side of the drawing MUST ALSO be **EXACTLY** "${options.plotDepth}".
         - Both vertical labels must be present and identical.
      - **MANDATORY CHECK:** Do NOT swap width and depth. Do NOT have different labels for parallel sides.

   **B. ROOMS & LABELS:**
      - All rooms and major areas must be clearly labeled with LEGIBLE, UPPPERCASE, SANS-SERIF ENGLISH TEXT (e.g., "LIVING ROOM", "KITCHEN", "MASTER BEDROOM").
      - The layout must be logical, functional, and adhere to standard building practices. Rooms must be accessible.
      - Include internal dimension lines for all major rooms.

---
**EXCLUSION LIST (NEGATIVE PROMPTS)**
---
**You MUST AVOID the following at all costs:**
- ${NEGATIVE_PROMPTS_BLUEPRINT}
- **SPECIFICALLY FORBIDDEN:**
  - **Inconsistent Exterior Dimensions:** Do not have different labels for parallel sides (e.g., left and right sides having different numbers).
  - **Incorrect Outer Dimensions:** Do not label the width as the depth, or vice versa. The labels must be exactly "${options.plotWidth}" and "${options.plotDepth}" in the correct orientation.
  - **Gibberish Text:** All text must be real, correctly spelled English words.
  - **Duplicate Rooms:** No repeated primary rooms like 'KITCHEN'.
  - **3D/Photo Elements:** No shadows, perspectives, colors, textures, or photographic rendering.
  - **Watermarks/Signatures:** The image must be clean of any logos or text other than the architectural labels.
`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated for blueprint");
};

export const reviseBlueprint = async (baseImage: string, revision: string, options: {
    plotWidth: number;
    plotDepth: number;
    units: string;
}): Promise<string> => {
    const imagePart = dataUrlToGenerativePart(baseImage);
    
    const textPart = { text: `
**ROLE:** You are an AI architect revising an existing 2D blueprint.

**TASK:** Modify the provided blueprint based on the user's request, while strictly adhering to the original project's core constraints.

---
**USER REVISION REQUEST**
---
- "${revision}"

---
**CORE CONSTRAINTS TO MAINTAIN (NON-NEGOTIABLE)**
---
**1. PLOT SIZE & DIMENSIONS (CRITICAL - FOLLOW EXACTLY):**
   - The overall plot size CANNOT change. It remains ${options.plotWidth} ${options.units} wide by ${options.plotDepth} ${options.units} deep.
   - The exterior dimension labels MUST remain unchanged and consistent.
   - The horizontal labels (top and bottom) MUST be **EXACTLY** "${options.plotWidth}".
   - The vertical labels (left and right) MUST be **EXACTLY** "${options.plotDepth}".
   - Both vertical labels MUST MATCH. Both horizontal labels MUST MATCH. Do NOT alter these.

**2. STYLE & FORMAT:**
   - Maintain the professional, black and white, 2D schematic style. No colors, no 3D.

**3. LABELS & LOGIC:**
   - All room labels must remain legible, uppercase English text.
   - The layout must remain logical and functional.

---
**EXCLUSION LIST (NEGATIVE PROMPTS)**
---
**While revising, continue to AVOID the following at all costs:**
- ${NEGATIVE_PROMPTS_BLUEPRINT}
- **SPECIFICALLY FORBIDDEN:**
  - Changing the overall dimension labels or making them inconsistent.
  - Adding gibberish text or illegible labels.
  - Introducing illogical layouts or duplicate primary rooms.
  - Adding any color, 3D effects, or photographic elements.
` };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated in revision");
};

export const generateArchitectureImage = async (componentName: string, floors: number): Promise<string> => {
    const isIsometric = componentName.toLowerCase().includes('isometric');
    const prompt = isIsometric
        ? `Generate a 3D isometric exterior view of a modern, ${floors}-story house. The style should be a clean architectural render with white walls and large windows, set against a plain light grey background. If floors is 1, show a single-story building. If floors is 2, show a two-story building. Negative prompt: ${NEGATIVE_PROMPTS_ARCH_INTERIOR}.`
        : `A photorealistic, wide-angle interior shot of an empty, newly built ${componentName}. The room has light grey walls, a light oak wood floor, and large windows with bright, natural daylight. There is NO furniture, NO decorations, and NO people. Focus on the clean, empty architectural space. Negative prompt: ${NEGATIVE_PROMPTS_ARCH_INTERIOR}.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error(`No image generated for ${componentName}`);
};


export const generateInteriorDesign = async (baseImage: string, style: string, componentName: string): Promise<string> => {
    const imagePart = dataUrlToGenerativePart(baseImage);
    const textPart = { text: `
**ROLE:** You are an expert AI interior designer.

**TASK:** Redesign the provided empty room image into a fully furnished, photorealistic space based on the user's request.

---
**DESIGN BRIEF**
---

**1. ROOM TYPE (CRITICAL CONTEXT):**
   - You are designing a **${componentName}**. The furniture and decor must be appropriate for this type of room.
   - For example, a bedroom should have a bed, a kitchen should have counters and appliances, a living room should have sofas, etc.

**2. AESTHETIC STYLE:**
   - The desired interior design style is: **"${style}"**.

**3. INSTRUCTIONS:**
   - Add appropriate furniture, lighting, plants, and decorations to make it a complete, visually appealing, and livable space.
   - The final image should be photorealistic.

---
**EXCLUSION LIST (NEGATIVE PROMPTS)**
---
**You MUST AVOID the following:**
- ${NEGATIVE_PROMPTS_INTERIOR_DESIGN}
- **SPECIFICALLY FORBIDDEN:**
  - Inappropriate furniture for the room type (e.g., NO sofas in a master bedroom unless it's a large seating area, NO beds in a kitchen).
  - Empty or unfinished-looking spaces.
  - People or animals.
  - Text, watermarks, or signatures.
` };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated in interior design");
};