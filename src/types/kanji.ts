export type JLPTString = "N5" | "N4" | "N3" | "N2" | "N1";

export interface RawKanjiRecord {
  strokes: number;
  grade?: number;
  freq?: number;
  jlpt_old?: number;
  jlpt_new?: number; // 5..1
  meanings: string[];
  readings_on: string[];
  readings_kun: string[];
}

export interface KanjiListItem {
  char: string;
  jlpt: number; // 5..1, where 5 is N5
  meanings: string[];
  on: string[];
  kun: string[];
}

export const JLPT_LEVELS: JLPTString[] = ["N5", "N4", "N3", "N2", "N1"];

export const jlptStringToNumber = (lvl: JLPTString) => parseInt(lvl.replace("N", ""), 10);
