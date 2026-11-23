/** Category colour (a `cat-*` class) used to tint an entity's glyph tile by kind. */
const KIND_CAT: Record<string, string> = {
  character: "cat-association",
  creature: "cat-romance",
  group: "cat-alliance",
  place: "cat-family",
  event: "cat-conflict",
  artifact: "cat-association",
  story: "cat-romance",
};

export const kindCat = (kind: string) => KIND_CAT[kind] ?? "cat-association";
