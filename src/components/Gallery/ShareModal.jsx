import React, { useState } from "react";
import { Copy, X, Mail, Instagram, Twitter, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const ShareBox = ({ url, onCloseShareModal }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      link: `https://wa.me/?text=${encodeURIComponent(url)}`,
      color: "bg-green-500",
      icon: <MessageSquare size={18} className="text-white" />,
    },
    {
      name: "Gmail",
      link: `mailto:?subject=Check this out!&body=${encodeURIComponent(url)}`,
      color: "bg-red-500",
      icon: <Mail size={18} className="text-white" />,
    },
    {
      name: "Instagram",
      link: `https://www.instagram.com/direct/new/?text=${encodeURIComponent(
        url
      )}`,
      color: "bg-pink-500",
      icon: <Instagram size={18} className="text-white" />,
    },
    {
      name: "Twitter",
      link: `https://twitter.com/messages/compose?text=${encodeURIComponent(
        url
      )}`,
      color: "bg-blue-500",
      icon: <Twitter size={18} className="text-white" />,
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96 relative text-center">
        <button
          onClick={onCloseShareModal}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>
        <h3 className="text-lg font-semibold mb-2">Share this link</h3>
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
          <span className="truncate text-sm">{url}</span>
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            <Copy size={20} />
          </motion.button>
        </div>
        {copied && (
          <p className="text-green-600 text-sm mt-2">Copied to clipboard!</p>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {shareOptions.map((option, index) => (
            <a
              key={index}
              href={option.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 ${option.color} rounded-lg text-sm font-medium text-white hover:opacity-80 transition-opacity`}
            >
              {option.icon}
              {option.name}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ShareBox;
