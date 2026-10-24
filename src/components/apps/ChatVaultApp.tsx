import React, { useState } from 'react';
import { VaultChatMessage } from '../../types';
import { storage } from '../../utils/storage';
import { playSound, triggerHaptic } from '../../utils/sound';
import { ArrowLeft, Send, ShieldCheck, Lock, MoreVertical, Plus } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const ChatVaultApp: React.FC<Props> = ({ onBack }) => {
  const [chats, setChats] = useState<VaultChatMessage[]>(() => storage.getChats());
  const [activeChat, setActiveChat] = useState<VaultChatMessage | null>(chats[0] || null);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...activeChat.messages, userMsg];
    const updatedChat = {
      ...activeChat,
      messages: updatedMessages,
      lastMessage: userMsg.text,
      timestamp: userMsg.time,
    };

    const updatedChats = chats.map(c => (c.id === activeChat.id ? updatedChat : c));
    setChats(updatedChats);
    setActiveChat(updatedChat);
    storage.setChats(updatedChats);
    setInputText('');
    playSound.keyPress();
    triggerHaptic(15);

    // Simulated reply after 1.5 seconds if talking to Cipher Contact
    setTimeout(() => {
      const replies = [
        'Acknowledged. Security handshake verified.',
        'Data packet received and encrypted into cold storage.',
        'Remember to close the vault when stepping away.',
        'Copy that. Transmission wiped from cache.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg = {
        id: `reply-${Date.now()}`,
        sender: 'contact' as const,
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const finalMessages = [...updatedMessages, replyMsg];
      const finalChat = {
        ...updatedChat,
        messages: finalMessages,
        lastMessage: replyMsg.text,
        timestamp: replyMsg.time,
      };
      const finalChats = chats.map(c => (c.id === activeChat.id ? finalChat : c));
      setChats(finalChats);
      setActiveChat(finalChat);
      storage.setChats(finalChats);
      playSound.keyPress();
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={activeChat && chats.length > 1 ? () => setActiveChat(null) : onBack}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {activeChat ? (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: activeChat.avatarColor }}
              >
                {activeChat.contactName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold text-white leading-tight">
                  {activeChat.contactName}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Encrypted Peer</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-white">Shadow Chat</div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Clock Locked</span>
        </div>
      </div>

      {/* Active Conversation or Chat List */}
      {activeChat ? (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            <div className="text-center my-2">
              <span className="text-[10px] text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                End-to-End Encrypted · Zero Cloud Sync
              </span>
            </div>

            {activeChat.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Secret message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Conversation List */
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                style={{ backgroundColor: chat.avatarColor }}
              >
                {chat.contactName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {chat.contactName}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {chat.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
