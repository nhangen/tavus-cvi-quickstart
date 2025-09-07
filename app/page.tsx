"use client";
import { useState, useEffect } from "react";

interface Conversation {
  conversation_id: string;
  conversation_name?: string;
  created_at: string;
  status: string;
}

interface GeneratedVideo {
  video_id: string;
  video_name: string;
  status: string;
  download_url?: string;
  hosted_url?: string;
  stream_url?: string;
}

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [videoScript, setVideoScript] = useState("");
  const [videoName, setVideoName] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  const start = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/start", { method: "POST" });
      const data = await res.json();
      setUrl(data.conversation_url);
      setCurrentConversationId(data.conversation_id || null);
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    setGeneratingVideo(true);
    try {
      const res = await fetch("/api/generate-video", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: videoScript,
          video_name: videoName || undefined,
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error("Video generation API error:", data);
        alert(`Error: ${data.error || 'Failed to generate video'}`);
        return;
      }
      
      if (data.video_id) {
        setShowVideoOptions(false);
        setVideoScript("");
        setVideoName("");
        alert("Video generation started! Refreshing video list...");
        // Refresh the videos list to show the new video
        loadGeneratedVideos();
      } else {
        console.error("No video ID in response:", data);
        alert("Error: No video ID received");
      }
    } catch (err) {
      console.error("Failed to generate video:", err);
      alert("Error: Failed to generate video");
    } finally {
      setGeneratingVideo(false);
    }
  };

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : data.conversations || []);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const rejoinConversation = async (conversationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (res.ok) {
        const conversation = await res.json();
        if (conversation.conversation_url) {
          setUrl(conversation.conversation_url);
          setCurrentConversationId(conversationId);
        } else {
          console.error("No conversation URL available");
        }
      }
    } catch (err) {
      console.error("Failed to rejoin conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkVideoStatus = async (videoId: string) => {
    try {
      const res = await fetch(`/api/videos/${videoId}`);
      if (res.ok) {
        const video = await res.json();
        setGeneratedVideos(prev => 
          prev.map(v => 
            v.video_id === videoId 
              ? { ...v, status: video.status, download_url: video.download_url, hosted_url: video.hosted_url, stream_url: video.stream_url }
              : v
          )
        );
        return video;
      }
    } catch (err) {
      console.error("Failed to check video status:", err);
    }
  };

  const loadGeneratedVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch("/api/videos");
      if (res.ok) {
        const data = await res.json();
        const videos = Array.isArray(data) ? data : data.data || [];
        setGeneratedVideos(videos.map((v: any) => ({
          video_id: v.video_id,
          video_name: v.video_name || `Video ${v.video_id.slice(0, 8)}`,
          status: v.status,
          download_url: v.download_url,
          hosted_url: v.hosted_url,
          stream_url: v.stream_url,
        })));
      }
    } catch (err) {
      console.error("Failed to load generated videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const refreshVideoStatuses = async () => {
    await loadGeneratedVideos();
  };

  useEffect(() => {
    loadConversations();
    loadGeneratedVideos();
  }, []);

  // Auto-refresh video statuses every 30 seconds if there are pending videos
  useEffect(() => {
    const pendingVideos = generatedVideos.filter(v => v.status === 'processing' || v.status === 'queued');
    
    if (pendingVideos.length > 0) {
      const interval = setInterval(() => {
        refreshVideoStatuses();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [generatedVideos]);

  return (
    <div className="min-h-screen">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-primary-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-primary-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Video Conversations
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">Tavus CVI</span>
              <br />
              <span className="text-gray-700">Quickstart</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience the future of video conversations. Clone the repo, set your environment variables, and start chatting with our intelligent avatar—no camera required.
            </p>
          </div>

          {/* Main Content Card */}
          <div className="card max-w-3xl mx-auto animate-slide-up">
            {!url ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Ready to Start Your Conversation?
                </h2>
                
                <p className="text-gray-600 mb-8">
                  Choose how you'd like to create your Tavus conversation.
                </p>
                
                {!showVideoOptions ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={start}
                      disabled={loading}
                      className="btn-primary inline-flex items-center gap-2 text-lg"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Initializing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Quick Start
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowVideoOptions(true)}
                      className="btn-secondary inline-flex items-center gap-2 text-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Generate Video
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-left space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={videoName}
                          onChange={(e) => setVideoName(e.target.value)}
                          placeholder="My AI Video"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Script <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={videoScript}
                          onChange={(e) => setVideoScript(e.target.value)}
                          placeholder="Write what you want your replica to say in the video..."
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Keep it under 5 minutes for best quality and engagement.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={generateVideo}
                        disabled={generatingVideo || !videoScript.trim()}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        {generatingVideo ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Generate Video
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setShowVideoOptions(false)}
                        className="btn-secondary"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Your AI Conversation</h2>
                    <p className="text-gray-600">Your Tavus CVI session is ready!</p>
                  </div>
                  <button
                    onClick={() => setUrl(null)}
                    className="btn-secondary text-sm"
                  >
                    New Session
                  </button>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse-soft"></div>
                      <span className="text-white text-xs font-medium">Live</span>
                    </div>
                  </div>
                  
                  <iframe
                    src={url}
                    title="Tavus CVI"
                    allow="microphone; camera"
                    className="w-full h-[520px] border-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stored Conversations Section */}
          {conversations.length > 0 && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Previous Conversations</h3>
                  <button
                    onClick={loadConversations}
                    disabled={loadingConversations}
                    className="btn-secondary text-sm"
                  >
                    {loadingConversations ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Refresh
                  </button>
                </div>
                
                <div className="space-y-3">
                  {conversations.slice(0, 5).map((conversation) => (
                    <div
                      key={conversation.conversation_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {conversation.conversation_name || `Conversation ${conversation.conversation_id.slice(0, 8)}`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(conversation.created_at).toLocaleDateString()} • Status: {conversation.status}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {conversation.status === 'active' && conversation.conversation_id !== currentConversationId && (
                          <button
                            onClick={() => rejoinConversation(conversation.conversation_id)}
                            disabled={loading}
                            className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                          >
                            {loading ? 'Joining...' : 'Rejoin'}
                          </button>
                        )}
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          conversation.status === 'ended' 
                            ? 'bg-green-100 text-green-800' 
                            : conversation.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.status}
                        </span>
                        
                        {conversation.conversation_id === currentConversationId && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {conversations.length > 5 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Showing 5 of {conversations.length} conversations
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generated Videos Section */}
          {generatedVideos.length > 0 && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Generated Videos</h3>
                  <button
                    onClick={refreshVideoStatuses}
                    disabled={loadingVideos}
                    className="btn-secondary text-sm"
                  >
                    {loadingVideos ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Refresh Status
                  </button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {generatedVideos.map((video) => (
                    <div
                      key={video.video_id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {video.video_name || `Video ${video.video_id.slice(0, 8)}`}
                          </h4>
                          <p className="text-sm text-gray-500">
                            ID: {video.video_id.slice(0, 12)}...
                          </p>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          video.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : video.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : video.status === 'queued'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                      
                      {/* Show video player for completed videos */}
                      {video.status === 'completed' && (video.hosted_url || video.stream_url || video.download_url) && (
                        <div className="mt-3">
                          {(video.stream_url || video.hosted_url) && (
                            <video 
                              controls 
                              className="w-full rounded-lg mb-2"
                              style={{ maxHeight: '200px' }}
                            >
                              <source src={video.stream_url || video.hosted_url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          
                          <div className="flex gap-2">
                            {video.hosted_url && (
                              <a
                                href={video.hosted_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-xs inline-flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open Video
                              </a>
                            )}
                            
                            {video.download_url && (
                              <a
                                href={video.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-xs inline-flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Show links for any video with URLs, even if not completed */}
                      {video.status !== 'completed' && (video.hosted_url || video.download_url) && (
                        <div className="mt-3">
                          <div className="flex gap-2">
                            {video.hosted_url && (
                              <a
                                href={video.hosted_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-xs inline-flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Page
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {video.status === 'processing' && (
                        <div className="mt-3 flex items-center text-sm text-blue-600">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating video...
                        </div>
                      )}
                      
                      {video.status === 'queued' && (
                        <div className="mt-3 flex items-center text-sm text-yellow-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Queued for processing...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Instant Setup",
                description: "Get started in minutes with our streamlined quickstart process."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Text-to-Video",
                description: "Generate AI videos from text scripts using your trained replica - no webcam needed."
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: "Custom Context", 
                description: "Provide conversation context and prompts to guide behavior and responses."
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
