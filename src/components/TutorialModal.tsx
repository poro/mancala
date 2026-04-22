import React from 'react';
import Image from 'next/image';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl font-bold"
          aria-label="Close tutorial"
        >
          &times;
        </button>
        <header className="text-center py-2 border-b-2 border-blue-500 mb-4">
          <h2 className="text-3xl font-extrabold text-gray-900">Mancala - by Leo</h2>
        </header>
        
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/leo_avatar.jpg"
            alt="Leo Avatar"
            width={100}
            height={100}
            className="rounded-full mb-4 border-4 border-blue-500 shadow-md"
            priority
          />
          <p className="text-lg text-gray-700 text-center mb-4">
            Hi there! I'm Leo, your guide to Mancala. Here's how to play this classic game:
          </p>
        </div>

        <div className="text-gray-800 space-y-4 leading-relaxed">
          <h3 className="font-bold text-xl text-blue-700">How to Play:</h3>
          <p>Mancala is a strategic board game where the objective is to capture more stones than your opponent in your own large "store" pit.</p>

          <h4 className="font-semibold text-lg text-blue-600">The Board Setup:</h4>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>There are 12 small pits (6 on your side, 6 on your opponent's).</li>
            <li>Each player has a larger scoring pit called a "store" (your store is on your right).</li>
            <li>Initially, each small pit contains 4 stones. Stores are empty.</li>
          </ul>

          <h4 className="font-semibold text-lg text-blue-600">Taking a Turn:</h4>
          <ol className="list-decimal list-inside ml-4 space-y-1">
            <li>Select any small pit on your side that contains stones.</li>
            <li>Pick up all the stones from that pit.</li>
            <li>Move counter-clockwise, dropping one stone into each pit you pass, including your own store.</li>
            <li><strong>Important:</strong> Skip your opponent's store.</li>
          </ol>

          <h4 className="font-semibold text-lg text-blue-600">Special Rules:</h4>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Getting an Extra Turn:</strong> If the last stone you drop lands in your own store, you get to take another turn immediately!</li>
            <li><strong>Capturing Opponent's Stones:</strong> If your last stone lands in an *empty* pit on your side, AND the pit directly opposite on your opponent's side contains stones, you capture your last stone PLUS all stones from your opponent's opposite pit. All these captured stones go directly into your store.</li>
          </ul>

          <h4 className="font-semibold text-lg text-blue-600">Ending the Game:</h4>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>The game ends when all 6 small pits on one player's side are empty.</li>
            <li>Any stones remaining in the small pits on the *other* player's side are automatically moved into that player's store.</li>
            <li>The player with the most stones in their store at the end of the game wins!</li>
          </ul>
          <p className="text-center font-semibold mt-6">Good luck, and enjoy Mancala - by Leo!</p>
        </div>

        <footer className="text-center text-gray-600 text-sm mt-8 border-t-2 border-gray-200 pt-4">
          Created by Mark Ollila and DUFUS as a gift to Leo Olebe.
        </footer>
      </div>
    </div>
  );
};

export default TutorialModal;
