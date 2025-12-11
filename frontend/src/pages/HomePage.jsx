import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogIn, Video, Users, MessageCircle, Zap } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { CreateRoomModal } from '../components/room/CreateRoomModal';
import { JoinRoomModal } from '../components/room/JoinRoomModal';
import { roomAPI } from '../services/api';
import { useSocketStore } from '../stores/socketStore';
import toast from 'react-hot-toast';

/**
 * HomePage Component
 * Landing page with room creation and joining
 */
export const HomePage = () => {
  const navigate = useNavigate();
  const { connect } = useSocketStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (data) => {
    try {
      setLoading(true);

      // Initialize socket connection
      connect();

      // Create room via API
      const response = await roomAPI.createRoom(data.name, data.createdBy);

      if (response.success) {
        const { roomCode } = response.data;
        toast.success('Room created successfully!');
        
        // Navigate to room with user info
        navigate(`/room/${roomCode}`, {
          state: { userName: data.createdBy, isCreator: true },
        });
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (data) => {
    try {
      setLoading(true);

      // Initialize socket connection
      connect();

      // Verify room exists
      const response = await roomAPI.getRoomByCode(data.roomCode);

      if (response.success) {
        toast.success('Joining room...');
        
        // Navigate to room with user info
        navigate(`/room/${data.roomCode}`, {
          state: { userName: data.userName, isCreator: false },
        });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Room not found');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Video,
      title: 'Synchronized Playback',
      description: 'Watch videos in perfect sync with your friends',
    },
    {
      icon: Users,
      title: 'Multiple Participants',
      description: 'Invite unlimited friends to watch together',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat in real-time while watching',
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'Create a room in seconds, no registration needed',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4">
            Watch Videos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mt-1">
              Together
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Create a room, share the code, and enjoy synchronized video watching
            with friends in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Room
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowJoinModal(true)}
              className="w-full sm:w-auto"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Join Room
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 mt-16 animate-slide-up">
          {features.map((feature, index) => (
            <Card key={index} variant="glass" hover>
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto animate-slide-up">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Create a Room
              </h3>
              <p className="text-gray-400 text-sm">
                Click "Create Room" and give it a name
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Share the Code
              </h3>
              <p className="text-gray-400 text-sm">
                Share the room code with your friends
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Watch Together
              </h3>
              <p className="text-gray-400 text-sm">
                Paste a video URL and enjoy watching together!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoom}
        loading={loading}
      />

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinRoom}
        loading={loading}
      />
    </div>
  );
};

export default HomePage;
