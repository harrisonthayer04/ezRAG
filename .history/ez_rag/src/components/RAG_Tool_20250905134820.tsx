import React from 'react'
import { useState } from 'react';
import OpenAI from 'openai';

const apiKey = localStorage.getItem('openRouterApiKey');
if (!apiKey) {
    throw new Error('OpenRouter API key not found');
}

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey
});

async function ask(question: string){
    const completion = await openai.chat.completions.create({
        model: 'openai/gpt5-chat',
        messages:[{
            role:'user',
            content: question
        }]
    })
};


const RAG_Tool = () => {
  return (
    <div>

        <label htmlFor="question">Question:
        <input type="text" id="question" />
        </label>
        <button>Ask</button>

    </div>
  )
}

export default RAG_Tool