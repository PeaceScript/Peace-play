"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import { Button, Progress, ScrollShadow } from "@nextui-org/react";
import Contents from "../../contents/page";
import { useSearchParams } from "next/navigation";
import { getVideoById } from "@/services/videoService";
import { PeacePlayVideo } from "@/types/peacePlay";

function VideoPlayerContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [video, setVideo] = useState<PeacePlayVideo | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>();
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (id) {
      getVideoById(id).then(setVideo);
    }
  }, [id]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      setVideoDuration(videoElement.duration);
    }
  }, [video]);

  useEffect(() => {
    if (isPaused) return;
    const currentTime = videoRef.current?.currentTime;
    if (videoDuration != null && currentTime != null) {
      let loadingTimeout = setTimeout(() => {
        if (videoDuration > 0) {
            setVideoProgress(currentTime / videoDuration);
        }
      }, 100);

      return () => {
        clearTimeout(loadingTimeout);
      };
    }
  }, [videoProgress, videoDuration, isPaused]);

  if (!video) {
      return <div className="p-10 text-center">กำลังโหลดวิดีโอ...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-start gap-10 mt-10">
        <button onClick={() => window.history.back()}>
          <svg
            width="30"
            height="31"
            viewBox="0 0 30 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 0.5C16.3854 0.5 17.7135 0.677083 18.9844 1.03125C20.2552 1.38542 21.4531 1.88542 22.5781 2.53125C23.7031 3.17708 24.7135 3.95833 25.6094 4.875C26.5052 5.79167 27.2865 6.80729 27.9531 7.92188C28.6198 9.03646 29.125 10.2292 29.4688 11.5C29.8125 12.7708 29.9896 14.1042 30 15.5C30 16.8854 29.8229 18.2135 29.4688 19.4844C29.1146 20.7552 28.6146 21.9531 27.9688 23.0781C27.3229 24.2031 26.5417 25.2135 25.625 26.1094C24.7083 27.0052 23.6927 27.7865 22.5781 28.4531C21.4635 29.1198 20.2708 29.625 19 29.9688C17.7292 30.3125 16.3958 30.4896 15 30.5C13.6146 30.5 12.2865 30.3229 11.0156 29.9688C9.74479 29.6146 8.54688 29.1146 7.42188 28.4688C6.29688 27.8229 5.28646 27.0417 4.39062 26.125C3.49479 25.2083 2.71354 24.1927 2.04688 23.0781C1.38021 21.9635 0.875 20.7708 0.53125 19.5C0.1875 18.2292 0.0104167 16.8958 0 15.5C0 14.1146 0.177083 12.7865 0.53125 11.5156C0.885417 10.2448 1.38542 9.04688 2.03125 7.92188C2.67708 6.79688 3.45833 5.78646 4.375 4.89062C5.29167 3.99479 6.30729 3.21354 7.42188 2.54688C8.53646 1.88021 9.72917 1.375 11 1.03125C12.2708 0.6875 13.6042 0.510417 15 0.5ZM15 28.5C16.1979 28.5 17.349 28.3438 18.4531 28.0312C19.5573 27.7188 20.5885 27.2812 21.5469 26.7188C22.5052 26.1562 23.3854 25.4792 24.1875 24.6875C24.9896 23.8958 25.6667 23.0208 26.2188 22.0625C26.7708 21.1042 27.2083 20.0677 27.5312 18.9531C27.8542 17.8385 28.0104 16.6875 28 15.5C28 14.3021 27.8438 13.151 27.5312 12.0469C27.2188 10.9427 26.7812 9.91146 26.2188 8.95312C25.6562 7.99479 24.9792 7.11458 24.1875 6.3125C23.3958 5.51042 22.5208 4.83333 21.5625 4.28125C20.6042 3.72917 19.5677 3.29167 18.4531 2.96875C17.3385 2.64583 16.1875 2.48958 15 2.5C13.8021 2.5 12.651 2.65625 11.5469 2.96875C10.4427 3.28125 9.41146 3.71875 8.45312 4.28125C7.49479 4.84375 6.61458 5.52083 5.8125 6.3125C5.01042 7.10417 4.33333 7.97917 3.78125 8.9375C3.22917 9.89583 2.79167 10.9323 2.46875 12.0469C2.14583 13.1615 1.98958 14.3125 2 15.5C2 16.6979 2.15625 17.849 2.46875 18.9531C2.78125 20.0573 3.21875 21.0885 3.78125 22.0469C4.34375 23.0052 5.02083 23.8854 5.8125 24.6875C6.60417 25.4896 7.47917 26.1667 8.4375 26.7188C9.39583 27.2708 10.4323 27.7083 11.5469 28.0312C12.6615 28.3542 13.8125 28.5104 15 28.5ZM11.3594 14.5H22V16.5H11.3594L15.7031 20.7812L14.2969 22.2188L7.51562 15.5L14.2969 8.78125L15.7031 10.2188L11.3594 14.5Z"
              fill="black"
            />
          </svg>
        </button>

        <p className="text-[#061118] text-[18px] md:text-[32px]">
          {video.title}
        </p>
      </div>

      <div className="lg:hidden pt-4">
        <div className="w-full lg:w-[60%]">
          <video 
            className="w-full h-[300px]" 
            controls 
            autoPlay 
            src={video.videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <div className="lg:hidden">
        <p className="text-[#393939] text-[20px] pt-4">
          {video.description || "ไม่มีคำอธิบาย"}
        </p>
      </div>

      <div className="hidden lg:block mb-3">
        <Progress
          color="primary"
          size="md"
          aria-label="Loading..."
          value={videoProgress * 100}
          className="w-full h-[50px] max-w-md"
        />
        <p className="text-[#545859] text-[12px]">
          ความก้าวหน้าในการรับชม
        </p>
      </div>

      <div className="block lg:flex justify-between gap-3 pt-4">
        <div className="w-full lg:w-[40%]">
          <ScrollShadow className="w-full">
            <Contents />
            <Contents />
            <Contents />
          </ScrollShadow>

          <div className="flex justify-center gap-6 mb-4">
            <Button color="primary" variant="bordered" size="lg">
              ก่อนหน้า
            </Button>
            <Button color="primary" size="lg">
              ต่อไป
            </Button>
          </div>
        </div>

        <div className="hidden lg:block w-full">
            <div className="relative">
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  className="w-full h-[60vh] object-contain bg-black"
                  src={video.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
            </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="flex justify-center">
          <p className="text-[#061118] text-[25px] pt-6">
            {video.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function StartView() {
    return (
        <Suspense fallback={<div>Loading Video Player...</div>}>
            <VideoPlayerContent />
        </Suspense>
    );
}

export default StartView;
