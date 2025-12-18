import React, { useState, useEffect } from 'react';
import DynamicForm from './components/DynamicForm';
import { FormData, FormValues } from './types/form.types';
import './App.css';
import demoData from './data.json';

function App() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load form data from API or local file
  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Option 1: Load from API (uncomment and update URL when ready)
      // const response = await fetch('YOUR_API_ENDPOINT_HERE');
      // if (!response.ok) throw new Error('Failed to fetch form data');
      // const data = await response.json();
      // setFormData(data);

      // Option 2: Load from local JSON file (for development)
      // const response = await fetch('/data.json');
      // if (!response.ok) throw new Error('Failed to load form data');
      // const data: FormData = await response.json();
      // setFormData(data);
      setFormData(demoData as FormData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading form data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Process file values (convert File objects to base64 or prepare for upload)
      const processedValues: FormValues = {};
      
      for (const [key, value] of Object.entries(values)) {
        if (value instanceof File) {
          // Convert single file to base64 (or you can upload to server)
          processedValues[key] = await fileToBase64(value);
        } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
          // Convert array of files to base64 array
          processedValues[key] = await Promise.all(value.map(fileToBase64));
        } else {
          processedValues[key] = value;
        }
      }

      console.log('Form Submitted!');
      console.log('All Form Values:', processedValues);
      
      setSubmittedValues(processedValues);
      setSubmitSuccess(true);

      // You can also send this to an API here
      // const response = await fetch('YOUR_SUBMIT_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(processedValues)
      // });
      // if (!response.ok) throw new Error('Failed to submit form');
      // const result = await response.json();
      
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit form');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-container">
          <h2>Error Loading Form</h2>
          <p>{error}</p>
          <button onClick={loadFormData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {submitSuccess && (
        <div className="success-banner">
          <span className="success-icon">✓</span>
          <span>Form submitted successfully!</span>
          <button onClick={() => setSubmitSuccess(false)} className="close-banner-btn">×</button>
        </div>
      )}
      
      {submitError && (
        <div className="error-banner">
          <span className="error-icon">⚠</span>
          <span>{submitError}</span>
          <button onClick={() => setSubmitError(null)} className="close-banner-btn">×</button>
        </div>
      )}

      <DynamicForm formData={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      
      {submittedValues && (
        <div className="submitted-data">
          <h2>Submitted Form Data</h2>
          <div className="data-display">
            <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
          </div>
          <div className="data-actions">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(submittedValues, null, 2));
                alert('Data copied to clipboard!');
              }}
              className="copy-button"
            >
              Copy to Clipboard
            </button>
            <button 
              onClick={() => {
                setSubmittedValues(null);
                setSubmitSuccess(false);
              }} 
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
