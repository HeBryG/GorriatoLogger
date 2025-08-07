// src/renderer/components/EQSLUpload.tsx (Updated Example Component)
import React, { useEffect, useState } from 'react';


const EQSLUpload: React.FC = ({ }) => {
  const [eqslUsername, setEqslUsername] = useState('');
  const [eqslPassword, setEqslPassword] = useState(''); // Still needed for input
  const [qthNickname, setQthNickname] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [callsign, setCallsign] = useState<string>('');

  useEffect(() => {
    const lscs = localStorage.getItem('CCS');
    if (lscs) {
        setCallsign(lscs);
        setEqslUsername(lscs);
    }
  }, [])
  const handleSaveCredentials = async () => {
    if (!callsign || !eqslUsername || !eqslPassword) {
      setUploadStatus('Please enter eQSL Callsign and Password to save.');
      return;
    }
    setUploadStatus('Saving credentials...');
    try {
      const success = await window.api.saveEQSLCredentials(eqslUsername, eqslPassword, qthNickname);
      if (success) {
        setUploadStatus('Credentials saved securely!');
      } else {
        setUploadStatus('Failed to save credentials. Encryption might not be available.');
      }
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      setUploadStatus(`Error saving credentials: ${error.message}`);
    }
  };

  const handleUpload = async () => {
    if (!callsign) {
      setUploadStatus('Please select a user first.');
      return;
    }
    if (!eqslUsername) { // Password is now retrieved from storage, but username is needed to identify them
      setUploadStatus('Please enter your eQSL Callsign.');
      return;
    }

    // setIsLoading(true);
    // setUploadStatus('Uploading to eQSL...');

    // try {
    //   // Password is NOT passed from renderer; main process retrieves it
    // //   const result = await window.api.uploadLogsToEQSL(
    // //     userId,
    // //     eqslUsername,
    // //     qthNickname || null
    // //   );
    //   setUploadStatus(result.success ? 'Upload successful!' : `Upload failed: ${result.message}`);
    // } catch (error: any) {
    //   console.error('eQSL upload error:', error);
    //   setUploadStatus(`Upload failed: ${error.message || 'An unknown error occurred.'}`);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className='h-full w-full'>
        <div className="bg-white p-3 mt-20 max-w-[500px] mx-auto my-auto rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-950 mb-4">Upload Logs to eQSL.cc</h2>
            <p className="text-sm text-gray-600 mb-4">
                Enter your eQSL.cc credentials. The password will be stored securely on your system.
                **Warning:** eQSL.cc's API may transmit passwords insecurely. Use with caution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                type="text"
                placeholder="eQSL Callsign"
                value={eqslUsername}
                onChange={(e) => setEqslUsername(e.target.value)}
                className="p-3 border text-gray-950 border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
                <input
                type="password"
                placeholder="eQSL Password"
                value={eqslPassword}
                onChange={(e) => setEqslPassword(e.target.value)}
                className="p-3 border text-gray-950 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                type="text"
                placeholder="eQSL QTH Nickname (Optional)"
                value={qthNickname}
                onChange={(e) => setQthNickname(e.target.value)}
                className="p-3 border text-gray-950 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
            </div>
            <div className="flex space-x-4">
                <button
                onClick={handleSaveCredentials}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md mx-auto hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                Save Credentials
                </button>
                <button
                onClick={handleUpload}
                className={`flex-1 px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-150 ease-in-out ${
                    isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-orange-700'
                }`}
                >
                {isLoading ? 'Uploading...' : 'Upload to eQSL'}
                </button>
            </div>
            {uploadStatus && (
                <p className={`mt-4 text-center ${uploadStatus.includes('failed') ? 'text-gray-950' : 'text-gray-950'}`}>
                {uploadStatus}
                </p>
            )}
            </div>
    </div>
  );
};

export default EQSLUpload;