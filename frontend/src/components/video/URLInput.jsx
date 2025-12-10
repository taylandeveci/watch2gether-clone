import React, { useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { isValidVideoUrl } from '../../utils/videoParser';
import toast from 'react-hot-toast';

/**
 * URLInput Component
 * Input field for video URLs
 */
export const URLInput = ({ onSubmit, isAdmin, disabled = false }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error('Only admin can change the video');
      return;
    }

    if (!url.trim()) {
      toast.error('Please enter a video URL');
      return;
    }

    if (!isValidVideoUrl(url)) {
      toast.error('Please enter a valid YouTube, Vimeo, or direct video URL');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(url);
      setUrl('');
      toast.success('Video updated!');
    } catch (error) {
      toast.error(error.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder={
              isAdmin
                ? 'Paste YouTube, Vimeo, or direct video URL...'
                : 'Only admin can change the video'
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={!isAdmin || disabled || loading}
            icon={Link2}
          />
        </div>
        <Button
          type="submit"
          disabled={!isAdmin || disabled || loading || !url.trim()}
          loading={loading}
        >
          {loading ? 'Loading...' : 'Load Video'}
        </Button>
      </div>
    </form>
  );
};

export default URLInput;
