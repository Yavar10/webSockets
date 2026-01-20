const RoomPageUI = ({
  roomCode,
  roomInfo,
  counter,
  messages,
  typingUser,
  messageInput,
  onMessageChange,
  onSendMessage,
  onIncrement,
  onDecrement
}) => {
  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-sm shadow-lg border border-stone-200 overflow-hidden">
        <div className="bg-stone-800 p-8 border-b border-stone-700">
          <div className="text-center">
            <p className="text-stone-400 text-xs font-light mb-2 tracking-wider uppercase">
              Room Code
            </p>
            <h1 className="text-4xl font-serif text-white tracking-wider mb-3">
              {roomCode}
            </h1>
            {roomInfo && (
              <p className="text-stone-400 text-sm font-light">
                {roomInfo.count} / 2 participants
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <button
                onClick={()=>{
                  localStorage.removeItem("roomCode")
                  window.location.reload()
                }}
                className="px-5 py-2 rounded-lg bg-black text-white text-xl font-bold hover:bg-red-600 active:scale-95 transition"
              >
                Exit Room
              </button>
            <h2 className="text-xl font-semibold text-white tracking-wide">
              Shared Counter
            </h2>

            <div className="text-4xl font-mono text-white font-bold">
              {counter}
            </div>

            <div className="flex gap-4">
              <button
                onClick={onDecrement}
                className="px-5 py-2 rounded-lg bg-red-500 text-white text-xl font-bold hover:bg-red-600 active:scale-95 transition"
              >
                −
              </button>

              <button
                onClick={onIncrement}
                className="px-5 py-2 rounded-lg bg-green-500 text-white text-xl font-bold hover:bg-green-600 active:scale-95 transition"
              >
                +
              </button>
            </div>

            <p className="text-sm text-gray-500 italic">
              Synced in real-time for everyone in the room
            </p>
          </div>
        </div>

        <div className="p-8">
          <div
            className="bg-stone-50 rounded-sm p-6 mb-6 h-96 overflow-y-auto border border-stone-200"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(0,0,0,0.03) 31px, rgba(0,0,0,0.03) 32px)"
            }}
          >
            {messages.map((m, i) => (
              <div key={i} className="mb-4 border-l-2 border-stone-300 pl-4 py-1">
                <p className="text-xs text-stone-500 font-light mb-1">
                  {m.sender}
                </p>
                <p className="text-stone-800 font-light leading-relaxed">
                  {m.message}
                </p>
              </div>
            ))}

            {typingUser && (
              <p className="italic text-stone-400 text-sm font-light pl-4">
                {typingUser} is typing...
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <input
              value={messageInput}
              onChange={onMessageChange}
              placeholder="Write your message..."
              className="flex-1 px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 transition-colors font-light"
              onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
            />
            <button
              onClick={onSendMessage}
              className="bg-stone-800 text-white px-8 py-3 rounded-sm font-light hover:bg-stone-900 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPageUI;
