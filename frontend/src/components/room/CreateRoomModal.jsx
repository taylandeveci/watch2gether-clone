import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createRoomSchema } from '../../utils/validators';

/**
 * CreateRoomModal Component
 * Modal for creating a new room
 */
export const CreateRoomModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createRoomSchema),
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Room" size="md">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Room name */}
        <Input
          label="Room Name"
          placeholder="Enter room name..."
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Your name */}
        <Input
          label="Your Name"
          placeholder="Enter your name..."
          error={errors.createdBy?.message}
          {...register('createdBy')}
        />

        {/* Helper text */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-sm text-gray-300">
            💡 You'll be the admin of this room and can control video playback.
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
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Create Room
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoomModal;
