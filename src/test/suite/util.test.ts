import * as assert from "assert";
import * as util from "../../util";

describe("util test suite", function () {
  describe("isColor", function () {
    it("#RGB", function () {
      assert.ok(util.isColor("#012"));
      assert.ok(util.isColor("#acf"));
      assert.ok(util.isColor("#ACF"));
      assert.ok(util.isColor("#3aD"));
      assert.strictEqual(util.isColor("#0"), false);
      assert.strictEqual(util.isColor("#0f"), false);
      assert.strictEqual(util.isColor("#ghi"), false);
    });
    it("#RGBA", function () {
      assert.ok(util.isColor("#0124"));
      assert.ok(util.isColor("#acfd"));
      assert.ok(util.isColor("#ACFD"));
      assert.ok(util.isColor("#3aDc"));
      assert.strictEqual(util.isColor("#3aDcf"), false);
      assert.strictEqual(util.isColor("#a0kg"), false);
      assert.strictEqual(util.isColor("#la0f"), false);
    });
    it("#RRGGBB", function () {
      assert.ok(util.isColor("#001122"));
      assert.ok(util.isColor("#aabbff"));
      assert.ok(util.isColor("#BBAACC"));
      assert.ok(util.isColor("#1aFdD1"));
      assert.strictEqual(util.isColor("#1234567"), false);
      assert.strictEqual(util.isColor("#12345"), false);
    });
    it("#RRGGBBAA", function () {
      assert.ok(util.isColor("#01245678"));
      assert.ok(util.isColor("#aabbccdd"));
      assert.ok(util.isColor("#AABBCCDD"));
      assert.ok(util.isColor("#0a1BF1e2"));
      assert.strictEqual(util.isColor("#123456789"), false);
    });
    it("other", function () {
      assert.strictEqual(util.isColor("red"), true);
      assert.strictEqual(util.isColor("cat"), false);
      assert.strictEqual(util.isColor("123"), false);
    });
  });
});
