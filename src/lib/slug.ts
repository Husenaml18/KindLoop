import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no 0/O/I/l) since these end up in URLs people read aloud/type.
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const generateSlug = customAlphabet(alphabet, 12);
export const generateFilename = customAlphabet(alphabet, 16);
