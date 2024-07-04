"use client";

import Image from "next/image";
import { useChat } from "ai/react";

export default function Home() {
  const { isLoading, messages, input, handleInputChange, handleSubmit } = useChat();

  const noMessages = !messages || messages.length === 0;

  console.log(messages);

  return (
    <main className="relative min-h-screen bg-gray-900 text-white">
      <Image
        layout="fill"
        src="/Arshad.png"
        alt="Arshad Banner"
        objectFit="cover"
        className="opacity-50"
      />
      <div className="absolute inset-0 flex flex-col items-center px-4 py-10 gap-5">
        <h1 className="text-5xl md:text-6xl font-bold text-green drop-shadow-lg">
          Arshad Ahamed&rsquo;s AI Portfolio
        </h1>

        <section className="w-full flex-1 flex flex-col overflow-y-scroll bg-gray-800 bg-opacity-10 rounded-lg p-5 shadow-lg">
          {noMessages ? (
            <p className="text-center text-xl text-gray-300">Ask me Anything</p>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  className={`rounded-3xl ${
                    message.role === "user"
                      ? "rounded-br-none bg-blue-600 ml-auto"
                      : "rounded-bl-none bg-orange-600"
                  } m-2 p-2 px-4 w-[70%] md:w-[80%] mt-4 text-gray-200`}
                  key={`message-${index}`}
                >
                  <b>{message.role === "user" ? "User:" : "AI:"}</b> {message.content}
                </div>
              ))}

              {isLoading && <span className="ml-auto text-gray-400">Thinking... 🤔</span>}
            </>
          )}
        </section>

        <form
          className="w-full flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          <input
            onChange={handleInputChange}
            value={input}
            type="text"
            placeholder="What's your question?"
            className="py-3 px-5 flex-1 rounded-lg text-black text-2xl border-2 border-gray-50 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xl px-5 cursor-pointer focus:outline-none disabled:bg-blue-400"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
