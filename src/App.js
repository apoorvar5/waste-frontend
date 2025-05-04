import { useState, useRef } from 'react';

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const resultsSectionRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();
  const triggerCameraInput = () => cameraInputRef.current.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image first');
      return;
    }
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch('https://waste-backend.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      if (data.confidence < 0.85) {
        alert("The model is not confident enough about this classification. We're working on deploying an even stronger model to improve predictions.");
        resetForm();
        return;
      }

      setResult(data);
      if (resultsSectionRef.current) {
        resultsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setError(`Failed to process image: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const getBinColor = (wasteType) => {
    const type = wasteType?.toLowerCase() || '';
    if (type.includes('recycle')) return 'text-blue-400';
    if (type.includes('food') || type.includes('organic')) return 'text-green-400';
    return 'text-purple-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-teal-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-center">BinSmart</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10 flex-grow">
        <section className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-teal-300">Why Waste Classification Matters</h2>
          <p className="text-gray-300">
            Waste classification helps reduce contamination, enables recycling, and minimizes landfill usage. Proper classification can significantly lower carbon emissions—saving up to <strong>0.5 kg of CO₂</strong> per item correctly sorted. Be part of the solution to environmental pollution and climate change by using smart tools like BinSmart.
          </p>
        </section>

        <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <input type="file" ref={cameraInputRef} onChange={handleCameraCapture} accept="image/*" capture="environment" className="hidden" />

              <div className="flex flex-col items-center justify-center">
                {preview ? (
                  <div className="relative w-full max-w-lg">
                    <img src={preview} alt="Preview" className="w-full h-64 object-contain rounded-lg border border-gray-600" />
                    <button type="button" onClick={resetForm} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full">✕</button>
                  </div>
                ) : (
                  <div className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-700">
                    <div className="text-center p-4">
                      <p className="text-gray-300 mb-4">Upload an image or take a photo</p>
                      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
                        <button type="button" onClick={triggerFileInput} className="px-4 py-2 bg-blue-600 text-white rounded-md">📁 Browse Files</button>
                        <button type="button" onClick={triggerCameraInput} className="px-4 py-2 bg-purple-600 text-white rounded-md">📷 Take Photo</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && <div className="p-3 bg-red-200 border border-red-400 text-red-900 rounded-md">{error}</div>}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!image || isLoading}
                  className={`px-6 py-3 rounded-md text-white font-medium ${!image || isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} transition-colors w-full md:w-auto`}
                >
                  {isLoading ? 'Processing...' : 'Classify Waste'}
                </button>
              </div>
            </form>

            {result && (
              <div ref={resultsSectionRef} className="mt-8 pt-8 border-t border-gray-600">
                <h2 className="text-xl font-bold mb-6 text-center text-teal-300">Classification Results</h2>
                <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 max-w-lg mx-auto">
                  <div className="mb-5 text-center">
                    <p className="text-lg">
                      This goes into <span className={`font-bold text-xl ${getBinColor(result.prediction)}`}>{result.prediction}</span> bin
                    </p>
                  </div>

                  <div className="mb-5">
                    <p className="text-gray-200 font-medium mb-2">Confidence:</p>
                    <div className="w-full bg-gray-600 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: `${result.confidence * 100}%` }}></div>
                    </div>
                    <p className="text-right text-sm text-gray-300 mt-1">{(result.confidence * 100).toFixed(1)}%</p>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-green-400 font-medium">You've helped avoid approximately 0.5 kg of CO₂ emissions by disposing waste correctly!</p>
                  </div>

                  <div className="mt-6 text-center">
                    <button onClick={resetForm} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Classify Another Image</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-6 bg-gray-950 text-gray-300">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm mb-2">© {new Date().getFullYear()} BinSmart</p>
          <a href="mailto:apoorva-sanjay.rumale.462@my.csun.edu" className="text-teal-400 hover:underline">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
