import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export function useTickets(search = "") {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.append("page", pageNumber);

      if (search.trim()) {
        params.append("q", search.trim());
      }

      const response = await fetch(
        `${API_URL}/tickets?${params.toString()}`,
        {
          method: "GET",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tickets");
      }

      if (pageNumber === 1) {
        setTickets(data.tickets || []);
      } else {
        setTickets((previous) => [
          ...previous,
          ...(data.tickets || [])
        ]);
      }

      setPage(data.page || pageNumber);
      setPages(data.pages || 1);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      setError(error.message || "Failed to load tickets");

      if (pageNumber === 1) {
        setTickets([]);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    setPage(1);
    fetchTickets(1);
  }, [fetchTickets]);

  const loadMore = () => {
    if (page < pages && !loading) {
      fetchTickets(page + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    fetchTickets(1);
  };

  return {
    tickets,
    loading,
    error,
    loadMore,
    hasMore: page < pages,
    refresh
  };
}