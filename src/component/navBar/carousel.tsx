"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PeacePlayVideo } from "@/types/peacePlay";
import { useAuth } from "@/context/AuthContext";
import { recordAdView } from "@/services/adService";
import { 
  Modal, 
  ModalContent, 
  ModalBody, 
  ModalHeader,
  Progress // Import Progress for Ad Timer
} from "@nextui-org/react";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css/navigation";

interface CarouselProps {
  videos?: PeacePlayVideo[];
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} ชม. ${m} นาที`;
  return `${m} นาที`;
};

const getPublishYear = (date: any) => {
  if (!date) return new Date().getFullYear();
  if (typeof date.toDate === 'function') {
    return date.toDate().getFullYear();
  }
  if (date.seconds) {
    return new Date(date.seconds * 1000).getFullYear();
  }
  return new Date(date).getFullYear();
};

const cleanDescription = (desc: string) => {
  if (!desc) return "เรื่องราวการผจญภัยที่น่าตื่นเต้นและการค้นหาความจริงในโลกที่เต็มไปด้วยปริศนา...";
  // Remove "ACT 1 setup", "(Setup)", or similar technical text
  return desc
    .replace(/^(?:Act\s*\d+\s*(?:setup|:)?\s*|Step\s*\d+\s*:?\s*|Setup\s*:?\s*)/i, "") // Prefix
    .replace(/\(Setup\)/gi, "") // Specific label
    .replace(/Setup/gi, "")      // Loose word
    .replace(/^[:\-\s]+|[:\-\s]+$/g, "") // Cleanup format
    .trim();
};

const Carousel = ({ videos = [] }: CarouselProps) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // States for Video & Ads
  const [playingVideo, setPlayingVideo] = useState<PeacePlayVideo | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(5); // 5 seconds ad
  const [isVideoUnlocked, setIsVideoUnlocked] = useState(false);

  // Check user status to determine if ad is needed
  const handleWatchClick = (video: PeacePlayVideo) => {
    // Mock Check: Is Premium? (In real app, check user.subscription === 'premium')
    const isPremium = false; // Always false for now to demonstrate ads

    if (user && isPremium) {
       // Premium User: Watch immediately
       setPlayingVideo(video);
       setIsVideoUnlocked(true);
       setShowAd(false);
    } else {
       // Guest or Free User: Show Ad First
       setPlayingVideo(video);
       setIsVideoUnlocked(false);
       setShowAd(true);
       setAdTimer(5); // Reset timer
    }
  };

  // Handle Ad Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (showAd && adTimer === 0) {
      // Ad Finished
      finishAd();
    }
    return () => clearInterval(interval);
  }, [showAd, adTimer]);

  const finishAd = async () => {
     if (playingVideo) {
         // 1. Record Revenue
         await recordAdView(playingVideo.videoId, user?.uid);
         // 2. Unlock Content
         setShowAd(false);
         setIsVideoUnlocked(true);
     }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/project?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* Video Player Modal with Ad System */}
      {playingVideo && (
        <Modal 
          isOpen={!!playingVideo} 
          onOpenChange={(open) => {
            if (!open) {
                setPlayingVideo(null);
                setShowAd(false);
                setIsVideoUnlocked(false);
            }
          }}
          size="5xl"
          backdrop="blur"
          className="bg-black/90 text-white"
          placement="center"
          isDismissable={false} // Force user to watch ad or close manually
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                   {showAd ? "โฆษณา (สนับสนุนครีเอเตอร์)" : playingVideo.title}
                </ModalHeader>
                <ModalBody className="p-0 overflow-hidden bg-black flex justify-center items-center aspect-video relative">
                  
                  {/* AD OVERLAY LAYER */}
                  {showAd ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-center relative overflow-hidden">
                        
                        {/* 1. Background Image (Blurred Context) */}
                        {playingVideo.thumbnailUrl && (
                            <div className="absolute inset-0 z-0">
                                <Image 
                                    src={playingVideo.thumbnailUrl} 
                                    alt="Ad Background" 
                                    fill 
                                    className="object-cover opacity-20 blur-md" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent" />
                            </div>
                        )}

                        <div className="z-10 flex flex-col items-center max-w-lg px-6 w-full animate-fade-in">
                            
                            <div className="text-yellow-400 mb-2 text-sm font-bold uppercase tracking-widest">
                                Ad Suggestion
                            </div>

                            {/* 2. Target Content Preview */}
                            <div className="flex flex-col items-center mb-8">
                                <h3 className="text-gray-400 text-sm mb-2">กำลังรอรับชม:</h3>
                                <h2 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight drop-shadow-xl text-center">
                                    {playingVideo.title}
                                </h2>
                                {/* Large Progress Bar */}
                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-2">
                                    <div 
                                        className="h-full bg-cyan-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                                        style={{ width: `${((5 - adTimer) / 5) * 100}%` }}
                                    />
                                </div>
                                <p className="text-cyan-400 text-sm font-medium animate-pulse">
                                    วีดีโอจะเริ่มใน {adTimer} วินาที
                                </p>
                            </div>

                            {/* 3. Call to Action (Upsell) */}
                            {!user && (
                                <div className="mt-4 p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full max-w-md hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => router.push('/signUp')}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-left">
                                            <p className="text-white font-bold text-lg group-hover:text-cyan-400 transition-colors">สมัครสมาชิก Premium</p>
                                            <p className="text-gray-400 text-sm">ดูได้ทันทีไม่ต้องรอโฆษณา</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                  ) : (
                    /* REAL VIDEO PLAYER */
                    <video 
                      src={playingVideo.videoUrl} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}

                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      <div className="hidden md:block w-full">
        <div className="relative flex justify-center h-[700px] w-full overflow-hidden bg-[#020202]">
          
          {/* Dynamic Background: Real Video Covers with Dark Overlay */}
          <div className="relative w-full h-full z-0 group">
            {videos.length > 0 ? (
              <Swiper
                modules={[Autoplay, Navigation]}
                navigation={true} 
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{
                  delay: 8000,
                  disableOnInteraction: false,
                }}
                speed={1000}
                className="h-full w-full"
              >
                {videos.map((video) => (
                  <SwiperSlide key={video.videoId}>
                    <div className="relative w-full h-full">
                      {video.thumbnailUrl ? (
                         <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          fill
                          className="object-cover opacity-100" // Maximum clarity
                          priority
                        />
                      ) : (
                         <div className="w-full h-full bg-[#111]" />
                      )}
                      
                      {/* Cinema-style Gradient: Heavy left fade for clear text reading */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                      {/* Video Info Content - Left Aligned & Enhanced */}
                      <div className="absolute inset-y-0 left-0 flex flex-col justify-center max-w-screen-xl w-full z-20 px-8 md:px-16 lg:px-24">
                          <div className="max-w-2xl animate-fade-in-up">
                              
                              {/* Title */}
                              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl mb-6 tracking-tight uppercase">
                                  {video.title}
                              </h1>

                              {/* Metadata Row: Type | Year | Genre | Duration | Studio */}
                              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 font-medium mb-6 uppercase tracking-wider">
                                  
                                  {/* Type & Year */}
                                  <span className="text-cyan-400 font-bold">
                                      {video.category === 'Series' ? 'ซีรีส์' : 'ภาพยนตร์'}
                                  </span>
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  <span>{getPublishYear(video.createdAt || video.publishedAt)}</span>
                                  
                                  {/* Genre */}
                                  {video.category && (
                                    <>
                                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                      <span>{video.category}</span>
                                    </>
                                  )}

                                  {/* Duration */}
                                  {video.duration > 0 && (
                                    <>
                                       <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                       <span>{formatDuration(video.duration)}</span>
                                    </>
                                  )}

                                  {/* Studio */}
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-white">Peace Studio</span>
                                  </div>
                              </div>

                              {/* Synopsis / Description from Project Step 2 */}
                              <div className="mb-10">
                                <p className="text-gray-200 text-base md:text-lg font-light leading-relaxed drop-shadow-md line-clamp-4 opacity-90 max-w-xl">
                                    {cleanDescription(video.description)}
                                </p>
                              </div>

                              {/* Action Buttons */}

                              <div className="flex items-center gap-4">
                                  <button 
                                      onClick={() => handleWatchClick(video)}
                                      className="flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:-translate-y-1 group"
                                  >
                                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                      <span>รับชม</span>
                                  </button>
                                  <button 
                                      onClick={() => router.push(`/project/projectDetail?id=${video.videoId}`)}
                                      className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg font-medium backdrop-blur-md transition-all hover:border-white/30"
                                  >
                                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      <span>รายละเอียดเพิ่มเติม</span>
                                  </button>
                              </div>
                          </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

            ) : (
              // Fallback Grid Background
              <div className="relative w-full h-full bg-[#020202]">
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-4xl text-gray-700 font-bold">PeacPlay</h1>
                 </div>
              </div>
            )}
            
            {/* Global Ambient Glows */}
            <div className="absolute top-0 left-0 w-[800px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none z-10"></div>
            
            {/* Search Overlay - Positioned Bottom Center */}
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
                <div className="w-full max-w-2xl pointer-events-auto bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-2xl">
                     <form className="flex items-center gap-2" onSubmit={handleSearch}>
                        <div className="relative w-full group">
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                    </svg>
                                </div>
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="block w-full p-3 ps-12 text-sm text-white/90 border border-transparent rounded-xl bg-white/5 focus:ring-1 focus:ring-cyan-500/50 focus:bg-white/10 placeholder-gray-500 focus:outline-none transition-all"
                                  placeholder="ค้นหาชื่อภาพยนต์, ผู้กำกับ, หรือหมวดหมู่..."
                                />
                            </div>
                        </div>
                        <button type="submit" className="px-6 py-3 text-sm font-semibold text-white bg-cyan-600 rounded-xl hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20 whitespace-nowrap">
                            ค้นหา
                        </button>
                    </form>
                </div>
            </div>

          </div>

        </div>
      </div>

      <div className="md:hidden">
        <div className="flex flex-col justify-center items-center text-white p-6 bg-[#050505]">
          <h2 className="text-cyan-400 text-[28px] font-bold text-center">
             Digital Skills Era
          </h2>
          <p className="text-gray-400 text-[14px] font-light pt-4 text-center">
             เสริมทักษะของคุณให้พร้อมในการแข่งขันยุคดิจิทัล เรียนรู้จากผู้เชี่ยวชาญเพื่อฝึกฝนจนชำนาญ
          </p>
          <div className="mt-6 w-full">
            <form className="flex items-center gap-2">
                 <input
                  type="text"
                  className="bg-[#111] border border-gray-700 text-sm text-white rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 placeholder-gray-500"
                  placeholder="ค้นหา..."
                />
                <button type="submit" className="p-2.5 text-sm font-medium text-white bg-cyan-600 rounded-lg border border-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:outline-none focus:ring-cyan-300">
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Carousel;
