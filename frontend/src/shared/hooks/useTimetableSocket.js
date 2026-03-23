import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/toast/ToastContext.jsx";
import { socket } from "../api/socket.js";

export function useTimetableSocket(currentDepartment, currentSemester, onUpdate, options = {}) {
  const queryClient = useQueryClient();
  const { push } = useToast();

  useEffect(() => {
    function handleTimetableUpdate(data) {
      const { department, semester, action } = data;
      
      // Only react if the update matches the currently viewed timeline
      if (
        department === currentDepartment &&
        String(semester) === String(currentSemester)
      ) {

        if (action === "delete") {
          // Instantly reset the cache so the grid disappears
          queryClient.resetQueries({ queryKey: ["student-timetable"] });
          queryClient.resetQueries({ queryKey: ["admin-timetable"] });
        } else {
          // Force a refetch even if the query is `enabled: false`
          queryClient.refetchQueries({ queryKey: ["student-timetable"] });
          queryClient.refetchQueries({ queryKey: ["admin-timetable"] });
        }

        let actionText = "updated";
        if (action === "generate") actionText = "published";
        if (action === "delete") actionText = "deleted";

        if (!options.suppressToast) {
          push({
            variant: "default",
            title: "Live Update",
            message: `An administrator just ${actionText} this schedule.`,
            duration: 5000,
          });
        }

        if (onUpdate) {
          onUpdate(action);
        }
      }
    }

    socket.on("timetable_updated", handleTimetableUpdate);

    return () => {
      socket.off("timetable_updated", handleTimetableUpdate);
    };
  }, [currentDepartment, currentSemester, queryClient, push]);
}

export function useFacultySocket() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  useEffect(() => {
    function handleUpdate(data) {
      const { action } = data || {};
      
      // If a timetable was deleted, reset queries to wipe potential orphaned schedules
      if (action === "delete") {
        queryClient.resetQueries({ queryKey: ["faculty-schedule"] });
        queryClient.resetQueries({ queryKey: ["faculty-workload"] });
      } else {
        // Force refetch to sync live data immediately regardless of enabled status
        queryClient.refetchQueries({ queryKey: ["faculty-schedule"] });
        queryClient.refetchQueries({ queryKey: ["faculty-workload"] });
      }
      
      push({
        variant: "default",
        title: "Live Update",
        message: "A recent timetable modification may have shifted your assigned classes.",
        duration: 6000,
      });
    }

    socket.on("timetable_updated", handleUpdate);
    return () => {
      socket.off("timetable_updated", handleUpdate);
    };
  }, [queryClient, push]);
}
