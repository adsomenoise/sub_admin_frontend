import React, { useState, useRef } from 'react';
import axios from 'axios';

function OrderModal({ order, isOpen, onClose, onOrderUpdate }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showThankYou, setShowThankYou] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [uploadedVideoId, setUploadedVideoId] = useState(null);
    const [showOnProfile, setShowOnProfile] = useState(false);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';
    const jwt = localStorage.getItem('jwt');

    if (!isOpen || !order) return null;

    const startRecording = async () => {
        try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        const chunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
            chunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            setRecordedBlob(blob);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        } catch (error) {
        console.error('Error starting recording:', error);
        alert('Kon camera/microfoon niet toegang krijgen');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        }
    };

    const uploadVideo = async (videoFile, isRecorded = false) => {
        setUploading(true);
        setUploadProgress(0);

        try {
        const formData = new FormData();
        const fileName = isRecorded 
            ? `recorded_video_order_${order.documentId}_${Date.now()}.webm`
            : videoFile.name;
        
        formData.append('files', videoFile, fileName);
        
        // Upload video file
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
            headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${jwt}`,
            },
            onUploadProgress: (progressEvent) => {
            const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
            },
        });

        const uploadedFile = uploadRes.data[0];
        
        // Update order with video in 'orderVideo' field
        const updateRes = await axios.put(
            `${API_BASE_URL}/api/orders/${order.documentId}`,
            {
            data: {
                orderVideo: [uploadedFile.id]
            }
            },
            {
            headers: { Authorization: `Bearer ${jwt}` },
            }
        );
        setRecordedBlob(null);
        setUploadedVideoId(uploadedFile.id);
        
        // Update parent component
        if (onOrderUpdate) {
            onOrderUpdate(updateRes.data.data);
        }
        
        // Show confirmation screen instead of completing immediately
        setShowConfirmation(true);
        } catch (error) {
        console.error('Upload error:', error);
        alert('Fout bij uploaden van video');
        } finally {
        setUploading(false);
        setUploadProgress(0);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
        uploadVideo(file, false);
        }
    };

    const handleRecordedUpload = () => {
        if (recordedBlob) {
        uploadVideo(recordedBlob, true);
        }
    };

    const handleCloseThankYou = () => {
        setShowThankYou(false);
        setShowOnProfile(false); // Reset checkbox state
        onClose();
    };

    const handleConfirmOrder = async () => {
        try {
            // Increment completed orders count for the talent
            if (order.talent) {
                // First get all talents to find the correct ID
                const allTalentsRes = await axios.get(`${API_BASE_URL}/api/talents`, {
                    headers: { Authorization: `Bearer ${jwt}` }
                });
                
                // Find our talent in the list
                const talents = allTalentsRes.data.data || allTalentsRes.data || [];
                const matchingTalent = talents.find(t => 
                    t.id === order.talent.id || 
                    t.documentId === order.talent.documentId
                );
                
                if (matchingTalent) {
                    // Use the correct ID from the talent list
                    const correctId = matchingTalent.documentId || matchingTalent.id;
                    console.log('Talent ID being used:', correctId);
                    
                    // Now get the talent WITH videos populated to get current videos
                    const talentWithVideosRes = await axios.get(`${API_BASE_URL}/api/talents/${correctId}?populate=videos`, {
                        headers: { Authorization: `Bearer ${jwt}` }
                    });
                    
                    const talentWithVideos = talentWithVideosRes.data.data || talentWithVideosRes.data;
                    console.log('Talent with videos data:', talentWithVideos);
                    
                    // Get current completedOrders count from the original talent data
                    const currentCount = matchingTalent.completedOrders || matchingTalent.attributes?.completedOrders || 0;
                    const newCount = parseInt(currentCount) + 1;
                    
                    // Prepare update data
                    const updateData = {
                        completedOrders: newCount
                    };
                    
                    // If showOnProfile is true, add the video to talent's videos
                    if (showOnProfile && uploadedVideoId) {
                        try {
                            // Get current videos from the talent WITH videos populated
                            const currentVideos = talentWithVideos.videos || talentWithVideos.attributes?.videos || [];
                            console.log('Current videos found:', currentVideos);
                            
                            // Extract existing video IDs
                            let videoIds = [];
                            if (Array.isArray(currentVideos)) {
                                videoIds = currentVideos.map(v => {
                                    if (typeof v === 'object' && v !== null) {
                                        return v.id || v.documentId;
                                    }
                                    return v;
                                }).filter(id => id); // Remove any null/undefined IDs
                            }
                            
                            console.log('Existing video IDs:', videoIds);
                            
                            // Add the new video ID
                            videoIds.push(uploadedVideoId);
                            console.log('Video IDs after adding new:', videoIds);
                            
                            // Limit to 10 videos - remove oldest if exceeding limit
                            if (videoIds.length > 10) {
                                videoIds = videoIds.slice(-10); // Keep only the last 10 videos
                            }
                            
                            updateData.videos = videoIds;
                        } catch (videoError) {
                            console.error('Error handling videos, adding as first video:', videoError);
                            // Fallback: just add the new video
                            updateData.videos = [uploadedVideoId];
                        }
                    }
                    
                    // Update talent's completed orders count and optionally videos
                    await axios.put(
                        `${API_BASE_URL}/api/talents/${correctId}`,
                        {
                            data: updateData
                        },
                        {
                            headers: { Authorization: `Bearer ${jwt}` }
                        }
                    );
                }
            }
            
            setShowConfirmation(false);
            setShowThankYou(true);
        } catch (error) {
            console.error('Error confirming order:', error);
            alert('Fout bij bevestigen van order');
        }
    };

    const handleCancelConfirmation = async () => {
        try {
            // Remove the video from the order if it was uploaded
            if (uploadedVideoId) {
                await axios.put(
                    `${API_BASE_URL}/api/orders/${order.documentId}`,
                    {
                        data: {
                            orderVideo: null
                        }
                    },
                    {
                        headers: { Authorization: `Bearer ${jwt}` },
                    }
                );
                
                // Also delete the uploaded file from Strapi media library
                try {
                    await axios.delete(`${API_BASE_URL}/api/upload/files/${uploadedVideoId}`, {
                        headers: { Authorization: `Bearer ${jwt}` },
                    });
                } catch (deleteError) {
                    console.log('Could not delete file from media library:', deleteError);
                    // Continue even if file deletion fails
                }
            }
            
            setShowConfirmation(false);
            setUploadedVideoId(null);
            setShowOnProfile(false); // Reset checkbox state
            
            // Update parent component to reflect the removed video
            if (onOrderUpdate) {
                // Create updated order object without video
                const updatedOrder = { 
                    ...order, 
                    orderVideo: null 
                };
                onOrderUpdate(updatedOrder);
            }
        } catch (error) {
            console.error('Error canceling confirmation:', error);
            alert('Fout bij annuleren van bevestiging');
            setShowConfirmation(false);
            setUploadedVideoId(null);
            setShowOnProfile(false); // Reset checkbox state
        }
    };

    // Show confirmation modal after video upload
    if (showConfirmation) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">📋</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Order bevestigen
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Video is succesvol geüpload voor {order.to}.
                        </p>
                        <p className="text-gray-600 mb-4">
                            Wil je deze order als voltooid markeren? Dit zal het aantal voltooide orders voor dit talent verhogen.
                        </p>
                        
                        {/* Checkbox for profile display */}
                        <div className="flex items-center justify-center mb-4">
                            <input
                                type="checkbox"
                                id="showOnProfile"
                                checked={showOnProfile}
                                onChange={(e) => setShowOnProfile(e.target.checked)}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showOnProfile" className="text-sm text-gray-700 font-medium">
                                Video weergeven op profiel
                            </label>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancelConfirmation}
                            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-medium"
                        >
                            Annuleren
                        </button>
                        <button
                            onClick={handleConfirmOrder}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
                        >
                            Bevestigen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show thank you modal if upload was successful
    if (showThankYou) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Thank you for your submission!
                        </h2>
                        <p className="text-gray-600">
                            Your video has been successfully uploaded for {order.to}.
                        </p>
                    </div>
                    
                    <button
                        onClick={handleCloseThankYou}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Take a look at the other orders
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                Order for {order.to}
                </h2>
                <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                ×
                </button>
            </div>

            {/* Order Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Bestelling Info</h3>
                <div className="bg-gray-50 text-black p-4 rounded">
                    <p><strong>Van:</strong> {order.from}</p>
                    <p><strong>Voor:</strong> {order.to}</p>
                    <p><strong>Gelegenheid:</strong> {order.gelegenheid}</p>
                    <p><strong>Email:</strong> {order.userEmail}</p>
                    <p><strong>Telefoon:</strong> {order.phoneNumber}</p>
                    <p><strong>Aangemaakt:</strong> {new Date(order.createdAt).toLocaleString('nl-NL')}</p>
                </div>
                </div>

                <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Bericht</h3>
                <div className="bg-gray-50 p-4 text-black rounded">
                    <p className="whitespace-pre-wrap">{order.requestDescription}</p>
                </div>
                
                </div>
            </div>

            {/* Video Section */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Video</h3>
                
                {/* Camera preview when recording */}
                {isRecording && (
                <div className="mb-4">
                    <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full max-w-md mx-auto rounded border"
                    />
                </div>
                )}

                {/* Recorded video preview */}
                {recordedBlob && (
                <div className="mb-4">
                    <video
                    src={URL.createObjectURL(recordedBlob)}
                    controls
                    className="w-full max-w-md mx-auto rounded border"
                    />
                </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                <div className="mb-4">
                    <div className="bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Uploaden... {uploadProgress}%</p>
                </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                {!isRecording && !recordedBlob && (
                    <>
                    {/* Record Video Button */}
                    <button
                        onClick={startRecording}
                        disabled={uploading}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                    >
                        <span>📹</span>
                        Video opnemen
                    </button>

                    {/* Upload File Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                    >
                        <span>📁</span>
                        Video uploaden
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="video/*"
                        className="hidden"
                    />
                    </>
                )}

                {isRecording && (
                    <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
                    >
                    <span>⏹️</span>
                    Stop opname
                    </button>
                )}

                {recordedBlob && (
                    <>
                    <button
                        onClick={handleRecordedUpload}
                        disabled={uploading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                    >
                        <span>⬆️</span>
                        Opname uploaden
                    </button>
                    <button
                        onClick={() => setRecordedBlob(null)}
                        disabled={uploading}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                        Verwijderen
                    </button>
                    </>
                )}
                </div>

                {/* Existing video info */}
                {order.orderVideo && (
                <div className="mt-4 p-4 bg-green-50 rounded">
                    <p className="text-green-800">
                    <strong>✅ Video al geüpload voor deze order</strong>
                    </p>
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    );
    }

export default OrderModal;
