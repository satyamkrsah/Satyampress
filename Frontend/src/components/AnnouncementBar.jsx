import React from 'react';
import { announcementMessages } from '../data/homeData';

const AnnouncementBar = () => {
  const messages = [...announcementMessages, ...announcementMessages];

  return (
    <div className="bg-black text-white text-xs md:text-sm py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex">
        {messages.map((msg, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-2">
            <span className="w-1 h-1 bg-gold rounded-full" />
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
