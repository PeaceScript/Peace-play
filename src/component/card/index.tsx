"use client";

import React from "react";
import Image from "next/image";
import { Avatar, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { PeacePlayVideo } from "@/types/peacePlay";

interface CardProps {
  video?: PeacePlayVideo;
}

const Index = ({ video }: CardProps) => {
  const router = useRouter();

  if (!video) {
    return null; // Don't render card if no video data
  }
  
  // Allow any valid thumbnail string (http, data url, or relative path)
  const imageUrl = video.thumbnailUrl ? video.thumbnailUrl : "";

  return (
    <div
      className="w-full rounded-[20px] p-0 shadow-lg bg-[#121212] border border-white/5 my-2 cursor-pointer group hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-500/30 transition-all duration-300 overflow-hidden"
      onClick={() => router.push(`project/projectDetail?id=${video.videoId}`)}
    >
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 relative h-[180px] w-full overflow-hidden bg-[#0a0a0a]">
         {imageUrl ? (
             <Image
              src={imageUrl}
              fill
              alt={video.title}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
         ) : (
            // Abstract Gradient Fallback
            <div className={`w-full h-full bg-gradient-to-br from-gray-900 via-[#0a0a0a] to-[#112] p-4 flex items-center justify-center`}>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white/20 text-xs">PEACE PLAY</span>
                </div>
            </div>
         )}
         
        {/* Dark Gradient Overlay Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0">
            <div className="w-14 h-14 bg-cyan-500/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-all duration-300">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 text-white">
                  <path d="M5 3L19 12L5 21V3Z" fill="white" />
               </svg>
            </div>
        </div>
        </div>
        
        {/* Content Area */}
        <div className="relative p-4 z-20 -mt-10">
             {/* Tags/Category Pill */}
             <div className="mb-2">
                 <span className="px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full text-[10px] text-cyan-400 font-medium">
                    RECOMMENDED
                 </span>
             </div>

             <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 mb-1 group-hover:text-cyan-400 transition-colors">
                {video.title}
             </h3>
             <p className="text-gray-400 text-xs line-clamp-1 mb-3">
                {video.description || "No description available"}
             </p>
             
             <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                 <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 text-tiny border border-white/20" />
                      <span className="text-gray-400 text-xs">Official Creator</span>
                 </div>
                 <div className="flex items-center text-gray-500 text-xs gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <span>1.2k</span>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};
export default Index;
