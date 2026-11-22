/**
 * Real-time Emergency Deadline & State Persistence Manager
 * Ensures countdown timers continue running against wall-clock time across
 * tab closes, page reloads, and browser restarts.
 */

export interface PersistentCaseInfo {
  id: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  pledgedUnits: number;
  hospital: string;
  district: string;
  upazila: string;
  urgency: "critical" | "urgent";
  defaultDurationMinutes: number;
  medicalReason: string;
  requesterPhone: string;
}

export const SAMPLE_EMERGENCY_CASES: Record<string, PersistentCaseInfo> = {
  "case-101": {
    id: "case-101",
    patientName: "Tasneem Rahman",
    bloodGroup: "O-",
    unitsNeeded: 2,
    pledgedUnits: 0,
    hospital: "Dhaka Medical College Hospital (DMCH ICU-3)",
    district: "Dhaka",
    upazila: "Ramna",
    urgency: "critical",
    defaultDurationMinutes: 105, // 1h 45m (Code Red)
    medicalReason: "Emergency Cesarean Surgery (Severe Hemorrhage)",
    requesterPhone: "01712345678",
  },
  "case-102": {
    id: "case-102",
    patientName: "Abdul Gafur",
    bloodGroup: "B+",
    unitsNeeded: 3,
    pledgedUnits: 1,
    hospital: "Chittagong Medical College Hospital",
    district: "Chittagong",
    upazila: "Panchlaish",
    urgency: "critical",
    defaultDurationMinutes: 27, // 27 mins (ICU Golden Window)
    medicalReason: "Trauma Road Accident Recovery",
    requesterPhone: "01812345678",
  },
  "case-103": {
    id: "case-103",
    patientName: "Meghla Akter",
    bloodGroup: "AB-",
    unitsNeeded: 1,
    pledgedUnits: 0,
    hospital: "Sylhet MAG Osmani Medical College",
    district: "Sylhet",
    upazila: "Kotwali",
    urgency: "urgent",
    defaultDurationMinutes: 270, // 4h 30m
    medicalReason: "Thalassemia Transfusion",
    requesterPhone: "01912345678",
  },
  "case-104": {
    id: "case-104",
    patientName: "Farhan Hossain",
    bloodGroup: "A+",
    unitsNeeded: 2,
    pledgedUnits: 1,
    hospital: "Rajshahi Medical College Hospital",
    district: "Rajshahi",
    upazila: "Boalia",
    urgency: "urgent",
    defaultDurationMinutes: 450, // 7h 30m
    medicalReason: "Open Heart Bypass Surgery",
    requesterPhone: "01612345678",
  },
};

/**
 * Retrieves the persistent target expiration timestamp for a case.
 * - If already stored in localStorage: returns the exact saved timestamp so time elapsed
 *   while the tab was closed is accurately deducted.
 * - If expired within the last 2 hours: keeps the expired state.
 * - If expired more than 2 hours ago: gracefully cycles a fresh window for ongoing demonstration.
 * - If running on server (SSR): returns an estimate based on Date.now().
 */
export function getPersistentEmergencyDeadline(caseId: string, durationMinutes: number): string {
  if (typeof window === "undefined") {
    return new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
  }

  const storageKey = `bloodlife_deadline_${caseId}`;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const targetTime = parseInt(stored, 10);
      if (!isNaN(targetTime)) {
        const now = Date.now();
        // If target is in the future or expired recently (within 2 hours), maintain the exact deadline
        if (targetTime > now || (now - targetTime) < 2 * 60 * 60 * 1000) {
          return new Date(targetTime).toISOString();
        }
      }
    }

    // Initialize new wall-clock deadline
    const newTarget = Date.now() + durationMinutes * 60 * 1000;
    localStorage.setItem(storageKey, newTarget.toString());
    return new Date(newTarget).toISOString();
  } catch {
    return new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
  }
}

/**
 * Gets the persistent pledged bags count for a sample case from localStorage.
 */
export function getPersistentPledgedUnits(caseId: string, defaultUnits: number): number {
  if (typeof window === "undefined") return defaultUnits;
  try {
    const stored = localStorage.getItem(`bloodlife_pledge_${caseId}`);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) return parsed;
    }
  } catch {}
  return defaultUnits;
}

/**
 * Persists an incremented pledge for a case.
 */
export function recordPersistentPledge(caseId: string, currentUnits: number, maxUnits: number): number {
  const nextUnits = Math.min(maxUnits, currentUnits + 1);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`bloodlife_pledge_${caseId}`, nextUnits.toString());
    } catch {}
  }
  return nextUnits;
}
