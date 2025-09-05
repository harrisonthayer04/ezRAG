import React from 'react'
import { useState } from 'react';
import OpenAI from 'openai';

const apiKey = localStorage.getItem('openRouterApiKey');
if (!apiKey) {
    throw new Error('OpenRouter API key not found');
}

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
});

async function ask(question: string){
    const completion = await openai.chat.completions.create({
        model: 'openai/gpt-5',
        messages:[{
            role:'user',
            content: question
        }]
    })
    return completion.choices[0].message.content;
};


const RAG_Tool = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const handleAsk = async () => {
        const answer = await ask(question);
        console.log(answer);
        setAnswer(answer || '');
    }
  return (
    <div>

        <label htmlFor="question">Question:
        <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <button onClick={handleAsk}>Ask</button>
        <p>{answer}</p>

    </div>
  )
}

export default RAG_Tool