"use client";
import { useState, useRef } from 'react';

// Icon Components
const SparklesIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const PaperclipIcon = ({ className = "" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const categories = [
  { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop' },
  { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop' },
  { name: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop' },
  { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop' },
];

// Backend API URL
const API_BASE_URL = 'http://localhost:3001';

export default function DesignPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hotspot, setHotspot] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage(url);
      setEditMode(true);
      setError("");
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !editMode) return;
    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate relative position within the actual image (not the container)
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    
    setHotspot({ x, y });
    console.log('Hotspot set at:', { x, y });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your jewelry design");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      
      let endpoint = `${API_BASE_URL}/api/generate-design`;

      if (selectedFile && editMode) {
        // Edit mode - use hotspot coordinates
        formData.append('image', selectedFile);
        formData.append('x', hotspot.x.toString());
        formData.append('y', hotspot.y.toString());
        endpoint = `${API_BASE_URL}/api/edit-design`;
        console.log('Sending edit request with hotspot:', hotspot);
      } else {
        console.log('Sending generation request');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }
      
      const data = await response.json();
      
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setEditMode(false);
        setSelectedFile(null);
        console.log('Image generated successfully');
      } else {
        throw new Error('No image URL in response');
      }
    } catch (e: any) {
      console.error("AI Generation Error:", e);
      setError(e.message || "Error generating design. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setSelectedFile(null);
    setPreviewUrl("");
    setGeneratedImage("");
    setEditMode(false);
    setHotspot({ x: 0, y: 0 });
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h1 className="text-4xl md:text-5xl font-serif text-center mb-12 text-gray-800">
          Generate Your Personalized Jewellery
        </h1>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-center py-3 font-medium text-gray-700">{category.name}</p>
            </div>
          ))}
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm mb-8">
          <div className="relative">
            <textarea
              className="w-full p-4 pr-12 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 min-h-[120px] resize-none text-gray-700"
              placeholder="Enter your jewellery detail here... (e.g., A gold ring with a large emerald center stone surrounded by small diamonds)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-purple-600 transition-colors"
              title="Upload reference image"
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <PaperclipIcon className="w-4 h-4" />
                <span className="font-medium">{selectedFile.name}</span>
              </div>
              {editMode && (
                <p className="mt-2 text-xs text-gray-500">
                  📍 Click on the preview image below to set the edit point
                  <br />
                  Current hotspot: <span className="font-mono">x:{hotspot.x}, y:{hotspot.y}</span>
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 md:flex-none md:px-12 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <SparklesIcon className="w-5 h-5 animate-spin" />
                  <span>{editMode ? 'Editing...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>{editMode ? 'Apply Edit' : 'Generate'}</span>
                </>
              )}
            </button>

            {(generatedImage || selectedFile) && (
              <button
                onClick={handleReset}
                className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {generatedImage && (
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-serif text-center mb-6 text-gray-800">
              {editMode ? 'Click Image to Set Edit Point' : 'Your Design'}
            </h2>
            <div className="relative flex justify-center">
              <img
                ref={imageRef}
                src={generatedImage}
                alt="Generated jewelry design"
                onClick={handleImageClick}
                className={`max-w-full max-h-[500px] object-contain rounded-2xl shadow-lg ${
                  editMode ? 'cursor-crosshair ring-4 ring-purple-200' : ''
                }`}
              />
              {editMode && hotspot.x > 0 && hotspot.y > 0 && (
                <div
                  className="absolute w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg pointer-events-none"
                  style={{
                    left: `${(hotspot.x / (imageRef.current?.naturalWidth || 1)) * (imageRef.current?.width || 1)}px`,
                    top: `${(hotspot.y / (imageRef.current?.naturalHeight || 1)) * (imageRef.current?.height || 1)}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>
            {!editMode && (
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={() => {
                    // Convert base64 to blob for re-editing
                    if (generatedImage.startsWith('data:')) {
                      fetch(generatedImage)
                        .then(res => res.blob())
                        .then(blob => {
                          const file = new File([blob], "generated-design.png", { type: "image/png" });
                          setSelectedFile(file);
                          setEditMode(true);
                        });
                    }
                  }}
                  className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-colors"
                >
                  Edit Design
                </button>
                <a
                  href={generatedImage}
                  download="rhayze-jewelry-design.png"
                  className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center">
              <SparklesIcon className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold mb-2">Creating Your Masterpiece</h3>
              <p className="text-gray-600">
                {editMode ? 'Applying your edits...' : 'Generating your custom jewelry design...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}