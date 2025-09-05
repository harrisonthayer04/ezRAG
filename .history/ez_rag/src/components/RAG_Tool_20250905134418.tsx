import React from 'react'
import { useState } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({\
    baseURL: 'https'


});


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