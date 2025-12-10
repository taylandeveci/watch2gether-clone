import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { joinRoomSchema } from '../../utils/validators';

/**
 * JoinRoomModal Component
 * Modal for joining an existing room
 */
export const JoinRoomModal = ({ isOpen, onClose, onSubmit, loading, initialRoomCode = '' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomCode: initialRoomCode,
      userName: '',
    },
  });

  React.useEffect(() => {
    if (initialRoomCode) {
      setValue('roomCode', initialRoomCode.toUpperCase());
    }
  }, [initialRoomCode, setValue]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleRoomCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    e.target.value = value;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join Room" size="md">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Room code */}
        <Input
          label="Room Code"
          placeholder="Enter 8-character room code..."
          error={errors.roomCode?.message}
          maxLength={8}
          {...register('roomCode')}
          onChange={handleRoomCodeChange}
          className="uppercase font-mono tracking-wider"
        />

        {/* Your name */}
        <Input
          label="Your Name"
          placeholder="Enter your name..."
          error={errors.userName?.message}
          {...register('userName')}
        />

        {/* Helper text */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-sm text-gray-300">
            💡 Get the room code from your friend to join their watching session.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Join Room
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinRoomModal;
