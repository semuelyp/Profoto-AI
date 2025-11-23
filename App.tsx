import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { generateProductVariations } from './services/geminiService';
import { AppStatus, GeneratedImageResult } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedResults, setGeneratedResults] = useState<GeneratedImageResult[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMessage("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedResults([]);
        setStatus(AppStatus.IDLE);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) {
      setErrorMessage("Silakan unggah gambar produk terlebih dahulu.");
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setErrorMessage(null);
    setGeneratedResults([]); // Clear previous results

    try {
      const results = await generateProductVariations(originalImage, prompt);
      setGeneratedResults(results);
      setStatus(AppStatus.SUCCESS);
    } catch (error: any) {
      setStatus(AppStatus.ERROR);
      setErrorMessage(error.message || "Terjadi kesalahan saat memproses gambar.");
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedResults([]);
    setPrompt('');
    setStatus(AppStatus.IDLE);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Studio Produk <span className="text-indigo-600">Otomatis</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Upload foto produk Anda. AI akan otomatis membuat 4 variasi gaya profesional (Studio, Mewah, Alam, Modern). Tanpa perlu mengetik prompt!
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Input (Takes 1/3 width on large screens) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="space-y-6">
              
              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1. Upload Foto Asli</label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl relative hover:bg-gray-50 transition-colors ${!originalImage ? 'border-gray-300' : 'border-indigo-300 bg-indigo-50'}`}
                >
                  <div className="space-y-1 text-center">
                    {originalImage ? (
                       <div className="relative">
                         <img 
                           src={originalImage} 
                           alt="Original" 
                           className="mx-auto h-48 object-contain rounded-lg shadow-sm" 
                         />
                         <button 
                            onClick={handleReset}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 focus:outline-none"
                            title="Hapus gambar"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                           </svg>
                         </button>
                       </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only" 
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleFileChange}
                              disabled={status === AppStatus.PROCESSING}
                            />
                          </label>
                          <p className="pl-1">atau drop disini</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Prompt Input */}
              <div className={!originalImage ? 'opacity-50 pointer-events-none grayscale' : ''}>
                 <PromptInput 
                    prompt={prompt} 
                    setPrompt={setPrompt} 
                    disabled={status === AppStatus.PROCESSING}
                    onSubmit={handleGenerate}
                 />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={!originalImage || status === AppStatus.PROCESSING}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                    ${(!originalImage || status === AppStatus.PROCESSING) 
                      ? 'bg-indigo-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition hover:-translate-y-0.5'
                    }`}
                >
                  {status === AppStatus.PROCESSING ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Membuat 4 Variasi...
                    </div>
                  ) : (
                    'Generate Otomatis (4 Foto) ✨'
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Output (Takes 2/3 width) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 min-h-[500px] flex flex-col">
             <div className="flex justify-between items-center mb-4">
               <label className="block text-sm font-medium text-gray-700">Hasil AI (4 Variasi)</label>
               {status === AppStatus.SUCCESS && (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                   Selesai
                 </span>
               )}
             </div>

             <div className="flex-grow bg-gray-50 rounded-xl border border-gray-200 p-4">
                
                {/* IDLE State */}
                {status === AppStatus.IDLE && !generatedResults.length && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Hasil 4 variasi foto produk Anda akan muncul di sini.</p>
                  </div>
                )}

                {/* PROCESSING State (Skeleton) */}
                {status === AppStatus.PROCESSING && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-2 shadow-sm animate-pulse flex flex-col">
                         <div className="bg-gray-200 rounded-md aspect-square mb-2"></div>
                         <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SUCCESS State (Grid) */}
                {generatedResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {generatedResults.map((result, index) => (
                       <div key={index} className="bg-white rounded-lg p-2 shadow-sm group relative overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="aspect-square relative overflow-hidden rounded-md bg-gray-100">
                             <img 
                               src={result.imageUrl} 
                               alt={`Variation ${index + 1}`} 
                               className="w-full h-full object-contain"
                             />
                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                               <a 
                                 href={result.imageUrl} 
                                 download={`profoto-variant-${index+1}.png`}
                                 className="bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform scale-95 hover:scale-100 transition-all"
                               >
                                 Download
                               </a>
                             </div>
                          </div>
                          <div className="mt-3 text-center">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1 bg-gray-100 rounded-full">
                              {result.styleName}
                            </span>
                          </div>
                       </div>
                     ))}
                  </div>
                )}
             </div>
          </div>

        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">4 Variasi Instan</h3>
            <p className="mt-2 text-gray-500 text-sm">Sekali klik, dapatkan 4 gaya berbeda: Studio, Mewah, Alam, dan Modern.</p>
          </div>
          <div className="p-6">
            <div className="bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Otomatis Tanpa Prompt</h3>
            <p className="mt-2 text-gray-500 text-sm">Tidak perlu pusing memikirkan kata-kata. AI mengenali produk dan memilihkan background terbaik.</p>
          </div>
          <div className="p-6">
             <div className="bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-indigo-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
               </svg>
             </div>
             <h3 className="text-lg font-bold text-gray-900">Kualitas Profesional</h3>
             <p className="mt-2 text-gray-500 text-sm">Hasil resolusi tinggi yang siap digunakan untuk katalog e-commerce Anda.</p>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;