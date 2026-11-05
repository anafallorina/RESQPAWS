
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

// Create a notification document
export async function createNotification({
  recipientUid,
  actorUid,
  type,
  title,
  message,
  reportId = "",
  status = "",
}) {
  if (!recipientUid || !actorUid || !type || !title || !message) {
    throw new Error("Missing required notification information.");
  }

  return addDoc(collection(db, "notifications"), {
    recipientUid,
    actorUid,
    type,
    title,
    message,
    reportId,
    status,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// Gentle three-note alarm
export function playNotificationSound() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();

  const playTone = (frequency, startTime, duration = 0.25) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(
      0.09,
      startTime + 0.035
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  };

  const now = audioContext.currentTime;

  playTone(660, now);
  playTone(784, now + 0.22);
  playTone(880, now + 0.44);

  setTimeout(() => {
    audioContext.close();
  }, 1500);
}
