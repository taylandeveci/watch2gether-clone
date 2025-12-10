import React from 'react';
import { Users, Crown, UserMinus } from 'lucide-react';
import { getUserColor } from '../../utils/validators';

/**
 * ParticipantList Component
 * Shows all participants in the room
 */
export const ParticipantList = ({ participants: participantsFromProps, currentUser, onKickUser }) => {
  // Ensure participants is always an array to prevent null.length crashes
  const participants = participantsFromProps || [];
  const isCurrentUserAdmin = currentUser?.isAdmin || false;

  return (
    <div className="bg-surface rounded-xl border-2 border-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/50">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-white">Participants</h3>
        <span className="ml-auto text-sm text-gray-400">
          {participants.length}
        </span>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-400">No participants yet</p>
          </div>
        ) : (
          participants.map((participant) => {
            const avatarColor = getUserColor(participant?.userName);
            const isCurrentUser = (participant?.userName || '') === (currentUser?.userName || '');

            return (
              <div
                key={participant?.id || index}
                className={`
                  flex items-center gap-3 p-3 rounded-xl
                  ${
                    isCurrentUser
                      ? 'bg-primary/10 border-2 border-primary/30'
                      : 'bg-background/50 border-2 border-border hover:border-primary/30'
                  }
                  transition-all duration-300
                `}
              >
                {/* Avatar */}
                <div
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    text-white font-semibold text-sm ${avatarColor}
                  `}
                >
                  {(participant?.userName || 'A').charAt(0).toUpperCase()}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">
                      {participant?.userName || 'Anonymous'}
                      {isCurrentUser && (
                        <span className="text-primary text-sm ml-1">(You)</span>
                      )}
                    </p>
                    {participant?.isAdmin && (
                      <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {participant?.isAdmin ? 'Admin' : 'Member'}
                  </p>
                </div>

                {/* Kick button (only visible to admin, not for admin users or yourself) */}
                {isCurrentUserAdmin &&
                  !participant?.isAdmin &&
                  !isCurrentUser && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${participant?.userName || 'this user'} from the room?`)) {
                          onKickUser(participant?.id);
                        }
                      }}
                      className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 group"
                      title="Remove user"
                      aria-label={`Remove ${participant?.userName || 'user'}`}
                    >
                      <UserMinus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
