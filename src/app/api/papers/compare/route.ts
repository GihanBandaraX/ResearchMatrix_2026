// src/app/api/papers/compare/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Paper from '../../../../models/Paper';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    // 1. Connect to MongoDB using Mongoose connection helper
    await dbConnect();

    const { paperIds, preferredModel } = await req.json();

    if (!paperIds || !Array.isArray(paperIds) || paperIds.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least 2 paper IDs are required for comparison.' 
      }, { status: 400 });
    }

    // 2. Fetch the selected papers from MongoDB using the Mongoose model
    const papers = await Paper.find({ _id: { $in: paperIds } });

    if (!papers || papers.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not find enough papers to compare.' 
      }, { status: 404 });
    }

    // 3. Format the paper details for the synthesis prompt
    let papersContent = '';
    papers.forEach((p, idx) => {
      papersContent += `
        --- PAPER ${idx + 1}: ${p.title || p.fileName} ---
        Authors: ${p.authors?.join(', ') || 'N/A'}
        Abstract: ${p.abstract || 'N/A'}
        Research Problem: ${p.researchProblem || 'N/A'}
        Methodology: ${p.methodology || 'N/A'}
        Results: ${p.results || 'N/A'}
        Limitations: ${p.limitations || 'N/A'}
        \n
      `;
    });

    // 4. Prompt structured for comparative analysis with anti-recitation instructions
    const prompt = `
      You are an expert academic research synthesizer. Compare and contrast the following research papers side-by-side.
      
      IMPORTANT INSTRUCTION: Synthesize and compare the findings using your own original academic phrasing. Avoid verbatim text copying to prevent recitation filters, but ensure all comparative metrics, technical distinctions, and conclusions remain completely accurate.

      Provide a clear, well-structured comparison covering these core aspects:
      1. Overview & Objectives (Core goals of each paper)
      2. Methodological Contrasts (Differences in their technical approach or frameworks)
      3. Results & Performance (Comparative evaluation of findings)
      4. Limitations & Trade-offs (Shortcomings highlighted across the studies)

      Here are the papers to compare:
      ${papersContent}
    `;

    // 5. Multi-Model Fallback setup to handle 503 high demand errors safely
    const defaultModels = [
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash'
    ];

    const modelNames = preferredModel ? [preferredModel, ...defaultModels.filter(m => m !== preferredModel)] : defaultModels;

    let result = null;
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Attempting comparison using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        if (result) {
          console.log(`Successfully generated comparison using: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed for comparison, trying next...`, err.message);
        lastError = err;
      }
    }

    if (!result) {
      throw new Error(`All Gemini fallback models failed for comparison. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    const comparisonText = result.response.text();

    return NextResponse.json({ success: true, comparison: comparisonText });

  } catch (error: any) {
    console.error('Error comparing papers:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}