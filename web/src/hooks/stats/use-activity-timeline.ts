import { useState, useMemo } from "react";
import { 
  format, 
  subDays, 
  eachMonthOfInterval, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getYear, 
  startOfYear, 
  endOfYear, 
  isSameYear,
  parseISO
} from "date-fns";
import { type UserActivityLog } from "@/types/stats";

interface UseActivityTimelineProps {
  activityLog: UserActivityLog[];
  joinedAt: string;
}

export function useActivityTimeline({ activityLog, joinedAt }: UseActivityTimelineProps) {
  const [selectedYear, setSelectedYear] = useState<string>("Current");

  const today = useMemo(() => new Date(), []);
  const joinDate = useMemo(() => parseISO(joinedAt), [joinedAt]);
  const currentYearNum = getYear(today);
  const joinedYearNum = getYear(joinDate);

  // 1. Generate Year Options Dynamically
  const yearOptions = useMemo(() => {
    const years = ["Current"];
    for (let year = currentYearNum; year >= joinedYearNum; year--) {
      years.push(year.toString());
    }
    return years;
  }, [currentYearNum, joinedYearNum]);

  // 2. Determine Temporal Bounds
  const { dateRangeStart, dateRangeEnd } = useMemo(() => {
    if (selectedYear === "Current") {
      return {
        dateRangeStart: subDays(today, 364),
        dateRangeEnd: today
      };
    }
    
    const yearNum = parseInt(selectedYear);
    const mStart = startOfYear(new Date(yearNum, 0, 1));
    const mEnd = isSameYear(new Date(yearNum, 0, 1), today) ? today : endOfYear(new Date(yearNum, 0, 1));
    
    return {
      dateRangeStart: mStart,
      dateRangeEnd: mEnd
    };
  }, [selectedYear, today]);

  // 3. Pre-index activity for O(1) lookups
  const activityMap = useMemo(() => {
    const map = new Map<string, UserActivityLog>();
    activityLog.forEach((log) => {
      map.set(log.date, log);
    });
    return map;
  }, [activityLog]);

  // 4. Filter and Calculate Telemetry for Selected Window
  const { totalSubmissions, activeDays, filteredMonthsData } = useMemo(() => {
    let totalSubs = 0;
    let actDays = 0;

    const months = eachMonthOfInterval({ start: dateRangeStart, end: dateRangeEnd });
    
    const processedMonths = months.map(month => {
      // Find overlap between the month and our range
      const mStart = startOfMonth(month) < dateRangeStart ? dateRangeStart : startOfMonth(month);
      const mEnd = endOfMonth(month) > dateRangeEnd ? dateRangeEnd : endOfMonth(month);
      
      const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd });
      
      return {
        label: format(month, "MMM"),
        days: daysInMonth.map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          const activity = activityMap.get(dateStr);
          
          if (activity) {
            totalSubs += (activity.submissions || 0);
            if (activity.submissions > 0) actDays += 1;
          }

          return {
            date,
            submissions: activity?.submissions || 0,
            matches: activity?.matches || 0,
            pointsEarned: activity?.pointsEarned || 0,
            arenaPointsEarned: activity?.arenaPointsEarned || 0,
          };
        }),
      };
    });

    return { 
      totalSubmissions: totalSubs, 
      activeDays: actDays, 
      filteredMonthsData: processedMonths 
    };
  }, [activityMap, dateRangeStart, dateRangeEnd]);

  return {
    selectedYear,
    setSelectedYear,
    yearOptions,
    totalSubmissions,
    activeDays,
    filteredMonthsData
  };
}
