"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sound Engine.
 *
 * Ambience with no audio files at all — every note is synthesised in the browser
 * from oscillators and filtered noise.
 *
 * The reason is not cleverness, it is honesty and weight. Kindloop ships no stock
 * loops: a "soft piano" nobody chose would be somebody else's music laid over
 * someone's letter to their mother, and it would cost a megabyte a page. So the
 * few sounds here are generated, kept deliberately sparse and very quiet, and are
 * meant to sit *under* silence rather than fill it.
 *
 * The synthesis is built to avoid the obvious trap of sounding like a keyboard
 * demo: notes are struck softly with a long tail, several detuned partials decay
 * at different rates, everything runs through a low-pass filter and a small
 * convolution-free reverb built from feedback delays, and the timing is uneven.
 *
 * Two rules it always obeys:
 *
 * 1. Nothing sounds until a person has interacted. Browsers block it, and
 *    starting sound at somebody unasked is rude regardless.
 * 2. It starts muted and says so. Sound is opt-in.
 */

export type Voice = "piano" | "paper" | "breeze" | "birds" | "cup";

interface Nodes {
  ctx: AudioContext;
  master: GainNode;
  /** Shared tail, so notes bloom into the same room. */
  wet: GainNode;
  lowpass: BiquadFilterNode;
}

/** One soft pentatonic set. Pentatonic because nothing in it can clash. */
const NOTES = [
  293.66, // D4
  329.63, // E4
  392.0, // G4
  440.0, // A4
  493.88, // B4
  587.33, // D5
  659.25, // E5
];

/** Deterministic 0..1 — the ambience must not depend on `Math.random` in render. */
function seeded(n: number): number {
  let h = 2166136261 ^ n;
  h = Math.imul(h, 16777619);
  h ^= h >>> 13;
  return ((h >>> 0) % 100000) / 100000;
}

function buildGraph(ctx: AudioContext): Nodes {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  /* Takes the edge off every voice — synthesised tones are harsh up top. */
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 2600;
  lowpass.Q.value = 0.4;
  lowpass.connect(master);

  /* A cheap room: three feedback delays at prime-ish intervals. Enough to stop
     notes ending abruptly, which is most of what makes synthesis sound cheap. */
  const wet = ctx.createGain();
  wet.gain.value = 0.34;
  wet.connect(lowpass);
  for (const time of [0.089, 0.131, 0.191]) {
    const delay = ctx.createDelay(1);
    delay.delayTime.value = time;
    const fb = ctx.createGain();
    fb.gain.value = 0.42;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 1800;
    wet.connect(delay);
    delay.connect(damp);
    damp.connect(fb);
    fb.connect(delay);
    damp.connect(lowpass);
  }

  return { ctx, master, wet, lowpass };
}

/**
 * One struck note. Three detuned partials with different decay lengths, so the
 * attack has some body and the tail thins out the way a real string does.
 */
function strike(n: Nodes, freq: number, at: number, level: number) {
  const partials: [number, number, number][] = [
    /* [ratio, gain, seconds] */
    [1, 1, 5.5],
    [2.01, 0.24, 2.6],
    [3.02, 0.09, 1.4],
  ];

  for (const [ratio, gain, life] of partials) {
    const osc = n.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    /* A touch of drift — perfectly stable pitch is the giveaway. */
    osc.detune.value = (seeded(Math.round(freq * ratio)) - 0.5) * 6;

    const env = n.ctx.createGain();
    env.gain.setValueAtTime(0, at);
    /* Soft attack: a struck felt hammer, not a click. */
    env.gain.linearRampToValueAtTime(level * gain, at + 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, at + life);

    osc.connect(env);
    env.connect(n.wet);
    env.connect(n.lowpass);
    osc.start(at);
    osc.stop(at + life + 0.1);
  }
}

/** Filtered noise — paper, breeze, the scrape of a cup on a table. */
function noise(n: Nodes, at: number, life: number, level: number, kind: Voice) {
  const frames = Math.floor(n.ctx.sampleRate * life);
  const buffer = n.ctx.createBuffer(1, Math.max(1, frames), n.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    /* Deterministic noise, and shaped so paper crackles unevenly rather than
       hissing flatly. */
    const r = seeded(i) * 2 - 1;
    const shape = kind === "paper" ? (seeded(i * 7) > 0.86 ? 1 : 0.22) : 1;
    data[i] = r * shape;
  }

  const src = n.ctx.createBufferSource();
  src.buffer = buffer;

  const band = n.ctx.createBiquadFilter();
  band.type = kind === "breeze" ? "lowpass" : "bandpass";
  band.frequency.value = kind === "paper" ? 2400 : kind === "cup" ? 1200 : 420;
  band.Q.value = kind === "cup" ? 6 : 0.8;

  const env = n.ctx.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(level, at + (kind === "breeze" ? life * 0.4 : 0.02));
  env.gain.exponentialRampToValueAtTime(0.0001, at + life);

  src.connect(band);
  band.connect(env);
  env.connect(kind === "paper" ? n.lowpass : n.wet);
  src.start(at);
  src.stop(at + life);
}

/** A short two-note call, well apart, so it reads as a bird and not a beep. */
function birdcall(n: Nodes, at: number) {
  for (let i = 0; i < 2; i += 1) {
    const osc = n.ctx.createOscillator();
    osc.type = "triangle";
    const base = 2100 + seeded(Math.round(at * 1000) + i) * 700;
    osc.frequency.setValueAtTime(base, at + i * 0.16);
    osc.frequency.exponentialRampToValueAtTime(base * 1.4, at + i * 0.16 + 0.07);
    const env = n.ctx.createGain();
    env.gain.setValueAtTime(0, at + i * 0.16);
    env.gain.linearRampToValueAtTime(0.05, at + i * 0.16 + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, at + i * 0.16 + 0.13);
    osc.connect(env);
    env.connect(n.wet);
    osc.start(at + i * 0.16);
    osc.stop(at + i * 0.16 + 0.2);
  }
}

