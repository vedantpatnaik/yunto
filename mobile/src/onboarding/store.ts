import { useSyncExternalStore } from "react";
import { api, setToken } from "../api/client";
import type { Creator, User } from "../api/hooks";

/**
 * Onboarding accumulator.
 *
 * The signup journey spans ~8 screens (join-path -> agency-code -> profile-setup
 * -> verify-link -> phone -> otp -> success). expo-router has no built-in place
 * to carry data between sibling routes, so this is a tiny module-level store the
 * steps write into and the final step submits. It is deliberately not
 * persisted: refreshing mid-flow starts over, which is the correct behaviour for
 * a signup wizard.
 */
export interface OnboardingData {
  joinPath?: "agency" | "solo";
  agencyCode?: string;
  name?: string;
  handle?: string;
  bio?: string;
  niche?: string;
  location?: string;
  creatorType?: string;
  phone?: string;
}

let state: OnboardingData = {};
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

/** Merge fields collected on the current step. */
export function setOnboarding(patch: Partial<OnboardingData>) {
  state = { ...state, ...patch };
  emit();
}

/** Clear the accumulator — call after a successful submit or on abandon. */
export function resetOnboarding() {
  state = {};
  emit();
}

export function getOnboarding(): OnboardingData {
  return state;
}

/** Subscribe a component to the accumulated data. */
export function useOnboarding(): OnboardingData {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getOnboarding,
    getOnboarding,
  );
}

export interface OnboardResult {
  token: string;
  user: User;
  creator: Creator;
  joinedAgency: string | null;
}

/**
 * Submit the accumulated onboarding data, creating a real Creator account and
 * logging the new user in (the returned token is stored). Called from the final
 * OTP step. Falls back to the collected name so a sparse flow still succeeds.
 */
export async function submitOnboarding(): Promise<OnboardResult> {
  const d = state;
  const res = await api<OnboardResult>("/auth/onboard", {
    method: "POST",
    body: JSON.stringify({
      name: d.name || "New Creator",
      handle: d.handle,
      phone: d.phone,
      niche: d.niche,
      bio: d.bio,
      location: d.location,
      joinPath: d.joinPath,
      agencyCode: d.joinPath === "agency" ? d.agencyCode : undefined,
    }),
  });
  await setToken(res.token);
  return res;
}
