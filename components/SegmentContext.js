import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const SegmentContext = createContext();

export const useSegment = () => useContext(SegmentContext);

export const SegmentProvider = ({ children, globalSettings }) => {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState("");

  // Sync segment with URL dynamically from Prismic settings
  useEffect(() => {
    if (!globalSettings?.data?.segments) return;
    const segments = globalSettings.data.segments;
    
    let matchedSegment = segments.find((s) => {
      if (!s.url_prefix || s.url_prefix === "/") return false;
      const normalizedPrefix = s.url_prefix.endsWith("/") ? s.url_prefix.slice(0, -1) : s.url_prefix;
      const normalizedPath = router.asPath.split("?")[0].endsWith("/") 
        ? router.asPath.split("?")[0].slice(0, -1) 
        : router.asPath.split("?")[0];
      
      return normalizedPath === normalizedPrefix || normalizedPath.startsWith(normalizedPrefix + "/");
    });

    if (matchedSegment) {
      setActiveSegment(matchedSegment.segment_id);
    } else {
      // Fallback to the default segment (prefix "/") or the first segment
      const defaultSegment = segments.find((s) => s.url_prefix === "/") || segments[0];
      if (defaultSegment) {
        setActiveSegment(defaultSegment.segment_id);
      }
    }
  }, [router.asPath, globalSettings]);

  return (
    <SegmentContext.Provider value={{ activeSegment, setActiveSegment }}>
      {children}
    </SegmentContext.Provider>
  );
};
