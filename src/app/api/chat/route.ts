// src/app/api/chat/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/mongodb';
import PaperChunk from '../../../models/PaperChunk';
import '../../../models/Paper'; // Ensure Paper model is registered for populate/lookup


// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { prompt, paperId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Generate embedding for the user query using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const embeddingResult = await model.embedContent(prompt);
  const queryEmbedding = embeddingResult.embedding.values;

    // 2. MongoDB Atlas Vector Search Aggregation Pipeline
    const vectorSearchStage: any = {
      $vectorSearch: {
        index: 'vector_index', // Name of the Vector Search Index created in MongoDB Atlas
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 4, // Retrieve top 4 matching chunks
      },
    };

    // Filter by specific paperId if provided
    if (paperId && mongoose.Types.ObjectId.isValid(paperId)) {
      vectorSearchStage.$vectorSearch.filter = {
        paperId: new mongoose.Types.ObjectId(paperId),
      };
    }

    const pipeline = [
      vectorSearchStage,
      {
        $lookup: {
          from: 'papers',
          localField: 'paperId',
          foreignField: '_id',
          as: 'paper',
        },
      },
      { $unwind: '$paper' },
      {
        $project: {
          chunkText: 1,
          pageNumber: 1,
          paperTitle: '$paper.title',
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const chunks: any[] = await PaperChunk.aggregate(pipeline);

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        success: true,
        answer: "I couldn't find any relevant information in your uploaded research papers to answer this question.",
        sources: [],
      });
    }

    // 3. Construct context from retrieved chunks
    let contextText = '';
    const sources: { title: string; page: number }[] = [];

    chunks.forEach((chunk: any, index: number) => {
      contextText += `\n--- Source [${index + 1}]: ${chunk.paperTitle} (Page ${chunk.pageNumber}) ---\n${chunk.chunkText}\n`;
      sources.push({ title: chunk.paperTitle, page: chunk.pageNumber });
    });

    // 4. Generate RAG response using Gemini model
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `You are an expert academic research assistant and thesis advisor. 
Answer the user's question accurately using ONLY the provided research paper context. 
Do not hallucinate or make up facts. 
When providing information from the text, you MUST include exact citations in the format [Paper Title - Page X] right next to the claims.`;

    const fullPrompt = `Context from Research Library:\n${contextText}\n\nUser Question: ${prompt}\n\nProvide a comprehensive, accurate academic answer with precise inline citations:`;

    const chatResult = await chatModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      systemInstruction: systemInstruction,
    });

    const answer = chatResult.response.text();

    return NextResponse.json({
      success: true,
      answer,
      sources,
    });

  } catch (error: any) {
    console.error('RAG Chat API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}