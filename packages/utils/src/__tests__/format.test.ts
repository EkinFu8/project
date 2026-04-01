import { describe, expect, it } from "vitest";
import { capitalize, formatDate, truncate } from "../format";

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2025-01-15");
    expect(result).toContain("2025");
    expect(result).toContain("January");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date(2025, 0, 15));
    expect(result).toContain("January");
  });
});

describe("truncate", () => {
  it("returns the string unchanged if within max length", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and adds ellipsis when exceeding max length", () => {
    expect(truncate("hello world", 6)).toBe("hello…");
  });
});

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("returns empty string unchanged", () => {
    expect(capitalize("")).toBe("");
  });
});
