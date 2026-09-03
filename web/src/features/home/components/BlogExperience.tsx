import React, { useState } from 'react';
import { Sparkles, Send, Stethoscope } from 'lucide-react';

export const PlantAICare: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'سلام! من دستیار هوشمند گیاه‌پزشک برگ و گلدان هستم 🌱. سوالی درباره آبیاری، علت زرد شدن برگ‌ها، یا شرایط نگهداری گیاهان داری؟ بپرس تا راهنماییت کنم!',
      time: 'هم‌اکنون',
    },
  ]);

  const presetQuestions = [
    'علت زرد شدن برگ‌های سانسوریا چیست؟',
    'چقدر باید به زامیفولیا آب بدهم؟',
    'نور مناسب برای برگ انجیری چیست؟',
    'کود مناسب برای کوددهی تابستانی چیست؟',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text, time: 'هم‌اکنون' };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/plant-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      if (!res.ok) throw new Error('خطا در برقراری ارتباط');

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'پاسخ دریافت نشد.',
          time: 'هم‌اکنون',
        },
      ]);
    } catch {
      // Fallback response generator if offline or API key pending
      setTimeout(() => {
        let fallbackText = 'برای این مشکل، بررسی چند مورد ضروری است: ۱) رطوبت خاک قبل از آبیاری چک شود. ۲) زهکشی گلدان باز باشد تا ریشه نپوسد. ۳) نور مستقیم آفتاب به برگ‌های حساس نخورد.';
        if (text.includes('زرد')) {
          fallbackText = 'علت اصلی زرد شدن برگ‌ها معمولاً آبیاری بیش از حد و خیس ماندن طولانی خاک است. اجازه دهید ۵۰٪ خاک خشک شود سپس آبیاری کنید.';
        } else if (text.includes('آب') || text.includes('آبیاری')) {
          fallbackText = 'قانون طلایی آبیاری: حتماً با انگشت یا سیخ چوبی رطوبت ۳ سانتی‌متری سطح خاک را بسنجید. اگر خاک چسبید، هنوز زمان آبیاری نرسیده است.';
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: fallbackText,
            time: 'هم‌اکنون',
          },
        ]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Top AI Header */}
      <div className="bg-gradient-to-r from-[#181a26] via-[#1c2230] to-[#181a26] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              گیاه‌پزشک هوشمند (AI Doctor)
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Gemini Powered
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              تشخیص عوارض و ارائه دستورالعمل‌های تخصصی نگهداری گیاهان آپارتمانی
            </p>
          </div>
        </div>
      </div>

      {/* Preset Quick Questions */}
      <div className="space-y-2">
        <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          سوالات پرکاربرد کاربران:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs bg-[#1a1c26] hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-[#14151f] border border-white/10 rounded-2xl p-4 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-black font-medium rounded-tr-none shadow-md'
                  : 'bg-[#1e202d] text-zinc-200 border border-white/10 rounded-tl-none shadow-md'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 px-1">{msg.time}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl w-fit">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>گیاه‌پزشک در حال بررسی و تحلیل پاسخ است...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="علائم یا سوال خود را بنویسید (مثلاً: لکه‌های قهوه‌ای روی برگ)..."
          className="w-full bg-[#181922] border border-white/10 rounded-xl py-3.5 pr-4 pl-12 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-black p-2.5 rounded-lg disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>
    </div>
  );
};