export interface AmbientSound {
  /** Whether anything is audible right now. */
  on: boolean;
  /** Whether the browser can do this at all. */
  supported: boolean;
  /** Toggle. The first call is what unlocks audio, so it must come from a click. */
  toggle: () => void;
  /** A single soft note, for punctuating a moment. Silent while muted. */
  note: (which?: number) => void;
  /** A one-off sound. Silent while muted. */
  play: (voice: Voice) => void;
}

/**
 * Ambience for one page: a slow, sparse piano figure with the occasional bird and
 * a breath of breeze. Off until asked for.
 */
export function useAmbientSound(opts?: { notesEvery?: number; gain?: number }): AmbientSound {
  const notesEvery = opts?.notesEvery ?? 5200;
  const gain = opts?.gain ?? 0.16;

  const [on, setOn] = useState(false);
  /**
   * Assumed available until proven otherwise.
   *
   * Not probed on mount: the server has no `window`, so a mount-time check would
   * render one frame claiming support and then correct itself. `toggle()` finds
   * out for certain at the only moment it matters — when someone asks for sound.
   */
  const [supported, setSupported] = useState(true);
  const nodesRef = useRef<Nodes | null>(null);
  const stepRef = useRef(0);

  /* Built on first use, never before: constructing an AudioContext without a
     gesture leaves it suspended and warns in the console. */
  const graph = useCallback((): Nodes | null => {
    if (nodesRef.current) return nodesRef.current;
    if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return null;
    const ctx = new window.AudioContext();
    nodesRef.current = buildGraph(ctx);
    return nodesRef.current;
  }, []);

  const toggle = useCallback(() => {
    const n = graph();
    if (!n) {
      setSupported(false);
      return;
    }
    void n.ctx.resume();
    setOn((was) => {
      const next = !was;
      /* Ramped, so it fades in rather than arriving. Faster on the way up than it
         used to be: at 1.6s the acknowledgement note below was still climbing out
         of silence when it finished, which is indistinguishable from nothing. */
      n.master.gain.cancelScheduledValues(n.ctx.currentTime);
      n.master.gain.setValueAtTime(n.master.gain.value, n.ctx.currentTime);
      n.master.gain.linearRampToValueAtTime(next ? gain : 0, n.ctx.currentTime + (next ? 0.7 : 0.8));

      /*
       * Say something immediately.
       *
       * Turning sound on has to make a sound — that note *is* the confirmation
       * the button worked. Without it the first thing you hear is whenever the
       * slow figure next comes round, and somebody who hears nothing for six
       * seconds has already decided the feature is broken and turned it off.
       *
       * Struck directly rather than through `note()`, whose `on` is the stale
       * value from this render and would refuse.
       */
      if (next) strike(n, NOTES[2], n.ctx.currentTime + 0.12, 0.42);
      return next;
    });
  }, [graph, gain]);

  const note = useCallback(
    (which?: number) => {
      const n = nodesRef.current;
      if (!n || !on) return;
      const i = which ?? Math.floor(seeded(stepRef.current++) * NOTES.length);
      strike(n, NOTES[i % NOTES.length], n.ctx.currentTime + 0.02, 0.5);
    },
    [on]
  );

  const play = useCallback(
    (voice: Voice) => {
      const n = nodesRef.current;
      if (!n || !on) return;
      const at = n.ctx.currentTime + 0.02;
      if (voice === "piano") strike(n, NOTES[2], at, 0.5);
      else if (voice === "birds") birdcall(n, at);
      else if (voice === "paper") noise(n, at, 0.5, 0.16, "paper");
      else if (voice === "breeze") noise(n, at, 3.4, 0.05, "breeze");
      else if (voice === "cup") noise(n, at, 0.22, 0.1, "cup");
    },
    [on]
  );

  /* The slow figure. Notes land unevenly and often not at all, which is what
     keeps it from turning into a loop you notice. */
  useEffect(() => {
    if (!on) return;
    /*
     * Starts at 1, not 0.
     *
     * `seeded(0)` is 0.026 — below the silence threshold — and `step` began at 0
     * every time, so the first interval after switching on was *deterministically*
     * quiet for everybody. The unevenness meant to make this feel natural instead
     * guaranteed the worst case.
     */
    let step = 1;
    const id = setInterval(() => {
      const n = nodesRef.current;
      if (!n) return;
      const roll = seeded(step);
      step += 1;
      /* Roughly one interval in four stays silent. */
      if (roll < 0.26) return;
      const at = n.ctx.currentTime + roll * 0.4;
      strike(n, NOTES[Math.floor(roll * NOTES.length) % NOTES.length], at, 0.34);
      /* Sometimes a second note a moment later, like a hand rolling a chord. */
      if (roll > 0.72) {
        strike(n, NOTES[(Math.floor(roll * 13) + 2) % NOTES.length], at + 0.28 + roll * 0.2, 0.2);
      }
      if (seeded(step * 31) > 0.88) birdcall(n, at + 0.6);
      if (seeded(step * 17) > 0.9) noise(n, at + 0.2, 3.4, 0.04, "breeze");
    }, notesEvery);
    return () => clearInterval(id);
  }, [on, notesEvery]);

  /* Tear the context down on unmount, or it keeps running for the life of the tab. */
  useEffect(
    () => () => {
      const n = nodesRef.current;
      nodesRef.current = null;
      if (n) void n.ctx.close().catch(() => undefined);
    },
    []
  );

  return { on, supported, toggle, note, play };
}
