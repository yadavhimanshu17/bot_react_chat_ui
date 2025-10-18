
import React, { useState, useEffect } from 'react';
import ChatWidget from './components/ChatWidget';
import { fetchClientDetails } from './services/api';

const App = () => {
  const [clientConfig, setClientConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const dynamicClientId = urlParams.get('client_id');

  useEffect(() => {
    const loadConfig = async () => {
      if (!dynamicClientId) {
        setError("Client ID is missing in the URL.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchClientDetails(dynamicClientId);

        if (data) {
          setClientConfig(data);
        } else {
          setError(`Client ID ${dynamicClientId} not found in DB.`);
        }
      } catch (err) {
        console.error("Configuration fetching failed:", err);
        setError("Error connecting to configuration server.");
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [dynamicClientId]); // Yeh sirf client ID change hone par chalega


  if (isLoading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Client Configuration...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: 'red', border: '2px solid red', margin: '50px' }}>
        <h1>Configuration Error</h1>
        <p>{error}</p>
        <p>Please ensure the Central Gateway is running and accessible at {process.env.BASE_URL} (if applicable).</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bot Chat Demo: {clientConfig.client_name}</h1>
      {/* chatwidget loading */}
      <ChatWidget clientId={clientConfig.client_id} clientConfig={clientConfig} />
    </div>
  );
};

export default App;