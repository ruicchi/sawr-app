import React, { useState, useEffect } from 'react';
import { Send, Store, Phone, Search, CheckCheck, Lock } from 'lucide-react';
import { getCurrentIdentity, getConversation, sendCustomerMessage, sendStoreReply, getStoreInfo, markConversationRead } from '../utils/storage';
import { MessagesSkeleton } from '../components/Skeletons';

// FAQ na may agad na sagot - hindi na kailangan hintayin ang store owner.
// Pwedeng palitan/dagdagan ang mga sagot dito.
function buildFaqAnswers() {
  const store = getStoreInfo();
  return {
    'Is store open today?': store?.hours
      ? `Yes, open kami today! Store hours: ${store.hours}.`
      : 'Yes, open kami ngayon! Check niyo na lang ang aming operating hours sa Store Settings.',
    'How much is delivery?': 'Nakadepende ang delivery fee sa distansya/courier booking niyo (Grab/Lalamove). Kayo pa rin po ang mag-bo-book ng courier pagkatapos ma-confirm ang order.',
    'Where is store located?': store?.address
      ? `Kami ay nasa ${store.address}. Pwede kayong mag pick-up dito o magpadala ng courier.`
      : 'I-check niyo na lang ang aming address sa Store Settings ng app.',
  };
}

export default function Messages({ onPhoneCall }) {
  const [identity, setIdentity] = useState(() => getCurrentIdentity());
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const storePhoneNumber = '09399030522';
  const faqAnswers = buildFaqAnswers();
  const quickReplies = Object.keys(faqAnswers);

  const loadThread = () => {
    const id = getCurrentIdentity();
    setIdentity(id);
    if (id) {
      const convo = getConversation(id.phone);
      setMessages(convo ? convo.messages : []);
      markConversationRead(id.phone, 'customer');
    }
  };

  useEffect(() => {
    loadThread();
    const loadingTimer = setTimeout(() => setIsLoading(false), 400);
    const handler = (e) => {
      if (e.key === 'sawrap_messages' || e.key === 'sawrap_user') loadThread();
    };
    window.addEventListener('storage', handler);
    const interval = setInterval(loadThread, 2000); // para makita kaagad ang reply ng store kahit isang tab lang
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
      clearTimeout(loadingTimer);
    };
  }, []);

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const handleSendMessage = () => {
    if (!identity || !inputText.trim()) return;
    const convo = sendCustomerMessage(identity, inputText);
    setMessages([...convo.messages]);
    setInputText('');
  };

  const handleQuickReply = (reply) => {
    if (!identity) return;
    // 1. Ipapadala muna ang tanong ng customer
    sendCustomerMessage(identity, reply);
    // 2. Instant na sagot mula sa "store" - walang paghihintay
    const convo = sendStoreReply(identity.phone, faqAnswers[reply]);
    if (convo) setMessages([...convo.messages]);
  };

  const handleCallClick = () => {
    if (onPhoneCall) onPhoneCall(storePhoneNumber);
    else window.location.href = `tel:${storePhoneNumber}`;
  };

  // Naka-lock ang messaging kung hindi pa alam ang pangalan/phone ng customer
  // (hindi pa naka-login AT wala pang naiplace na order sa guest mode)
  if (!identity) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] items-center justify-center text-center px-6">
        <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <Lock className="h-7 w-7 text-amber-400" />
        </div>
        <h2 className="text-lg font-black text-gray-800 mb-1">Mag-login o mag-order muna</h2>
        <p className="text-xs text-gray-500 max-w-xs">
          Para malaman ng SaWrap Store kung sino ang kausap nila, kailangan mo munang mag-login sa account mo o maglagay ng order (kahit guest mode) bago ka makapag-message.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)]">
      {/* Header Title */}
      <div className="mb-3">
        <h1 className="text-2xl font-black text-gray-800 md:text-3xl">Messages</h1>
        <p className="text-xs text-gray-500 font-medium">Chat directly with SaWrap Store Support</p>
      </div>

      {/* Main Chat Box - Flex 1 para kainin lahat ng natitirang space pababa */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 rounded-3xl bg-white border border-gray-100 shadow-xs overflow-hidden min-h-0">

        {/* LEFT PANEL: Desktop Contacts */}
        <div className="hidden md:flex flex-col border-r border-gray-100 bg-gray-50/50 p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-2xl bg-white pl-9 pr-4 py-2 text-xs font-medium text-gray-700 outline-none border border-gray-200"
            />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-amber-300 shadow-2xs cursor-pointer">
              <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-400 font-bold text-white">
                <Store className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800">SaWrap Store</h3>
                  <span className="text-[10px] text-gray-400">Just now</span>
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  {messages[messages.length - 1]?.text || 'No messages yet'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Chat */}
        <div className="md:col-span-2 flex flex-col h-full bg-white min-h-0">

          {/* Chat Header Bar */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-white font-bold shadow-2xs">
                <Store className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">SaWrap Customer Support</h2>
                <span className="text-[10px] font-medium text-green-600">
                  Online • Replies quickly
                </span>
              </div>
            </div>

            {/* Phone Call Icon Button */}
            <button
              onClick={handleCallClick}
              title="Call SaWrap Support"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-500 border border-amber-200 hover:bg-amber-400 hover:text-white transition-all shadow-2xs"
            >
              <Phone className="h-4 w-4" />
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
            {isLoading ? (
              <MessagesSkeleton />
            ) : (
              <>
            {messages.length === 0 && (
              <p className="text-center text-[11px] text-gray-400 mt-6">
                Magsimula ng usapan gamit ang mga tanong sa baba, o mag-type ng sarili mong mensahe.
              </p>
            )}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-white text-xs font-bold">
                      S
                    </div>
                  )}

                  <div className="max-w-[80%] md:max-w-[70%] space-y-0.5">
                    <div
                      className={`rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-amber-400 text-white rounded-br-none shadow-2xs'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div
                      className={`flex items-center gap-1 text-[10px] text-gray-400 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{formatTime(msg.time)}</span>
                      {isUser && <CheckCheck className="h-3 w-3 text-amber-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
              </>
            )}
          </div>

          {/* Quick Replies (FAQ - instant sagot) */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 bg-white border-t border-gray-100 scrollbar-none">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(reply)}
                className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 rounded-2xl bg-gray-100 p-1.5 border border-gray-200 focus-within:border-amber-400 transition-all"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-transparent px-3 text-xs text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-white shadow-2xs hover:bg-amber-500 disabled:opacity-40 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
