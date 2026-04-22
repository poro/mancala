import Image from "next/image";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mancala - by Leo",
  description: "A polished Mancala (Kalah) game — hot-seat and vs AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center justify-center p-4 bg-gray-100">
        <header className="w-full max-w-2xl text-center py-4">
          <h1 className="text-4xl font-bold text-gray-800">Mancala - by Leo</h1>
        </header>
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/leo_avatar.jpg"
              alt="Leo Avatar"
              width={80}
              height={80}
              className="rounded-full mr-4 border-2 border-blue-500"
            />
            <p className="text-gray-700 font-medium">Hi there! I'm Leo, your guide to Mancala. Here's how to play:</p>
          </div>
          <p className="mb-2">Mancala is a game of strategy, where the goal is to collect more stones in your "store" than your opponent.</p>
          <h3 className="font-bold text-lg mb-1">The Board:</h3>
          <ul className="list-disc list-inside mb-2 ml-4 text-sm">
            <li>You have 6 small pits on your side (Player 1: 0-5).</li>
            <li>Your opponent has 6 small pits on their side (Player 2: 7-12).</li>
            <li>Each player has a larger "store" pit to their right. Your store is pit 6, your opponent's is pit 13.</li>
            <li>Each small pit starts with 4 stones. Stores start empty.</li>
          </ul>
          <h3 className="font-bold text-lg mb-1">Your Turn:</h3>
          <ul className="list-disc list-inside mb-2 ml-4 text-sm">
            <li>Choose any non-empty pit on your side.</li>
            <li>Pick up all the stones from that pit.</li>
            <li>Moving counter-clockwise, drop one stone into each pit, including your own store. <strong>Skip your opponent's store.</strong></li>
            <li>If your last stone lands in your own store, you get an <strong>extra turn!</strong></li>
            <li><strong>Capturing:</strong> If your last stone lands in an <em>empty</em> pit on your side, and the opposite pit on your opponent's side has stones, you capture both your last stone and all stones from the opponent's opposite pit. All captured stones go into your store.</li>
          </ul>
          <h3 className="font-bold text-lg mb-1">End of Game:</h3>
          <ul className="list-disc list-inside mb-2 ml-4 text-sm">
            <li>The game ends when all 6 pits on one player's side are empty.</li>
            <li>All remaining stones on the other player's side are swept into that player's store.</li>
            <li>The player with the most stones in their store wins!</li>
          </ul>
        </div>
        {children}
        <footer className="w-full max-w-2xl text-center py-4 text-gray-600 text-sm mt-4">
          Created by Mark Ollila and DUFUS as a gift to Leo Olebe.
        </footer>
      </body>
    </html>
  );
}
