import React, { useState, useEffect } from 'react';
import { Users, Database, Activity, ToggleLeft, ToggleRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const CommandCenter = ({ stats }) => {
  const [gameMode, setGameMode] = useState('auto');
  const [pendingRound, setPendingRound] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchGameStatus();
  }, []);

  const fetchGameStatus = async () => {
    try {
      const { data } = await api.get('/admin/game-status');
      setGameMode(data.gameMode);
      setPendingRound(data.pendingRound);
    } catch (error) {
      console.error('Failed to fetch game status');
    }
  };

  const toggleMode = async () => {
    const newMode = gameMode === 'auto' ? 'manual' : 'auto';
    setIsUpdating(true);
    try {
      await api.post('/admin/settings', { settings: [{ key: 'game_mode', value: newMode }] });
      setGameMode(newMode);
      toast.success(`Switched to ${newMode.toUpperCase()} mode`);
    } catch (error) {
      toast.error('Failed to update game mode');
    } finally {
      setIsUpdating(false);
    }
  };

  const declareWinner = async () => {
    if (!selectedCard) {
      toast.error('Please select a card first');
      return;
    }
    
    if (!confirm(`Are you sure you want to declare ${selectedCard} as the winner?`)) return;

    setIsUpdating(true);
    try {
      await api.post('/admin/override-result', { 
        hourSlot: pendingRound.hourSlot, 
        winningCard: selectedCard 
      });
      toast.success(`Winner declared: ${selectedCard}`);
      setSelectedCard(null);
      fetchGameStatus();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to declare winner');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Users size={80} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Operatives</p>
          <h3 className="text-4xl font-black text-white">{stats.totalUsers.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Database size={80} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Wagers Placed</p>
          <h3 className="text-4xl font-black text-white">{stats.totalBets.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Activity size={80} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Net Volume</p>
          <h3 className="text-4xl font-black text-accent">₹{stats.totalVolume.toLocaleString()}</h3>
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden border-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Result Control</h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              Manage how game results are declared at the end of each round.
            </p>
          </div>
          <button 
            onClick={toggleMode}
            disabled={isUpdating}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border ${
              gameMode === 'manual' 
                ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/10' 
                : 'bg-green-500/10 text-green-500 border-green-500/20 shadow-lg shadow-green-500/10'
            }`}
          >
            {gameMode === 'manual' ? (
              <>
                <ShieldAlert size={24} />
                MANUAL MODE
              </>
            ) : (
              <>
                <CheckCircle2 size={24} />
                AUTOMATIC MODE
              </>
            )}
          </button>
        </div>

        {gameMode === 'manual' && (
          <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 animate-in fade-in zoom-in duration-500">
            {pendingRound ? (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pending Round</span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      {new Date(pendingRound.hourSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Round Exposure</span>
                    <h3 className="text-2xl font-black text-red-400 mt-1">₹{pendingRound.totalVolume.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {pendingRound.cards.map((card) => {
                    const isSelected = selectedCard === card._id;
                    return (
                      <button
                        key={card._id}
                        onClick={() => setSelectedCard(card._id)}
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border ${
                          isSelected 
                            ? 'bg-primary border-primary scale-105 shadow-xl shadow-primary/20' 
                            : 'bg-background border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {card._id}
                        </div>
                        <div className="w-full h-px bg-white/10 my-1" />
                        <div className={`text-xs font-black ${isSelected ? 'text-white/80' : 'text-red-400'}`}>
                          ₹{card.totalAmount.toLocaleString()}
                        </div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-gray-500'}`}>
                          {card.betCount} Bets
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={declareWinner}
                    disabled={!selectedCard || isUpdating}
                    className="btn-primary py-4 px-10 text-sm tracking-widest"
                  >
                    {isUpdating ? 'PROCESSING...' : 'DECLARE WINNER & PAYOUT'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <CheckCircle2 size={48} className="text-green-500/50 mb-4" />
                <h3 className="text-xl font-black text-white">No Pending Rounds</h3>
                <p className="text-gray-500 mt-2 text-sm font-medium">All rounds have been successfully processed.</p>
              </div>
            )}
          </div>
        )}

        {gameMode === 'auto' && (
          <div className="bg-green-500/5 rounded-3xl p-8 border border-green-500/10 text-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white">System is on Autopilot</h3>
            <p className="text-gray-500 mt-2 text-sm font-medium max-w-lg mx-auto">
              Results will be automatically calculated and declared at the end of each hour. The card with the lowest bet amount will automatically win.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandCenter;
