"use client";
import React, { useEffect, useState } from "react";
import Cards from "../../component/card/index";
import Footer from "../../component/footer/index";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { ChevronDownIcon } from "@/component/icons";
import { getPublicVideos } from "@/services/videoService";
import { PeacePlayVideo } from "@/types/peacePlay";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProjectContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const [videos, setVideos] = useState<PeacePlayVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<PeacePlayVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadingGuard = setTimeout(() => {
      setLoading(false);
    }, 8000);

    const fetchVideos = async () => {
      try {
        const data = await getPublicVideos(50); 
        setVideos(data);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        clearTimeout(loadingGuard);
        setLoading(false);
      }
    };

    fetchVideos();

    return () => {
      clearTimeout(loadingGuard);
    };
  }, []);

  // Client-side filtering
  useEffect(() => {
    if (search) {
        const query = search.toLowerCase();
        const filtered = videos.filter(v => 
            v.title.toLowerCase().includes(query) || 
            (v.description && v.description.toLowerCase().includes(query)) ||
            (v.category && v.category.toLowerCase().includes(query))
        );
        setFilteredVideos(filtered);
    } else {
        setFilteredVideos(videos);
    }
  }, [search, videos]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4 pt-24">
         {/* Search Header */}
         {search && (
            <div className="mb-6">
                <h2 className="text-2xl font-bold">??????????: <span className="text-cyan-500">&quot;{search}&quot;</span></h2>
                <p className="text-gray-400 text-sm">?? {filteredVideos.length} ??????</p>
            </div>
         )}
         
         {/* Video Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.length > 0 ? (
                filteredVideos.map((video) => (
                    <Cards key={video.videoId} video={video} />
                ))
            ) : (
                <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-500">
                    <p className="text-xl font-medium">??????????????????????</p>
                    <p className="text-sm mt-2">????????????????? ???????????????????</p>
                </div>
            )}
         </div>
      </div>
      <div className="mt-20">
         <Footer />
      </div>
    </>
  );
}

const Project = () => {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading search...</div>}>
      <ProjectContent />
    </Suspense>
  );
};

export default Project;
