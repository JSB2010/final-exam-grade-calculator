import assert from "node:assert/strict"
import { test } from "node:test"
import { buildSharePayload, decodeShareData, encodeShareData, readShareDataFromLocation } from "../utils/share-data.ts"

const sample = {
  id: "sample",
  name: "Historia – 世界",
  current: 92.5,
  weight: 20,
  target: "A",
  color: "#12abcd",
  source: "canvas",
  canvasCourseId: 42,
  canvasCourseUrl: "https://school.example/courses/42",
  lastSyncedAt: "2026-11-20T00:00:00Z",
  assignments: [{ id: "1", name: "Private assignment", score: 10, totalPoints: 10, weight: 100 }],
}

test("share snapshots preserve calculation inputs but leave out Canvas metadata and assignments", () => {
  const payload = buildSharePayload({ classes: [sample] })
  const encoded = encodeShareData(payload)
  const decoded = decodeShareData(encoded)
  assert.deepEqual(decoded.classes[0], {
    id: "shared-1", name: "Historia – 世界", current: 92.5, weight: 20, target: "A", color: "#12abcd", assignments: [],
  })
})

test("opening a link prefers fragment data and supports existing query links", () => {
  assert.equal(readShareDataFromLocation({ hash: "#data=new", search: "?data=old" }), "new")
  assert.equal(readShareDataFromLocation({ hash: "", search: "?data=old" }), "old")
  assert.equal(readShareDataFromLocation({ hash: "", search: "" }), null)
})

test("bad data and oversized shares are rejected", () => {
  assert.equal(decodeShareData("not valid base64"), null)
  assert.equal(decodeShareData("a".repeat(20_000)), null)
  const payload = buildSharePayload({ classes: [{ ...sample, name: "x".repeat(20_000) }] })
  assert.throws(() => encodeShareData(payload), /Export a file/)
})

test("a backup validates before replacing saved grades", async () => {
  const { parseGradeBackup } = await import("../utils/storage-schemas.ts")
  assert.equal(parseGradeBackup({ classes: [sample] }).classes[0].name, sample.name)
  assert.equal(parseGradeBackup([sample]).classes.length, 1)
  assert.equal(parseGradeBackup({ classes: [{ ...sample, weight: 101 }] }), null)
  assert.equal(parseGradeBackup({ classes: [sample, sample] }), null)
  assert.equal(parseGradeBackup({ classes: [{ name: "Missing fields" }] }), null)
  assert.equal(parseGradeBackup({ classes: [sample], settings: false }), null)
})

test("CSV quotes commas, double quotes and newlines, and exports empty sets with headers", async () => {
  const { buildCsv } = await import("../utils/csv.ts")
  assert.equal(buildCsv([{ name: 'A, "B"\nC', score: -3 }]), 'name,score\r\n"A, ""B""\nC",-3')
  assert.equal(buildCsv([], ["name", "score"]), "name,score")
  assert.equal(buildCsv([{ name: "=2+2" }]), "name\r\n'=2+2")
})
