"use client";

import { useState, useEffect } from "react";
import { HandThumbUpIcon as HandThumbUpOutline } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpSolid } from "@heroicons/react/24/solid";
import { supabaseClient } from "../data-service/supabaseClient";
import { toggleUpvote } from "../data-service/actions";
import toast from "react-hot-toast";

export default function UpvoteButton({ reportId }) {
  const [upvotesCount, setUpvotesCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpvoteData = async () => {
      // Get total count
      const { count } = await supabaseClient
        .from("upvotes")
        .select("*", { count: 'exact', head: true })
        .eq("report_id", reportId);
      
      setUpvotesCount(count || 0);

      // Check if current user upvoted
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        const { data: userVote } = await supabaseClient
          .from("upvotes")
          .select("id")
          .eq("report_id", reportId)
          .eq("user_id", session.user.id)
          .single();
        
        if (userVote) setHasUpvoted(true);
      }
      setIsLoading(false);
    };

    fetchUpvoteData();
  }, [reportId]);

  const handleToggle = async (e) => {
    e.stopPropagation(); // prevent card click
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session?.user) {
      toast.error("Please login to upvote");
      return;
    }

    // Optimistic update
    const prevUpvoted = hasUpvoted;
    const prevCount = upvotesCount;
    setHasUpvoted(!prevUpvoted);
    setUpvotesCount(prevCount + (prevUpvoted ? -1 : 1));

    const res = await toggleUpvote(reportId);
    if (res.error) {
      // Revert on error
      setHasUpvoted(prevUpvoted);
      setUpvotesCount(prevCount);
      toast.error(res.error);
    }
  };

  if (isLoading) return <div className="animate-pulse bg-gray-200 h-6 w-12 rounded-md"></div>;

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors text-sm font-medium border ${
        hasUpvoted 
          ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100" 
          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      }`}
    >
      {hasUpvoted ? (
        <HandThumbUpSolid className="w-4 h-4" />
      ) : (
        <HandThumbUpOutline className="w-4 h-4" />
      )}
      <span>{upvotesCount}</span>
    </button>
  );
}
