import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Square, ArrowLeft, BarChart3, Users, Clock, Phone, User, CheckCircle } from 'lucide-react';
import apiService from '../services/api';

const SaleSessionScreen = ({ user, onNavigate }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const recognition = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

          recognition.current.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            if (finalTranscript) {
              setTranscript(prev => prev + finalTranscript);
            }
          };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startSession = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please fill in customer details');
      return;
    }
    setSessionActive(true);
    setSessionTime(0);
    setTranscript('');
    setRecording(true);
    // Start timer
    intervalRef.current = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    // Start mic recording automatically
    if (recognition.current) {
      recognition.current.start();
    }
  };

  const endSession = async () => {
    setSessionActive(false);
    setRecording(false);
    if (recognition.current) {
      recognition.current.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Validate required fields
    if (!user?.id || !customerName.trim() || !customerPhone.trim()) {
      alert('Please ensure all required fields are filled before ending the session.');
      return;
    }
    if (!transcript.trim()) {
      alert('No conversation recorded. Please speak into the mic before ending the session.');
      return;
    }
    // Save session data
    const sessionData = {
      salespersonId: user.id,
      customerName,
      customerPhone,
      transcript,
      duration: sessionTime,
      organizationId: user.organizationId,
      zoneId: user.zoneId,
      storeId: user.storeId
    };
    console.log('Saving session to backend:', sessionData);
    try {
      const sessionResponse = await apiService.createSession(sessionData);
      // Automatically analyze session after saving
      setSessionSaved(true);
      setAnalyzing(true);
      await apiService.analyzeSession(sessionResponse.session.id);
      setAnalysisReady({
        session: sessionResponse.session,
        customer: {
          name: customerName,
          phone: customerPhone,
          id: sessionResponse.session.customer // If backend returns customer id
        }
      });
    } catch (error) {
      alert('Failed to save session or analyze. Please check your connection and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ...existing code...

  const toggleRecording = () => {
    if (!sessionActive) return;

    if (recording) {
      recognition.current?.stop();
      setRecording(false);
    } else {
      recognition.current?.start();
      setRecording(true);
    }
  };

  const analyzeSession = async () => {
    if (!transcript.trim()) {
      alert('No conversation to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      // Create session in backend
      const sessionData = {
        salespersonId: user.id,
        customerName,
        customerPhone,
        transcript,
        duration: sessionTime,
        organizationId: user.organizationId,
        zoneId: user.zoneId,
        storeId: user.storeId
      };
      const sessionResponse = await apiService.createSession(sessionData);
      // Analyze session
      await apiService.analyzeSession(sessionResponse.session.id);
      // Save real session and customer for navigation
      setAnalysisReady({
        session: sessionResponse.session,
        customer: {
          name: customerName,
          phone: customerPhone,
          id: sessionResponse.session.customer // If backend returns customer id
        }
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Sale Session</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={sessionActive}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={sessionActive}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Enter customer phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Session Controls */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {formatTime(sessionTime)}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                sessionActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {sessionActive ? 'Session Active' : 'Session Inactive'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {!sessionActive && !sessionSaved ? (
                <button
                  onClick={startSession}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Sale Session
                </button>
              ) : null}
              {sessionActive && !sessionSaved && (
                <button
                  onClick={endSession}
                  className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square className="h-5 w-5 mr-2" />
                  End Session
                </button>
              )}
              {sessionActive && !sessionSaved && (
                <button
                  onClick={toggleRecording}
                  disabled={!sessionActive}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg transition-colors ${
                    recording
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                  }`}
                >
                  {recording ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                  {recording ? 'Stop Recording' : 'Start Recording'}
                </button>
              )}
              {sessionSaved && (
                <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Session saved successfully!</span>
                </div>
              )}
            </div>

            {/* Recording Indicator */}
            {recording && (
              <div className="flex items-center justify-center py-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm text-red-600 font-medium">Recording...</span>
              </div>
            )}
          </div>

          {/* Transcript (mic only) */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Transcript</h3>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 min-h-[120px]">
              {transcript || <span className="text-gray-400">Speak into the mic to record the conversation...</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {analyzing && (
              <div className="flex items-center px-6 py-3 bg-purple-100 text-purple-800 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
                <span className="font-semibold">Analyzing sale...</span>
              </div>
            )}
            {analysisReady && (
              <button
                onClick={() => onNavigate('analytics', {
                  customer: analysisReady.customer,
                  session: analysisReady.session,
                  fromCustomerDashboard: true
                })}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleSessionScreen;