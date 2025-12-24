"use client";
import { useState } from 'react';
import axios from 'axios';

export default function DesignPage() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Call backend which calls Google AI
      const res = await axios.post('http://localhost:3001/api/generate-design', { prompt });
      setGeneratedImage(res.data.imageUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 text-center">
      <h1 className="text-3xl font-serif mb-8 text-gray-800">Generate Your Personalized Jewellery</h1>
      
      {/* Categories (Static for UI) */}
      <div className="flex justify-center gap-4 mb-8">
        {['Rings', 'Necklaces', 'Bracelets', 'Earrings'].map((cat) => (
          <button key={cat} className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-purple-100">
            {cat}
          </button>
        ))}
      </div>

      <textarea 
        className="w-full p-4 border rounded-lg mb-4"
        rows={4}
        placeholder="Enter your jewellery detail here... (e.g. A platinum ring with a sapphire center stone)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button 
        onClick={handleGenerate}
        disabled={loading}
        className="bg-[#7D3C98] text-white px-8 py-3 rounded-lg hover:bg-[#6a3281] transition"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {generatedImage && (
        <div className="mt-8">
          <h3 className="text-xl mb-4">Your Design</h3>
          <img src={generatedImage} alt="Generated Jewelry" className="mx-auto rounded-lg shadow-lg" />
          <button className="mt-4 text-[#7D3C98] font-bold">Book Consultation for this Design</button>
        </div>
      )}
    </div>
  );
}