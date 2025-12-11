import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Share2,
  Info as InfoIcon,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoControls } from '../components/video/VideoControls';
import { URLInput } from '../components/video/URLInput';
import { ChatBox } from '../components/chat/ChatBox';
import { ParticipantList } from '../components/room/ParticipantList';
import { RoomInfo } from '../components/room/RoomInfo';
import { ShareRoomModal } from '../components/room/ShareRoomModal';
import { JoinRoomModal } from '../components/room/JoinRoomModal';
import { FullPageLoading } from '../components/ui/LoadingSpinner';
import { useSocket } from '../hooks/useSocket';
import { useRoom } from '../hooks/useRoom';
import { useVideoSync } from '../hooks/useVideoSync';
import { useRoomStore } from '../stores/roomStore';
import toast from 'react-hot-toast';

/**
 * RoomPage Component
 * Main room interface with video player, chat, and participants
 */
export const RoomPage = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const playerRef = useRef(null);
  const [volume, setVolume] = useState(0.8);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(true);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Initialize socket connection
  const { connected } = useSocket();

  // Get room data from store
  const {
    roomInfo,
    participants,
    currentUser,
    videoState,
    setDuration,
    setCurrentTime,
  } = useRoomStore();

  // Use room hook
  const { joinRoom, leaveRoom, kickUser } = useRoom(roomCode);

  // Use video sync hook
  const { isAdmin, handlePlay, handlePause, handleSeek, handleVideoChange } =
    useVideoSync(roomCode, playerRef);

  // Check if user came with username from navigation state
  const stateUserName = location.state?.userName;

  useEffect(() => {
    if (stateUserName && connected) {
      // Auto-join if username provided
      joinRoom(stateUserName);
      setShowJoinModal(false);
    }
  }, [stateUserName, connected]);

  const handleJoinSubmit = async (data) => {
    if (data.roomCode.toUpperCase() !== roomCode.toUpperCase()) {
      toast.error('Room code does not match');
      return;
    }
    await joinRoom(data.userName);
    setShowJoinModal(false);
  };

  const handleLeaveRoom = () => {
    if (confirm('Are you sure you want to leave this room?')) {
      leaveRoom();
    }
  };

  const handleVideoProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleVideoDuration = (duration) => {
    setDuration(duration);
  };

  const handleFullscreen = () => {
    const playerElement = document.querySelector('.react-player');
    if (playerElement) {
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen();
      } else if (playerElement.webkitRequestFullscreen) {
        playerElement.webkitRequestFullscreen();
      } else if (playerElement.msRequestFullscreen) {
        playerElement.msRequestFullscreen();
      }
    }
  };

  const handleVideoSubmit = async (videoUrl) => {
    try {
      handleVideoChange(videoUrl, '');
    } catch (error) {
      console.error('Error changing video:', error);
      toast.error('Failed to change video');
    }
  };

  const handleKickUser = (participantId) => {
    // Kick user via socket (admin only)
    kickUser(participantId);
  };

  // Show loading if not connected or no room info
  if (!connected || (!roomInfo && !showJoinModal)) {
    return <FullPageLoading text="Connecting to room..." />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRoomInfo(!showRoomInfo)}
        >
          <InfoIcon className="w-4 h-4 mr-2" />
          Room Info
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShareModal(true)}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="danger" size="sm" onClick={handleLeaveRoom}>
          <LogOut className="w-4 h-4 mr-2" />
          Leave
        </Button>
      </Header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Column - Video & Chat */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Video Section */}
            <div className="space-y-4">
              <VideoPlayer
                url={videoState.url}
                playing={videoState.playing}
                volume={volume}
                onPlay={handlePlay}
                onPause={handlePause}
                onProgress={handleVideoProgress}
                onDuration={handleVideoDuration}
                onReady={(player) => {
                  playerRef.current = player;
                }}
                onError={(error) => {
                  console.error('Video error:', error);
                  toast.error('Failed to load video');
                }}
              />

              <VideoControls
                playing={videoState.playing}
                currentTime={videoState.currentTime}
                duration={videoState.duration}
                volume={volume}
                isAdmin={isAdmin}
                onPlay={() => handlePlay()}
                onPause={() => handlePause()}
                onSeek={handleSeek}
                onVolumeChange={setVolume}
                onFullscreen={handleFullscreen}
              />

              <URLInput
                onSubmit={handleVideoSubmit}
                isAdmin={isAdmin}
              />
            </div>

            {/* Chat - Desktop */}
            <div className="hidden md:block flex-1 min-h-[400px]">
              <ChatBox roomCode={roomCode} />
            </div>

            {/* Chat Toggle - Mobile */}
            <div className="md:hidden">
              <Button
                variant="primary"
                onClick={() => setShowMobileChat(!showMobileChat)}
                className="w-full"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                {showMobileChat ? 'Hide Chat' : 'Show Chat'}
              </Button>
            </div>

            {/* Chat - Mobile */}
            {showMobileChat && (
              <div className="md:hidden h-[400px]">
                <ChatBox roomCode={roomCode} />
              </div>
            )}
          </div>

          {/* Right Column - Participants & Room Info */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Room Info - Desktop (shows above participants when toggled) */}
            {showRoomInfo && roomInfo && (
              <div className="hidden lg:block">
                <RoomInfo
                  roomInfo={roomInfo}
                  onClose={() => setShowRoomInfo(false)}
                  onShare={() => setShowShareModal(true)}
                />
              </div>
            )}

            {/* Participants */}
            <div className="h-[400px] lg:h-auto lg:flex-1">
              <ParticipantList
                participants={participants}
                currentUser={currentUser}
                onKickUser={handleKickUser}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {roomInfo && (
        <ShareRoomModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          roomInfo={roomInfo}
        />
      )}

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => navigate('/')}
        onSubmit={handleJoinSubmit}
        loading={false}
        initialRoomCode={roomCode}
      />

      {/* Room Info Modal - Mobile */}
      {roomInfo && (
        <Modal
          isOpen={showRoomInfo}
          onClose={() => setShowRoomInfo(false)}
          title={roomInfo.name}
          size="lg"
          className="lg:hidden"
        >
          <div className="-mt-6">
            <RoomInfo
              roomInfo={roomInfo}
              onClose={() => setShowRoomInfo(false)}
              onShare={() => {
                setShowRoomInfo(false);
                setShowShareModal(true);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RoomPage;
