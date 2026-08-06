/**
 * The ink engine moved into the Paper Engine — it is how *any* Kindloop
 * experience writes handwriting on, not something the love letter owns.
 * Re-exported here so the letter's own files read naturally.
 */
export {
  Handwritten,
  Signature,
  countWords,
  collectPauses,
  useWriteCursor,
  type InkStyle,
} from "@/lib/engines/paper/ink";
