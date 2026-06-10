import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSegment } from "./SegmentContext";
import { PrismicLink } from "@prismicio/react";

export const Header = ({ globalSettings, navigation }) => {
  const router = useRouter();
  const { activeSegment, setActiveSegment } = useSegment();

  if (!globalSettings) return null; // Wait for settings to load

  const { hide_keywords, hide_prefix_paths, hide_full_paths, segments } =
    globalSettings.data;

  // 1. Determine if Toggle should be hidden
  const currentPath = router.asPath.split("?")[0];
  let shouldHideToggle = false;

  if (hide_full_paths) {
    shouldHideToggle = shouldHideToggle || hide_full_paths.some(
      (item) => item.path && currentPath === item.path
    );
  }

  if (hide_prefix_paths) {
    shouldHideToggle = shouldHideToggle || hide_prefix_paths.some(
      (item) => item.path && currentPath.startsWith(item.path)
    );
  }

  if (hide_keywords) {
    shouldHideToggle = shouldHideToggle || hide_keywords.some(
      (item) => item.keyword && currentPath.includes(item.keyword)
    );
  }

  // 2. Pre-calculate the hrefs for each toggle to use Next.js <Link> (fixes speed issue by prefetching)
  let basePath = currentPath;
  const activeSegmentData = segments?.find(s => s.segment_id === activeSegment);
  const activePrefix = activeSegmentData?.url_prefix;
  
  if (activePrefix && activePrefix !== "/") {
    const normalizedPath = currentPath.endsWith("/") ? currentPath.slice(0, -1) : currentPath;
    const normalizedPrefix = activePrefix.endsWith("/") ? activePrefix.slice(0, -1) : activePrefix;
    
    if (normalizedPath === normalizedPrefix) {
      basePath = "/";
    } else if (normalizedPath.startsWith(normalizedPrefix + "/")) {
      basePath = normalizedPath.substring(normalizedPrefix.length); // e.g. /account/pricing -> /pricing
    }
  }

  const getHrefForSegment = (prefix) => {
    let newPath = basePath;
    if (prefix && prefix !== "/") {
      const normalizedPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
      newPath = basePath === "/" ? normalizedPrefix : normalizedPrefix + basePath;
    }
    return newPath || "/";
  };

  // 3. Get Active Navigation
  const activeNav = navigation?.find((nav) => nav.data.segment_id === activeSegment);

  return (
    <header className="bg-white border-b py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Toggle Switch */}
        <div className="flex items-center gap-4">
          {!shouldHideToggle && segments ? (
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {segments.map((segment) => {
                const targetHref = getHrefForSegment(segment.url_prefix);
                return (
                  <Link key={segment.segment_id} href={targetHref}>
                    <a
                      onClick={() => setActiveSegment(segment.segment_id)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        activeSegment === segment.segment_id
                          ? "bg-green-700 text-white font-medium"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {segment.segment_label}
                    </a>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="font-bold text-xl">Logo</div>
          )}
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex items-center gap-6">
          {!activeNav && (
            <span className="text-xs text-red-500">No Nav doc found for segment ID: &quot;{activeSegment}&quot;</span>
          )}
          {activeNav &&
            activeNav.data.menu_items?.map((item, index) => {
              const hasLink = item.link && (item.link.url || item.link.id);
              const labelContent = (
                <>
                  {item.label}
                  {item.sub_menus?.length > 0 && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  )}
                </>
              );

              return (
                <div key={index} className="relative group">
                  {hasLink ? (
                    <PrismicLink
                      field={item.link}
                      className="text-gray-700 hover:text-green-700 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {labelContent}
                    </PrismicLink>
                  ) : (
                    <span className="text-gray-700 hover:text-green-700 font-medium flex items-center gap-1 cursor-default">
                      {labelContent}
                    </span>
                  )}
                  
                  {item.sub_menus?.length > 0 && (
                    <div className="absolute top-full left-0 pt-2 w-48 hidden group-hover:block z-50">
                      <div className="bg-white border shadow-lg rounded-md">
                        <ul className="py-2">
                          {item.sub_menus.map((sub, i) => (
                             <li key={i}>
                               <PrismicLink field={sub.sub_link} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700">
                                 {sub.sub_label}
                               </PrismicLink>
                             </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </nav>
      </div>
    </header>
  );
};
