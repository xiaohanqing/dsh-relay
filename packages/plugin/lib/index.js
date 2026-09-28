// dsh-relay host bundle — generated from src/ by build-host.mjs. DO NOT EDIT.
// Source of truth: packages/plugin/src/ ; rebuild: pnpm build (repo root)
import { createRequire as __cjs_createRequire } from 'node:module';
const require = __cjs_createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/qrcode/lib/can-promise.js
var require_can_promise = __commonJS({
  "../../node_modules/qrcode/lib/can-promise.js"(exports, module) {
    module.exports = function() {
      return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
    };
  }
});

// ../../node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS({
  "../../node_modules/qrcode/lib/core/utils.js"(exports) {
    var toSJISFunction;
    var CODEWORDS_COUNT = [
      0,
      // Not used
      26,
      44,
      70,
      100,
      134,
      172,
      196,
      242,
      292,
      346,
      404,
      466,
      532,
      581,
      655,
      733,
      815,
      901,
      991,
      1085,
      1156,
      1258,
      1364,
      1474,
      1588,
      1706,
      1828,
      1921,
      2051,
      2185,
      2323,
      2465,
      2611,
      2761,
      2876,
      3034,
      3196,
      3362,
      3532,
      3706
    ];
    exports.getSymbolSize = function getSymbolSize(version) {
      if (!version) throw new Error('"version" cannot be null or undefined');
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
      return version * 4 + 17;
    };
    exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
      return CODEWORDS_COUNT[version];
    };
    exports.getBCHDigit = function(data) {
      let digit = 0;
      while (data !== 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    };
    exports.setToSJISFunction = function setToSJISFunction(f) {
      if (typeof f !== "function") {
        throw new Error('"toSJISFunc" is not a valid function.');
      }
      toSJISFunction = f;
    };
    exports.isKanjiModeEnabled = function() {
      return typeof toSJISFunction !== "undefined";
    };
    exports.toSJIS = function toSJIS(kanji) {
      return toSJISFunction(kanji);
    };
  }
});

// ../../node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS({
  "../../node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
    exports.L = { bit: 1 };
    exports.M = { bit: 0 };
    exports.Q = { bit: 3 };
    exports.H = { bit: 2 };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports.L;
        case "m":
        case "medium":
          return exports.M;
        case "q":
        case "quartile":
          return exports.Q;
        case "h":
        case "high":
          return exports.H;
        default:
          throw new Error("Unknown EC Level: " + string);
      }
    }
    exports.isValid = function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    };
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// ../../node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS({
  "../../node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
    function BitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    BitBuffer.prototype = {
      get: function(index) {
        const bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
      },
      put: function(num, length) {
        for (let i = 0; i < length; i++) {
          this.putBit((num >>> length - i - 1 & 1) === 1);
        }
      },
      getLengthInBits: function() {
        return this.length;
      },
      putBit: function(bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      }
    };
    module.exports = BitBuffer;
  }
});

// ../../node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS({
  "../../node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
    function BitMatrix(size) {
      if (!size || size < 1) {
        throw new Error("BitMatrix size must be defined and greater than 0");
      }
      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }
    BitMatrix.prototype.set = function(row, col, value, reserved) {
      const index = row * this.size + col;
      this.data[index] = value;
      if (reserved) this.reservedBit[index] = true;
    };
    BitMatrix.prototype.get = function(row, col) {
      return this.data[row * this.size + col];
    };
    BitMatrix.prototype.xor = function(row, col, value) {
      this.data[row * this.size + col] ^= value;
    };
    BitMatrix.prototype.isReserved = function(row, col) {
      return this.reservedBit[row * this.size + col];
    };
    module.exports = BitMatrix;
  }
});

// ../../node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS({
  "../../node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    exports.getRowColCoords = function getRowColCoords(version) {
      if (version === 1) return [];
      const posCount = Math.floor(version / 7) + 2;
      const size = getSymbolSize(version);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    };
    exports.getPositions = function getPositions(version) {
      const coords = [];
      const pos = exports.getRowColCoords(version);
      const posLength = pos.length;
      for (let i = 0; i < posLength; i++) {
        for (let j = 0; j < posLength; j++) {
          if (i === 0 && j === 0 || // top-left
          i === 0 && j === posLength - 1 || // bottom-left
          i === posLength - 1 && j === 0) {
            continue;
          }
          coords.push([pos[i], pos[j]]);
        }
      }
      return coords;
    };
  }
});

// ../../node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS({
  "../../node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    var FINDER_PATTERN_SIZE = 7;
    exports.getPositions = function getPositions(version) {
      const size = getSymbolSize(version);
      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ];
    };
  }
});

// ../../node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS({
  "../../node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
    exports.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    var PenaltyScores = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    exports.isValid = function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    };
    exports.from = function from(value) {
      return exports.isValid(value) ? parseInt(value, 10) : void 0;
    };
    exports.getPenaltyN1 = function getPenaltyN1(data) {
      const size = data.size;
      let points = 0;
      let sameCountCol = 0;
      let sameCountRow = 0;
      let lastCol = null;
      let lastRow = null;
      for (let row = 0; row < size; row++) {
        sameCountCol = sameCountRow = 0;
        lastCol = lastRow = null;
        for (let col = 0; col < size; col++) {
          let module2 = data.get(row, col);
          if (module2 === lastCol) {
            sameCountCol++;
          } else {
            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
            lastCol = module2;
            sameCountCol = 1;
          }
          module2 = data.get(col, row);
          if (module2 === lastRow) {
            sameCountRow++;
          } else {
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
            lastRow = module2;
            sameCountRow = 1;
          }
        }
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
      }
      return points;
    };
    exports.getPenaltyN2 = function getPenaltyN2(data) {
      const size = data.size;
      let points = 0;
      for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
          const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
          if (last === 4 || last === 0) points++;
        }
      }
      return points * PenaltyScores.N2;
    };
    exports.getPenaltyN3 = function getPenaltyN3(data) {
      const size = data.size;
      let points = 0;
      let bitsCol = 0;
      let bitsRow = 0;
      for (let row = 0; row < size; row++) {
        bitsCol = bitsRow = 0;
        for (let col = 0; col < size; col++) {
          bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
          if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
          bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
          if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
        }
      }
      return points * PenaltyScores.N3;
    };
    exports.getPenaltyN4 = function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k * PenaltyScores.N4;
    };
    function getMaskAt(maskPattern, i, j) {
      switch (maskPattern) {
        case exports.Patterns.PATTERN000:
          return (i + j) % 2 === 0;
        case exports.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports.Patterns.PATTERN010:
          return j % 3 === 0;
        case exports.Patterns.PATTERN011:
          return (i + j) % 3 === 0;
        case exports.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case exports.Patterns.PATTERN101:
          return i * j % 2 + i * j % 3 === 0;
        case exports.Patterns.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 === 0;
        case exports.Patterns.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }
    exports.applyMask = function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    };
    exports.getBestMask = function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p = 0; p < numPatterns; p++) {
        setupFormatFunc(p);
        exports.applyMask(p, data);
        const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
        exports.applyMask(p, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p;
        }
      }
      return bestPattern;
    };
  }
});

// ../../node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS({
  "../../node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
    var ECLevel = require_error_correction_level();
    var EC_BLOCKS_TABLE = [
      // L  M  Q  H
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      4,
      1,
      2,
      4,
      4,
      2,
      4,
      4,
      4,
      2,
      4,
      6,
      5,
      2,
      4,
      6,
      6,
      2,
      5,
      8,
      8,
      4,
      5,
      8,
      8,
      4,
      5,
      8,
      11,
      4,
      8,
      10,
      11,
      4,
      9,
      12,
      16,
      4,
      9,
      16,
      16,
      6,
      10,
      12,
      18,
      6,
      10,
      17,
      16,
      6,
      11,
      16,
      19,
      6,
      13,
      18,
      21,
      7,
      14,
      21,
      25,
      8,
      16,
      20,
      25,
      8,
      17,
      23,
      25,
      9,
      17,
      23,
      34,
      9,
      18,
      25,
      30,
      10,
      20,
      27,
      32,
      12,
      21,
      29,
      35,
      12,
      23,
      34,
      37,
      12,
      25,
      34,
      40,
      13,
      26,
      35,
      42,
      14,
      28,
      38,
      45,
      15,
      29,
      40,
      48,
      16,
      31,
      43,
      51,
      17,
      33,
      45,
      54,
      18,
      35,
      48,
      57,
      19,
      37,
      51,
      60,
      19,
      38,
      53,
      63,
      20,
      40,
      56,
      66,
      21,
      43,
      59,
      70,
      22,
      45,
      62,
      74,
      24,
      47,
      65,
      77,
      25,
      49,
      68,
      81
    ];
    var EC_CODEWORDS_TABLE = [
      // L  M  Q  H
      7,
      10,
      13,
      17,
      10,
      16,
      22,
      28,
      15,
      26,
      36,
      44,
      20,
      36,
      52,
      64,
      26,
      48,
      72,
      88,
      36,
      64,
      96,
      112,
      40,
      72,
      108,
      130,
      48,
      88,
      132,
      156,
      60,
      110,
      160,
      192,
      72,
      130,
      192,
      224,
      80,
      150,
      224,
      264,
      96,
      176,
      260,
      308,
      104,
      198,
      288,
      352,
      120,
      216,
      320,
      384,
      132,
      240,
      360,
      432,
      144,
      280,
      408,
      480,
      168,
      308,
      448,
      532,
      180,
      338,
      504,
      588,
      196,
      364,
      546,
      650,
      224,
      416,
      600,
      700,
      224,
      442,
      644,
      750,
      252,
      476,
      690,
      816,
      270,
      504,
      750,
      900,
      300,
      560,
      810,
      960,
      312,
      588,
      870,
      1050,
      336,
      644,
      952,
      1110,
      360,
      700,
      1020,
      1200,
      390,
      728,
      1050,
      1260,
      420,
      784,
      1140,
      1350,
      450,
      812,
      1200,
      1440,
      480,
      868,
      1290,
      1530,
      510,
      924,
      1350,
      1620,
      540,
      980,
      1440,
      1710,
      570,
      1036,
      1530,
      1800,
      570,
      1064,
      1590,
      1890,
      600,
      1120,
      1680,
      1980,
      630,
      1204,
      1770,
      2100,
      660,
      1260,
      1860,
      2220,
      720,
      1316,
      1950,
      2310,
      750,
      1372,
      2040,
      2430
    ];
    exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
    exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
  }
});

// ../../node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS({
  "../../node_modules/qrcode/lib/core/galois-field.js"(exports) {
    var EXP_TABLE = new Uint8Array(512);
    var LOG_TABLE = new Uint8Array(256);
    (function initTables() {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x <<= 1;
        if (x & 256) {
          x ^= 285;
        }
      }
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    })();
    exports.log = function log(n) {
      if (n < 1) throw new Error("log(" + n + ")");
      return LOG_TABLE[n];
    };
    exports.exp = function exp(n) {
      return EXP_TABLE[n];
    };
    exports.mul = function mul(x, y) {
      if (x === 0 || y === 0) return 0;
      return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
    };
  }
});

// ../../node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS({
  "../../node_modules/qrcode/lib/core/polynomial.js"(exports) {
    var GF = require_galois_field();
    exports.mul = function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
          coeff[i + j] ^= GF.mul(p1[i], p2[j]);
        }
      }
      return coeff;
    };
    exports.mod = function mod(divident, divisor) {
      let result = new Uint8Array(divident);
      while (result.length - divisor.length >= 0) {
        const coeff = result[0];
        for (let i = 0; i < divisor.length; i++) {
          result[i] ^= GF.mul(divisor[i], coeff);
        }
        let offset = 0;
        while (offset < result.length && result[offset] === 0) offset++;
        result = result.slice(offset);
      }
      return result;
    };
    exports.generateECPolynomial = function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    };
  }
});

// ../../node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS({
  "../../node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
    var Polynomial = require_polynomial();
    function ReedSolomonEncoder(degree) {
      this.genPoly = void 0;
      this.degree = degree;
      if (this.degree) this.initialize(this.degree);
    }
    ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    };
    ReedSolomonEncoder.prototype.encode = function encode(data) {
      if (!this.genPoly) {
        throw new Error("Encoder not initialized");
      }
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);
      const remainder = Polynomial.mod(paddedData, this.genPoly);
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);
        return buff;
      }
      return remainder;
    };
    module.exports = ReedSolomonEncoder;
  }
});

// ../../node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS({
  "../../node_modules/qrcode/lib/core/version-check.js"(exports) {
    exports.isValid = function isValid(version) {
      return !isNaN(version) && version >= 1 && version <= 40;
    };
  }
});

// ../../node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS({
  "../../node_modules/qrcode/lib/core/regex.js"(exports) {
    var numeric = "[0-9]+";
    var alphanumeric = "[A-Z $%*+\\-./:]+";
    var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
    kanji = kanji.replace(/u/g, "\\u");
    var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
    exports.KANJI = new RegExp(kanji, "g");
    exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
    exports.BYTE = new RegExp(byte, "g");
    exports.NUMERIC = new RegExp(numeric, "g");
    exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
    var TEST_KANJI = new RegExp("^" + kanji + "$");
    var TEST_NUMERIC = new RegExp("^" + numeric + "$");
    var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
    exports.testKanji = function testKanji(str) {
      return TEST_KANJI.test(str);
    };
    exports.testNumeric = function testNumeric(str) {
      return TEST_NUMERIC.test(str);
    };
    exports.testAlphanumeric = function testAlphanumeric(str) {
      return TEST_ALPHANUMERIC.test(str);
    };
  }
});

// ../../node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS({
  "../../node_modules/qrcode/lib/core/mode.js"(exports) {
    var VersionCheck = require_version_check();
    var Regex = require_regex();
    exports.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports.MIXED = {
      bit: -1
    };
    exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
      if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid version: " + version);
      }
      if (version >= 1 && version < 10) return mode.ccBits[0];
      else if (version < 27) return mode.ccBits[1];
      return mode.ccBits[2];
    };
    exports.getBestModeForData = function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports.KANJI;
      else return exports.BYTE;
    };
    exports.toString = function toString(mode) {
      if (mode && mode.id) return mode.id;
      throw new Error("Invalid mode");
    };
    exports.isValid = function isValid(mode) {
      return mode && mode.bit && mode.ccBits;
    };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports.NUMERIC;
        case "alphanumeric":
          return exports.ALPHANUMERIC;
        case "kanji":
          return exports.KANJI;
        case "byte":
          return exports.BYTE;
        default:
          throw new Error("Unknown mode: " + string);
      }
    }
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// ../../node_modules/qrcode/lib/core/version.js
var require_version = __commonJS({
  "../../node_modules/qrcode/lib/core/version.js"(exports) {
    var Utils = require_utils();
    var ECCode = require_error_correction_code();
    var ECLevel = require_error_correction_level();
    var Mode = require_mode();
    var VersionCheck = require_version_check();
    var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    var G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    function getReservedBitsCount(mode, version) {
      return Mode.getCharCountIndicator(mode, version) + 4;
    }
    function getTotalBitsFromDataArray(segments, version) {
      let totalBits = 0;
      segments.forEach(function(data) {
        const reservedBits = getReservedBitsCount(data.mode, version);
        totalBits += reservedBits + data.getBitsLength();
      });
      return totalBits;
    }
    function getBestVersionForMixedData(segments, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        const length = getTotalBitsFromDataArray(segments, currentVersion);
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    exports.from = function from(value, defaultValue) {
      if (VersionCheck.isValid(value)) {
        return parseInt(value, 10);
      }
      return defaultValue;
    };
    exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode === "undefined") mode = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
      switch (mode) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    };
    exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
      if (Array.isArray(data)) {
        if (data.length > 1) {
          return getBestVersionForMixedData(data, ecl);
        }
        if (data.length === 0) {
          return 1;
        }
        seg = data[0];
      } else {
        seg = data;
      }
      return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
    };
    exports.getEncodedBits = function getEncodedBits(version) {
      if (!VersionCheck.isValid(version) || version < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d = version << 12;
      while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
        d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
      }
      return version << 12 | d;
    };
  }
});

// ../../node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS({
  "../../node_modules/qrcode/lib/core/format-info.js"(exports) {
    var Utils = require_utils();
    var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
    var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
    var G15_BCH = Utils.getBCHDigit(G15);
    exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
      const data = errorCorrectionLevel.bit << 3 | mask;
      let d = data << 10;
      while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
        d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
      }
      return (data << 10 | d) ^ G15_MASK;
    };
  }
});

// ../../node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS({
  "../../node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
    var Mode = require_mode();
    function NumericData(data) {
      this.mode = Mode.NUMERIC;
      this.data = data.toString();
    }
    NumericData.getBitsLength = function getBitsLength(length) {
      return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
    };
    NumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    NumericData.prototype.getBitsLength = function getBitsLength() {
      return NumericData.getBitsLength(this.data.length);
    };
    NumericData.prototype.write = function write2(bitBuffer) {
      let i, group, value;
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value = parseInt(group, 10);
        bitBuffer.put(value, 10);
      }
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value = parseInt(group, 10);
        bitBuffer.put(value, remainingNum * 3 + 1);
      }
    };
    module.exports = NumericData;
  }
});

// ../../node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS({
  "../../node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
    var Mode = require_mode();
    var ALPHA_NUM_CHARS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "$",
      "%",
      "*",
      "+",
      "-",
      ".",
      "/",
      ":"
    ];
    function AlphanumericData(data) {
      this.mode = Mode.ALPHANUMERIC;
      this.data = data;
    }
    AlphanumericData.getBitsLength = function getBitsLength(length) {
      return 11 * Math.floor(length / 2) + 6 * (length % 2);
    };
    AlphanumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    AlphanumericData.prototype.getBitsLength = function getBitsLength() {
      return AlphanumericData.getBitsLength(this.data.length);
    };
    AlphanumericData.prototype.write = function write2(bitBuffer) {
      let i;
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
        value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
        bitBuffer.put(value, 11);
      }
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    };
    module.exports = AlphanumericData;
  }
});

// ../../node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS({
  "../../node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
    var Mode = require_mode();
    function ByteData(data) {
      this.mode = Mode.BYTE;
      if (typeof data === "string") {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }
    ByteData.getBitsLength = function getBitsLength(length) {
      return length * 8;
    };
    ByteData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    ByteData.prototype.getBitsLength = function getBitsLength() {
      return ByteData.getBitsLength(this.data.length);
    };
    ByteData.prototype.write = function(bitBuffer) {
      for (let i = 0, l = this.data.length; i < l; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };
    module.exports = ByteData;
  }
});

// ../../node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS({
  "../../node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
    var Mode = require_mode();
    var Utils = require_utils();
    function KanjiData(data) {
      this.mode = Mode.KANJI;
      this.data = data;
    }
    KanjiData.getBitsLength = function getBitsLength(length) {
      return length * 13;
    };
    KanjiData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    KanjiData.prototype.getBitsLength = function getBitsLength() {
      return KanjiData.getBitsLength(this.data.length);
    };
    KanjiData.prototype.write = function(bitBuffer) {
      let i;
      for (i = 0; i < this.data.length; i++) {
        let value = Utils.toSJIS(this.data[i]);
        if (value >= 33088 && value <= 40956) {
          value -= 33088;
        } else if (value >= 57408 && value <= 60351) {
          value -= 49472;
        } else {
          throw new Error(
            "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
          );
        }
        value = (value >>> 8 & 255) * 192 + (value & 255);
        bitBuffer.put(value, 13);
      }
    };
    module.exports = KanjiData;
  }
});

// ../../node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS({
  "../../node_modules/dijkstrajs/dijkstra.js"(exports, module) {
    "use strict";
    var dijkstra = {
      single_source_shortest_paths: function(graph, s, d) {
        var predecessors = {};
        var costs = {};
        costs[s] = 0;
        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);
        var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
        while (!open.empty()) {
          closest = open.pop();
          u = closest.value;
          cost_of_s_to_u = closest.cost;
          adjacent_nodes = graph[u] || {};
          for (v in adjacent_nodes) {
            if (adjacent_nodes.hasOwnProperty(v)) {
              cost_of_e = adjacent_nodes[v];
              cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
              cost_of_s_to_v = costs[v];
              first_visit = typeof costs[v] === "undefined";
              if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                costs[v] = cost_of_s_to_u_plus_cost_of_e;
                open.push(v, cost_of_s_to_u_plus_cost_of_e);
                predecessors[v] = u;
              }
            }
          }
        }
        if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
          var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
          throw new Error(msg);
        }
        return predecessors;
      },
      extract_shortest_path_from_predecessor_list: function(predecessors, d) {
        var nodes = [];
        var u = d;
        var predecessor;
        while (u) {
          nodes.push(u);
          predecessor = predecessors[u];
          u = predecessors[u];
        }
        nodes.reverse();
        return nodes;
      },
      find_path: function(graph, s, d) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
        return dijkstra.extract_shortest_path_from_predecessor_list(
          predecessors,
          d
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(opts) {
          var T = dijkstra.PriorityQueue, t = {}, key;
          opts = opts || {};
          for (key in T) {
            if (T.hasOwnProperty(key)) {
              t[key] = T[key];
            }
          }
          t.queue = [];
          t.sorter = opts.sorter || T.default_sorter;
          return t;
        },
        default_sorter: function(a, b) {
          return a.cost - b.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(value, cost) {
          var item = { value, cost };
          this.queue.push(item);
          this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    if (typeof module !== "undefined") {
      module.exports = dijkstra;
    }
  }
});

// ../../node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS({
  "../../node_modules/qrcode/lib/core/segments.js"(exports) {
    var Mode = require_mode();
    var NumericData = require_numeric_data();
    var AlphanumericData = require_alphanumeric_data();
    var ByteData = require_byte_data();
    var KanjiData = require_kanji_data();
    var Regex = require_regex();
    var Utils = require_utils();
    var dijkstra = require_dijkstra();
    function getStringByteLength(str) {
      return unescape(encodeURIComponent(str)).length;
    }
    function getSegments(regex, mode, str) {
      const segments = [];
      let result;
      while ((result = regex.exec(str)) !== null) {
        segments.push({
          data: result[0],
          index: result.index,
          mode,
          length: result[0].length
        });
      }
      return segments;
    }
    function getSegmentsFromString(dataStr) {
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
        kanjiSegs = [];
      }
      const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
      return segs.sort(function(s1, s2) {
        return s1.index - s2.index;
      }).map(function(obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        };
      });
    }
    function getSegmentBitsLength(length, mode) {
      switch (mode) {
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length);
        case Mode.BYTE:
          return ByteData.getBitsLength(length);
      }
    }
    function mergeSegments(segs) {
      return segs.reduce(function(acc, curr) {
        const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
        if (prevSeg && prevSeg.mode === curr.mode) {
          acc[acc.length - 1].data += curr.data;
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);
    }
    function buildNodes(segs) {
      const nodes = [];
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        switch (seg.mode) {
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
        }
      }
      return nodes;
    }
    function buildGraph(nodes, version) {
      const table = {};
      const graph = { start: {} };
      let prevNodeIds = ["start"];
      for (let i = 0; i < nodes.length; i++) {
        const nodeGroup = nodes[i];
        const currentNodeIds = [];
        for (let j = 0; j < nodeGroup.length; j++) {
          const node = nodeGroup[j];
          const key = "" + i + j;
          currentNodeIds.push(key);
          table[key] = { node, lastCount: 0 };
          graph[key] = {};
          for (let n = 0; n < prevNodeIds.length; n++) {
            const prevNodeId = prevNodeIds[n];
            if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
              graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
              table[prevNodeId].lastCount += node.length;
            } else {
              if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
            }
          }
        }
        prevNodeIds = currentNodeIds;
      }
      for (let n = 0; n < prevNodeIds.length; n++) {
        graph[prevNodeIds[n]].end = 0;
      }
      return { map: graph, table };
    }
    function buildSingleSegment(data, modesHint) {
      let mode;
      const bestMode = Mode.getBestModeForData(data);
      mode = Mode.from(modesHint, bestMode);
      if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode = Mode.BYTE;
      }
      switch (mode) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    exports.fromArray = function fromArray(array) {
      return array.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    };
    exports.fromString = function fromString(data, version) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version);
      const path = dijkstra.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports.fromArray(mergeSegments(optimizedSegs));
    };
    exports.rawSplit = function rawSplit(data) {
      return exports.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    };
  }
});

// ../../node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS({
  "../../node_modules/qrcode/lib/core/qrcode.js"(exports) {
    var Utils = require_utils();
    var ECLevel = require_error_correction_level();
    var BitBuffer = require_bit_buffer();
    var BitMatrix = require_bit_matrix();
    var AlignmentPattern = require_alignment_pattern();
    var FinderPattern = require_finder_pattern();
    var MaskPattern = require_mask_pattern();
    var ECCode = require_error_correction_code();
    var ReedSolomonEncoder = require_reed_solomon_encoder();
    var Version = require_version();
    var FormatInfo = require_format_info();
    var Mode = require_mode();
    var Segments = require_segments();
    function setupFinderPattern(matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue;
          for (let c = -1; c <= 7; c++) {
            if (col + c <= -1 || size <= col + c) continue;
            if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupTimingPattern(matrix) {
      const size = matrix.size;
      for (let r = 8; r < size - 8; r++) {
        const value = r % 2 === 0;
        matrix.set(r, 6, value, true);
        matrix.set(6, r, value, true);
      }
    }
    function setupAlignmentPattern(matrix, version) {
      const pos = AlignmentPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupVersionInfo(matrix, version) {
      const size = matrix.size;
      const bits = Version.getEncodedBits(version);
      let row, col, mod;
      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod = (bits >> i & 1) === 1;
        matrix.set(row, col, mod, true);
        matrix.set(col, row, mod, true);
      }
    }
    function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod;
      for (i = 0; i < 15; i++) {
        mod = (bits >> i & 1) === 1;
        if (i < 6) {
          matrix.set(i, 8, mod, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod, true);
        } else {
          matrix.set(size - 15 + i, 8, mod, true);
        }
        if (i < 8) {
          matrix.set(8, size - i - 1, mod, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod, true);
        } else {
          matrix.set(8, 15 - i - 1, mod, true);
        }
      }
      matrix.set(size - 8, 8, 1, true);
    }
    function setupData(matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (!matrix.isReserved(row, col - c)) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
              }
              matrix.set(row, col - c, dark);
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
    function createData(version, errorCorrectionLevel, segments) {
      const buffer = new BitBuffer();
      segments.forEach(function(data) {
        buffer.put(data.mode.bit, 4);
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
        data.write(buffer);
      });
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 17 : 236, 8);
      }
      return createCodewords(buffer, version, errorCorrectionLevel);
    }
    function createCodewords(bitBuffer, version, errorCorrectionLevel) {
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
      const rs = new ReedSolomonEncoder(ecCount);
      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);
      for (let b = 0; b < ecTotalBlocks; b++) {
        const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
        dcData[b] = buffer.slice(offset, offset + dataSize);
        ecData[b] = rs.encode(dcData[b]);
        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }
      return data;
    }
    function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
      let segments;
      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === "string") {
        let estimatedVersion = version;
        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error("Invalid data");
      }
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
      if (!bestVersion) {
        throw new Error("The amount of data is too big to be stored in a QR Code");
      }
      if (!version) {
        version = bestVersion;
      } else if (version < bestVersion) {
        throw new Error(
          "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
        );
      }
      const dataBits = createData(version, errorCorrectionLevel, segments);
      const moduleCount = Utils.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);
      setupFormatInfo(modules, errorCorrectionLevel, 0);
      if (version >= 7) {
        setupVersionInfo(modules, version);
      }
      setupData(modules, dataBits);
      if (isNaN(maskPattern)) {
        maskPattern = MaskPattern.getBestMask(
          modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel)
        );
      }
      MaskPattern.applyMask(maskPattern, modules);
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
      return {
        modules,
        version,
        errorCorrectionLevel,
        maskPattern,
        segments
      };
    }
    exports.create = function create(data, options) {
      if (typeof data === "undefined" || data === "") {
        throw new Error("No input text");
      }
      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;
      if (typeof options !== "undefined") {
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);
        if (options.toSJISFunc) {
          Utils.setToSJISFunction(options.toSJISFunc);
        }
      }
      return createSymbol(data, version, errorCorrectionLevel, mask);
    };
  }
});

// ../../node_modules/pngjs/lib/chunkstream.js
var require_chunkstream = __commonJS({
  "../../node_modules/pngjs/lib/chunkstream.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var Stream = __require("stream");
    var ChunkStream = module.exports = function() {
      Stream.call(this);
      this._buffers = [];
      this._buffered = 0;
      this._reads = [];
      this._paused = false;
      this._encoding = "utf8";
      this.writable = true;
    };
    util.inherits(ChunkStream, Stream);
    ChunkStream.prototype.read = function(length, callback) {
      this._reads.push({
        length: Math.abs(length),
        // if length < 0 then at most this length
        allowLess: length < 0,
        func: callback
      });
      process.nextTick(
        function() {
          this._process();
          if (this._paused && this._reads && this._reads.length > 0) {
            this._paused = false;
            this.emit("drain");
          }
        }.bind(this)
      );
    };
    ChunkStream.prototype.write = function(data, encoding) {
      if (!this.writable) {
        this.emit("error", new Error("Stream not writable"));
        return false;
      }
      let dataBuffer;
      if (Buffer.isBuffer(data)) {
        dataBuffer = data;
      } else {
        dataBuffer = Buffer.from(data, encoding || this._encoding);
      }
      this._buffers.push(dataBuffer);
      this._buffered += dataBuffer.length;
      this._process();
      if (this._reads && this._reads.length === 0) {
        this._paused = true;
      }
      return this.writable && !this._paused;
    };
    ChunkStream.prototype.end = function(data, encoding) {
      if (data) {
        this.write(data, encoding);
      }
      this.writable = false;
      if (!this._buffers) {
        return;
      }
      if (this._buffers.length === 0) {
        this._end();
      } else {
        this._buffers.push(null);
        this._process();
      }
    };
    ChunkStream.prototype.destroySoon = ChunkStream.prototype.end;
    ChunkStream.prototype._end = function() {
      if (this._reads.length > 0) {
        this.emit("error", new Error("Unexpected end of input"));
      }
      this.destroy();
    };
    ChunkStream.prototype.destroy = function() {
      if (!this._buffers) {
        return;
      }
      this.writable = false;
      this._reads = null;
      this._buffers = null;
      this.emit("close");
    };
    ChunkStream.prototype._processReadAllowingLess = function(read2) {
      this._reads.shift();
      let smallerBuf = this._buffers[0];
      if (smallerBuf.length > read2.length) {
        this._buffered -= read2.length;
        this._buffers[0] = smallerBuf.slice(read2.length);
        read2.func.call(this, smallerBuf.slice(0, read2.length));
      } else {
        this._buffered -= smallerBuf.length;
        this._buffers.shift();
        read2.func.call(this, smallerBuf);
      }
    };
    ChunkStream.prototype._processRead = function(read2) {
      this._reads.shift();
      let pos = 0;
      let count = 0;
      let data = Buffer.alloc(read2.length);
      while (pos < read2.length) {
        let buf = this._buffers[count++];
        let len = Math.min(buf.length, read2.length - pos);
        buf.copy(data, pos, 0, len);
        pos += len;
        if (len !== buf.length) {
          this._buffers[--count] = buf.slice(len);
        }
      }
      if (count > 0) {
        this._buffers.splice(0, count);
      }
      this._buffered -= read2.length;
      read2.func.call(this, data);
    };
    ChunkStream.prototype._process = function() {
      try {
        while (this._buffered > 0 && this._reads && this._reads.length > 0) {
          let read2 = this._reads[0];
          if (read2.allowLess) {
            this._processReadAllowingLess(read2);
          } else if (this._buffered >= read2.length) {
            this._processRead(read2);
          } else {
            break;
          }
        }
        if (this._buffers && !this.writable) {
          this._end();
        }
      } catch (ex) {
        this.emit("error", ex);
      }
    };
  }
});

// ../../node_modules/pngjs/lib/interlace.js
var require_interlace = __commonJS({
  "../../node_modules/pngjs/lib/interlace.js"(exports) {
    "use strict";
    var imagePasses = [
      {
        // pass 1 - 1px
        x: [0],
        y: [0]
      },
      {
        // pass 2 - 1px
        x: [4],
        y: [0]
      },
      {
        // pass 3 - 2px
        x: [0, 4],
        y: [4]
      },
      {
        // pass 4 - 4px
        x: [2, 6],
        y: [0, 4]
      },
      {
        // pass 5 - 8px
        x: [0, 2, 4, 6],
        y: [2, 6]
      },
      {
        // pass 6 - 16px
        x: [1, 3, 5, 7],
        y: [0, 2, 4, 6]
      },
      {
        // pass 7 - 32px
        x: [0, 1, 2, 3, 4, 5, 6, 7],
        y: [1, 3, 5, 7]
      }
    ];
    exports.getImagePasses = function(width, height) {
      let images = [];
      let xLeftOver = width % 8;
      let yLeftOver = height % 8;
      let xRepeats = (width - xLeftOver) / 8;
      let yRepeats = (height - yLeftOver) / 8;
      for (let i = 0; i < imagePasses.length; i++) {
        let pass = imagePasses[i];
        let passWidth = xRepeats * pass.x.length;
        let passHeight = yRepeats * pass.y.length;
        for (let j = 0; j < pass.x.length; j++) {
          if (pass.x[j] < xLeftOver) {
            passWidth++;
          } else {
            break;
          }
        }
        for (let j = 0; j < pass.y.length; j++) {
          if (pass.y[j] < yLeftOver) {
            passHeight++;
          } else {
            break;
          }
        }
        if (passWidth > 0 && passHeight > 0) {
          images.push({ width: passWidth, height: passHeight, index: i });
        }
      }
      return images;
    };
    exports.getInterlaceIterator = function(width) {
      return function(x, y, pass) {
        let outerXLeftOver = x % imagePasses[pass].x.length;
        let outerX = (x - outerXLeftOver) / imagePasses[pass].x.length * 8 + imagePasses[pass].x[outerXLeftOver];
        let outerYLeftOver = y % imagePasses[pass].y.length;
        let outerY = (y - outerYLeftOver) / imagePasses[pass].y.length * 8 + imagePasses[pass].y[outerYLeftOver];
        return outerX * 4 + outerY * width * 4;
      };
    };
  }
});

// ../../node_modules/pngjs/lib/paeth-predictor.js
var require_paeth_predictor = __commonJS({
  "../../node_modules/pngjs/lib/paeth-predictor.js"(exports, module) {
    "use strict";
    module.exports = function paethPredictor(left, above, upLeft) {
      let paeth = left + above - upLeft;
      let pLeft = Math.abs(paeth - left);
      let pAbove = Math.abs(paeth - above);
      let pUpLeft = Math.abs(paeth - upLeft);
      if (pLeft <= pAbove && pLeft <= pUpLeft) {
        return left;
      }
      if (pAbove <= pUpLeft) {
        return above;
      }
      return upLeft;
    };
  }
});

// ../../node_modules/pngjs/lib/filter-parse.js
var require_filter_parse = __commonJS({
  "../../node_modules/pngjs/lib/filter-parse.js"(exports, module) {
    "use strict";
    var interlaceUtils = require_interlace();
    var paethPredictor = require_paeth_predictor();
    function getByteWidth(width, bpp, depth) {
      let byteWidth = width * bpp;
      if (depth !== 8) {
        byteWidth = Math.ceil(byteWidth / (8 / depth));
      }
      return byteWidth;
    }
    var Filter = module.exports = function(bitmapInfo, dependencies) {
      let width = bitmapInfo.width;
      let height = bitmapInfo.height;
      let interlace = bitmapInfo.interlace;
      let bpp = bitmapInfo.bpp;
      let depth = bitmapInfo.depth;
      this.read = dependencies.read;
      this.write = dependencies.write;
      this.complete = dependencies.complete;
      this._imageIndex = 0;
      this._images = [];
      if (interlace) {
        let passes = interlaceUtils.getImagePasses(width, height);
        for (let i = 0; i < passes.length; i++) {
          this._images.push({
            byteWidth: getByteWidth(passes[i].width, bpp, depth),
            height: passes[i].height,
            lineIndex: 0
          });
        }
      } else {
        this._images.push({
          byteWidth: getByteWidth(width, bpp, depth),
          height,
          lineIndex: 0
        });
      }
      if (depth === 8) {
        this._xComparison = bpp;
      } else if (depth === 16) {
        this._xComparison = bpp * 2;
      } else {
        this._xComparison = 1;
      }
    };
    Filter.prototype.start = function() {
      this.read(
        this._images[this._imageIndex].byteWidth + 1,
        this._reverseFilterLine.bind(this)
      );
    };
    Filter.prototype._unFilterType1 = function(rawData, unfilteredLine, byteWidth) {
      let xComparison = this._xComparison;
      let xBiggerThan = xComparison - 1;
      for (let x = 0; x < byteWidth; x++) {
        let rawByte = rawData[1 + x];
        let f1Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
        unfilteredLine[x] = rawByte + f1Left;
      }
    };
    Filter.prototype._unFilterType2 = function(rawData, unfilteredLine, byteWidth) {
      let lastLine = this._lastLine;
      for (let x = 0; x < byteWidth; x++) {
        let rawByte = rawData[1 + x];
        let f2Up = lastLine ? lastLine[x] : 0;
        unfilteredLine[x] = rawByte + f2Up;
      }
    };
    Filter.prototype._unFilterType3 = function(rawData, unfilteredLine, byteWidth) {
      let xComparison = this._xComparison;
      let xBiggerThan = xComparison - 1;
      let lastLine = this._lastLine;
      for (let x = 0; x < byteWidth; x++) {
        let rawByte = rawData[1 + x];
        let f3Up = lastLine ? lastLine[x] : 0;
        let f3Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
        let f3Add = Math.floor((f3Left + f3Up) / 2);
        unfilteredLine[x] = rawByte + f3Add;
      }
    };
    Filter.prototype._unFilterType4 = function(rawData, unfilteredLine, byteWidth) {
      let xComparison = this._xComparison;
      let xBiggerThan = xComparison - 1;
      let lastLine = this._lastLine;
      for (let x = 0; x < byteWidth; x++) {
        let rawByte = rawData[1 + x];
        let f4Up = lastLine ? lastLine[x] : 0;
        let f4Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
        let f4UpLeft = x > xBiggerThan && lastLine ? lastLine[x - xComparison] : 0;
        let f4Add = paethPredictor(f4Left, f4Up, f4UpLeft);
        unfilteredLine[x] = rawByte + f4Add;
      }
    };
    Filter.prototype._reverseFilterLine = function(rawData) {
      let filter = rawData[0];
      let unfilteredLine;
      let currentImage = this._images[this._imageIndex];
      let byteWidth = currentImage.byteWidth;
      if (filter === 0) {
        unfilteredLine = rawData.slice(1, byteWidth + 1);
      } else {
        unfilteredLine = Buffer.alloc(byteWidth);
        switch (filter) {
          case 1:
            this._unFilterType1(rawData, unfilteredLine, byteWidth);
            break;
          case 2:
            this._unFilterType2(rawData, unfilteredLine, byteWidth);
            break;
          case 3:
            this._unFilterType3(rawData, unfilteredLine, byteWidth);
            break;
          case 4:
            this._unFilterType4(rawData, unfilteredLine, byteWidth);
            break;
          default:
            throw new Error("Unrecognised filter type - " + filter);
        }
      }
      this.write(unfilteredLine);
      currentImage.lineIndex++;
      if (currentImage.lineIndex >= currentImage.height) {
        this._lastLine = null;
        this._imageIndex++;
        currentImage = this._images[this._imageIndex];
      } else {
        this._lastLine = unfilteredLine;
      }
      if (currentImage) {
        this.read(currentImage.byteWidth + 1, this._reverseFilterLine.bind(this));
      } else {
        this._lastLine = null;
        this.complete();
      }
    };
  }
});

// ../../node_modules/pngjs/lib/filter-parse-async.js
var require_filter_parse_async = __commonJS({
  "../../node_modules/pngjs/lib/filter-parse-async.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var ChunkStream = require_chunkstream();
    var Filter = require_filter_parse();
    var FilterAsync = module.exports = function(bitmapInfo) {
      ChunkStream.call(this);
      let buffers = [];
      let that = this;
      this._filter = new Filter(bitmapInfo, {
        read: this.read.bind(this),
        write: function(buffer) {
          buffers.push(buffer);
        },
        complete: function() {
          that.emit("complete", Buffer.concat(buffers));
        }
      });
      this._filter.start();
    };
    util.inherits(FilterAsync, ChunkStream);
  }
});

// ../../node_modules/pngjs/lib/constants.js
var require_constants = __commonJS({
  "../../node_modules/pngjs/lib/constants.js"(exports, module) {
    "use strict";
    module.exports = {
      PNG_SIGNATURE: [137, 80, 78, 71, 13, 10, 26, 10],
      TYPE_IHDR: 1229472850,
      TYPE_IEND: 1229278788,
      TYPE_IDAT: 1229209940,
      TYPE_PLTE: 1347179589,
      TYPE_tRNS: 1951551059,
      // eslint-disable-line camelcase
      TYPE_gAMA: 1732332865,
      // eslint-disable-line camelcase
      // color-type bits
      COLORTYPE_GRAYSCALE: 0,
      COLORTYPE_PALETTE: 1,
      COLORTYPE_COLOR: 2,
      COLORTYPE_ALPHA: 4,
      // e.g. grayscale and alpha
      // color-type combinations
      COLORTYPE_PALETTE_COLOR: 3,
      COLORTYPE_COLOR_ALPHA: 6,
      COLORTYPE_TO_BPP_MAP: {
        0: 1,
        2: 3,
        3: 1,
        4: 2,
        6: 4
      },
      GAMMA_DIVISION: 1e5
    };
  }
});

// ../../node_modules/pngjs/lib/crc.js
var require_crc = __commonJS({
  "../../node_modules/pngjs/lib/crc.js"(exports, module) {
    "use strict";
    var crcTable = [];
    (function() {
      for (let i = 0; i < 256; i++) {
        let currentCrc = i;
        for (let j = 0; j < 8; j++) {
          if (currentCrc & 1) {
            currentCrc = 3988292384 ^ currentCrc >>> 1;
          } else {
            currentCrc = currentCrc >>> 1;
          }
        }
        crcTable[i] = currentCrc;
      }
    })();
    var CrcCalculator = module.exports = function() {
      this._crc = -1;
    };
    CrcCalculator.prototype.write = function(data) {
      for (let i = 0; i < data.length; i++) {
        this._crc = crcTable[(this._crc ^ data[i]) & 255] ^ this._crc >>> 8;
      }
      return true;
    };
    CrcCalculator.prototype.crc32 = function() {
      return this._crc ^ -1;
    };
    CrcCalculator.crc32 = function(buf) {
      let crc = -1;
      for (let i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 255] ^ crc >>> 8;
      }
      return crc ^ -1;
    };
  }
});

// ../../node_modules/pngjs/lib/parser.js
var require_parser = __commonJS({
  "../../node_modules/pngjs/lib/parser.js"(exports, module) {
    "use strict";
    var constants = require_constants();
    var CrcCalculator = require_crc();
    var Parser = module.exports = function(options, dependencies) {
      this._options = options;
      options.checkCRC = options.checkCRC !== false;
      this._hasIHDR = false;
      this._hasIEND = false;
      this._emittedHeadersFinished = false;
      this._palette = [];
      this._colorType = 0;
      this._chunks = {};
      this._chunks[constants.TYPE_IHDR] = this._handleIHDR.bind(this);
      this._chunks[constants.TYPE_IEND] = this._handleIEND.bind(this);
      this._chunks[constants.TYPE_IDAT] = this._handleIDAT.bind(this);
      this._chunks[constants.TYPE_PLTE] = this._handlePLTE.bind(this);
      this._chunks[constants.TYPE_tRNS] = this._handleTRNS.bind(this);
      this._chunks[constants.TYPE_gAMA] = this._handleGAMA.bind(this);
      this.read = dependencies.read;
      this.error = dependencies.error;
      this.metadata = dependencies.metadata;
      this.gamma = dependencies.gamma;
      this.transColor = dependencies.transColor;
      this.palette = dependencies.palette;
      this.parsed = dependencies.parsed;
      this.inflateData = dependencies.inflateData;
      this.finished = dependencies.finished;
      this.simpleTransparency = dependencies.simpleTransparency;
      this.headersFinished = dependencies.headersFinished || function() {
      };
    };
    Parser.prototype.start = function() {
      this.read(constants.PNG_SIGNATURE.length, this._parseSignature.bind(this));
    };
    Parser.prototype._parseSignature = function(data) {
      let signature = constants.PNG_SIGNATURE;
      for (let i = 0; i < signature.length; i++) {
        if (data[i] !== signature[i]) {
          this.error(new Error("Invalid file signature"));
          return;
        }
      }
      this.read(8, this._parseChunkBegin.bind(this));
    };
    Parser.prototype._parseChunkBegin = function(data) {
      let length = data.readUInt32BE(0);
      let type = data.readUInt32BE(4);
      let name2 = "";
      for (let i = 4; i < 8; i++) {
        name2 += String.fromCharCode(data[i]);
      }
      let ancillary = Boolean(data[4] & 32);
      if (!this._hasIHDR && type !== constants.TYPE_IHDR) {
        this.error(new Error("Expected IHDR on beggining"));
        return;
      }
      this._crc = new CrcCalculator();
      this._crc.write(Buffer.from(name2));
      if (this._chunks[type]) {
        return this._chunks[type](length);
      }
      if (!ancillary) {
        this.error(new Error("Unsupported critical chunk type " + name2));
        return;
      }
      this.read(length + 4, this._skipChunk.bind(this));
    };
    Parser.prototype._skipChunk = function() {
      this.read(8, this._parseChunkBegin.bind(this));
    };
    Parser.prototype._handleChunkEnd = function() {
      this.read(4, this._parseChunkEnd.bind(this));
    };
    Parser.prototype._parseChunkEnd = function(data) {
      let fileCrc = data.readInt32BE(0);
      let calcCrc = this._crc.crc32();
      if (this._options.checkCRC && calcCrc !== fileCrc) {
        this.error(new Error("Crc error - " + fileCrc + " - " + calcCrc));
        return;
      }
      if (!this._hasIEND) {
        this.read(8, this._parseChunkBegin.bind(this));
      }
    };
    Parser.prototype._handleIHDR = function(length) {
      this.read(length, this._parseIHDR.bind(this));
    };
    Parser.prototype._parseIHDR = function(data) {
      this._crc.write(data);
      let width = data.readUInt32BE(0);
      let height = data.readUInt32BE(4);
      let depth = data[8];
      let colorType = data[9];
      let compr = data[10];
      let filter = data[11];
      let interlace = data[12];
      if (depth !== 8 && depth !== 4 && depth !== 2 && depth !== 1 && depth !== 16) {
        this.error(new Error("Unsupported bit depth " + depth));
        return;
      }
      if (!(colorType in constants.COLORTYPE_TO_BPP_MAP)) {
        this.error(new Error("Unsupported color type"));
        return;
      }
      if (compr !== 0) {
        this.error(new Error("Unsupported compression method"));
        return;
      }
      if (filter !== 0) {
        this.error(new Error("Unsupported filter method"));
        return;
      }
      if (interlace !== 0 && interlace !== 1) {
        this.error(new Error("Unsupported interlace method"));
        return;
      }
      this._colorType = colorType;
      let bpp = constants.COLORTYPE_TO_BPP_MAP[this._colorType];
      this._hasIHDR = true;
      this.metadata({
        width,
        height,
        depth,
        interlace: Boolean(interlace),
        palette: Boolean(colorType & constants.COLORTYPE_PALETTE),
        color: Boolean(colorType & constants.COLORTYPE_COLOR),
        alpha: Boolean(colorType & constants.COLORTYPE_ALPHA),
        bpp,
        colorType
      });
      this._handleChunkEnd();
    };
    Parser.prototype._handlePLTE = function(length) {
      this.read(length, this._parsePLTE.bind(this));
    };
    Parser.prototype._parsePLTE = function(data) {
      this._crc.write(data);
      let entries = Math.floor(data.length / 3);
      for (let i = 0; i < entries; i++) {
        this._palette.push([data[i * 3], data[i * 3 + 1], data[i * 3 + 2], 255]);
      }
      this.palette(this._palette);
      this._handleChunkEnd();
    };
    Parser.prototype._handleTRNS = function(length) {
      this.simpleTransparency();
      this.read(length, this._parseTRNS.bind(this));
    };
    Parser.prototype._parseTRNS = function(data) {
      this._crc.write(data);
      if (this._colorType === constants.COLORTYPE_PALETTE_COLOR) {
        if (this._palette.length === 0) {
          this.error(new Error("Transparency chunk must be after palette"));
          return;
        }
        if (data.length > this._palette.length) {
          this.error(new Error("More transparent colors than palette size"));
          return;
        }
        for (let i = 0; i < data.length; i++) {
          this._palette[i][3] = data[i];
        }
        this.palette(this._palette);
      }
      if (this._colorType === constants.COLORTYPE_GRAYSCALE) {
        this.transColor([data.readUInt16BE(0)]);
      }
      if (this._colorType === constants.COLORTYPE_COLOR) {
        this.transColor([
          data.readUInt16BE(0),
          data.readUInt16BE(2),
          data.readUInt16BE(4)
        ]);
      }
      this._handleChunkEnd();
    };
    Parser.prototype._handleGAMA = function(length) {
      this.read(length, this._parseGAMA.bind(this));
    };
    Parser.prototype._parseGAMA = function(data) {
      this._crc.write(data);
      this.gamma(data.readUInt32BE(0) / constants.GAMMA_DIVISION);
      this._handleChunkEnd();
    };
    Parser.prototype._handleIDAT = function(length) {
      if (!this._emittedHeadersFinished) {
        this._emittedHeadersFinished = true;
        this.headersFinished();
      }
      this.read(-length, this._parseIDAT.bind(this, length));
    };
    Parser.prototype._parseIDAT = function(length, data) {
      this._crc.write(data);
      if (this._colorType === constants.COLORTYPE_PALETTE_COLOR && this._palette.length === 0) {
        throw new Error("Expected palette not found");
      }
      this.inflateData(data);
      let leftOverLength = length - data.length;
      if (leftOverLength > 0) {
        this._handleIDAT(leftOverLength);
      } else {
        this._handleChunkEnd();
      }
    };
    Parser.prototype._handleIEND = function(length) {
      this.read(length, this._parseIEND.bind(this));
    };
    Parser.prototype._parseIEND = function(data) {
      this._crc.write(data);
      this._hasIEND = true;
      this._handleChunkEnd();
      if (this.finished) {
        this.finished();
      }
    };
  }
});

// ../../node_modules/pngjs/lib/bitmapper.js
var require_bitmapper = __commonJS({
  "../../node_modules/pngjs/lib/bitmapper.js"(exports) {
    "use strict";
    var interlaceUtils = require_interlace();
    var pixelBppMapper = [
      // 0 - dummy entry
      function() {
      },
      // 1 - L
      // 0: 0, 1: 0, 2: 0, 3: 0xff
      function(pxData, data, pxPos, rawPos) {
        if (rawPos === data.length) {
          throw new Error("Ran out of data");
        }
        let pixel = data[rawPos];
        pxData[pxPos] = pixel;
        pxData[pxPos + 1] = pixel;
        pxData[pxPos + 2] = pixel;
        pxData[pxPos + 3] = 255;
      },
      // 2 - LA
      // 0: 0, 1: 0, 2: 0, 3: 1
      function(pxData, data, pxPos, rawPos) {
        if (rawPos + 1 >= data.length) {
          throw new Error("Ran out of data");
        }
        let pixel = data[rawPos];
        pxData[pxPos] = pixel;
        pxData[pxPos + 1] = pixel;
        pxData[pxPos + 2] = pixel;
        pxData[pxPos + 3] = data[rawPos + 1];
      },
      // 3 - RGB
      // 0: 0, 1: 1, 2: 2, 3: 0xff
      function(pxData, data, pxPos, rawPos) {
        if (rawPos + 2 >= data.length) {
          throw new Error("Ran out of data");
        }
        pxData[pxPos] = data[rawPos];
        pxData[pxPos + 1] = data[rawPos + 1];
        pxData[pxPos + 2] = data[rawPos + 2];
        pxData[pxPos + 3] = 255;
      },
      // 4 - RGBA
      // 0: 0, 1: 1, 2: 2, 3: 3
      function(pxData, data, pxPos, rawPos) {
        if (rawPos + 3 >= data.length) {
          throw new Error("Ran out of data");
        }
        pxData[pxPos] = data[rawPos];
        pxData[pxPos + 1] = data[rawPos + 1];
        pxData[pxPos + 2] = data[rawPos + 2];
        pxData[pxPos + 3] = data[rawPos + 3];
      }
    ];
    var pixelBppCustomMapper = [
      // 0 - dummy entry
      function() {
      },
      // 1 - L
      // 0: 0, 1: 0, 2: 0, 3: 0xff
      function(pxData, pixelData, pxPos, maxBit) {
        let pixel = pixelData[0];
        pxData[pxPos] = pixel;
        pxData[pxPos + 1] = pixel;
        pxData[pxPos + 2] = pixel;
        pxData[pxPos + 3] = maxBit;
      },
      // 2 - LA
      // 0: 0, 1: 0, 2: 0, 3: 1
      function(pxData, pixelData, pxPos) {
        let pixel = pixelData[0];
        pxData[pxPos] = pixel;
        pxData[pxPos + 1] = pixel;
        pxData[pxPos + 2] = pixel;
        pxData[pxPos + 3] = pixelData[1];
      },
      // 3 - RGB
      // 0: 0, 1: 1, 2: 2, 3: 0xff
      function(pxData, pixelData, pxPos, maxBit) {
        pxData[pxPos] = pixelData[0];
        pxData[pxPos + 1] = pixelData[1];
        pxData[pxPos + 2] = pixelData[2];
        pxData[pxPos + 3] = maxBit;
      },
      // 4 - RGBA
      // 0: 0, 1: 1, 2: 2, 3: 3
      function(pxData, pixelData, pxPos) {
        pxData[pxPos] = pixelData[0];
        pxData[pxPos + 1] = pixelData[1];
        pxData[pxPos + 2] = pixelData[2];
        pxData[pxPos + 3] = pixelData[3];
      }
    ];
    function bitRetriever(data, depth) {
      let leftOver = [];
      let i = 0;
      function split() {
        if (i === data.length) {
          throw new Error("Ran out of data");
        }
        let byte = data[i];
        i++;
        let byte8, byte7, byte6, byte5, byte4, byte3, byte2, byte1;
        switch (depth) {
          default:
            throw new Error("unrecognised depth");
          case 16:
            byte2 = data[i];
            i++;
            leftOver.push((byte << 8) + byte2);
            break;
          case 4:
            byte2 = byte & 15;
            byte1 = byte >> 4;
            leftOver.push(byte1, byte2);
            break;
          case 2:
            byte4 = byte & 3;
            byte3 = byte >> 2 & 3;
            byte2 = byte >> 4 & 3;
            byte1 = byte >> 6 & 3;
            leftOver.push(byte1, byte2, byte3, byte4);
            break;
          case 1:
            byte8 = byte & 1;
            byte7 = byte >> 1 & 1;
            byte6 = byte >> 2 & 1;
            byte5 = byte >> 3 & 1;
            byte4 = byte >> 4 & 1;
            byte3 = byte >> 5 & 1;
            byte2 = byte >> 6 & 1;
            byte1 = byte >> 7 & 1;
            leftOver.push(byte1, byte2, byte3, byte4, byte5, byte6, byte7, byte8);
            break;
        }
      }
      return {
        get: function(count) {
          while (leftOver.length < count) {
            split();
          }
          let returner = leftOver.slice(0, count);
          leftOver = leftOver.slice(count);
          return returner;
        },
        resetAfterLine: function() {
          leftOver.length = 0;
        },
        end: function() {
          if (i !== data.length) {
            throw new Error("extra data found");
          }
        }
      };
    }
    function mapImage8Bit(image, pxData, getPxPos, bpp, data, rawPos) {
      let imageWidth = image.width;
      let imageHeight = image.height;
      let imagePass = image.index;
      for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
          let pxPos = getPxPos(x, y, imagePass);
          pixelBppMapper[bpp](pxData, data, pxPos, rawPos);
          rawPos += bpp;
        }
      }
      return rawPos;
    }
    function mapImageCustomBit(image, pxData, getPxPos, bpp, bits, maxBit) {
      let imageWidth = image.width;
      let imageHeight = image.height;
      let imagePass = image.index;
      for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
          let pixelData = bits.get(bpp);
          let pxPos = getPxPos(x, y, imagePass);
          pixelBppCustomMapper[bpp](pxData, pixelData, pxPos, maxBit);
        }
        bits.resetAfterLine();
      }
    }
    exports.dataToBitMap = function(data, bitmapInfo) {
      let width = bitmapInfo.width;
      let height = bitmapInfo.height;
      let depth = bitmapInfo.depth;
      let bpp = bitmapInfo.bpp;
      let interlace = bitmapInfo.interlace;
      let bits;
      if (depth !== 8) {
        bits = bitRetriever(data, depth);
      }
      let pxData;
      if (depth <= 8) {
        pxData = Buffer.alloc(width * height * 4);
      } else {
        pxData = new Uint16Array(width * height * 4);
      }
      let maxBit = Math.pow(2, depth) - 1;
      let rawPos = 0;
      let images;
      let getPxPos;
      if (interlace) {
        images = interlaceUtils.getImagePasses(width, height);
        getPxPos = interlaceUtils.getInterlaceIterator(width, height);
      } else {
        let nonInterlacedPxPos = 0;
        getPxPos = function() {
          let returner = nonInterlacedPxPos;
          nonInterlacedPxPos += 4;
          return returner;
        };
        images = [{ width, height }];
      }
      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        if (depth === 8) {
          rawPos = mapImage8Bit(
            images[imageIndex],
            pxData,
            getPxPos,
            bpp,
            data,
            rawPos
          );
        } else {
          mapImageCustomBit(
            images[imageIndex],
            pxData,
            getPxPos,
            bpp,
            bits,
            maxBit
          );
        }
      }
      if (depth === 8) {
        if (rawPos !== data.length) {
          throw new Error("extra data found");
        }
      } else {
        bits.end();
      }
      return pxData;
    };
  }
});

// ../../node_modules/pngjs/lib/format-normaliser.js
var require_format_normaliser = __commonJS({
  "../../node_modules/pngjs/lib/format-normaliser.js"(exports, module) {
    "use strict";
    function dePalette(indata, outdata, width, height, palette) {
      let pxPos = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let color = palette[indata[pxPos]];
          if (!color) {
            throw new Error("index " + indata[pxPos] + " not in palette");
          }
          for (let i = 0; i < 4; i++) {
            outdata[pxPos + i] = color[i];
          }
          pxPos += 4;
        }
      }
    }
    function replaceTransparentColor(indata, outdata, width, height, transColor) {
      let pxPos = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let makeTrans = false;
          if (transColor.length === 1) {
            if (transColor[0] === indata[pxPos]) {
              makeTrans = true;
            }
          } else if (transColor[0] === indata[pxPos] && transColor[1] === indata[pxPos + 1] && transColor[2] === indata[pxPos + 2]) {
            makeTrans = true;
          }
          if (makeTrans) {
            for (let i = 0; i < 4; i++) {
              outdata[pxPos + i] = 0;
            }
          }
          pxPos += 4;
        }
      }
    }
    function scaleDepth(indata, outdata, width, height, depth) {
      let maxOutSample = 255;
      let maxInSample = Math.pow(2, depth) - 1;
      let pxPos = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          for (let i = 0; i < 4; i++) {
            outdata[pxPos + i] = Math.floor(
              indata[pxPos + i] * maxOutSample / maxInSample + 0.5
            );
          }
          pxPos += 4;
        }
      }
    }
    module.exports = function(indata, imageData) {
      let depth = imageData.depth;
      let width = imageData.width;
      let height = imageData.height;
      let colorType = imageData.colorType;
      let transColor = imageData.transColor;
      let palette = imageData.palette;
      let outdata = indata;
      if (colorType === 3) {
        dePalette(indata, outdata, width, height, palette);
      } else {
        if (transColor) {
          replaceTransparentColor(indata, outdata, width, height, transColor);
        }
        if (depth !== 8) {
          if (depth === 16) {
            outdata = Buffer.alloc(width * height * 4);
          }
          scaleDepth(indata, outdata, width, height, depth);
        }
      }
      return outdata;
    };
  }
});

// ../../node_modules/pngjs/lib/parser-async.js
var require_parser_async = __commonJS({
  "../../node_modules/pngjs/lib/parser-async.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var zlib = __require("zlib");
    var ChunkStream = require_chunkstream();
    var FilterAsync = require_filter_parse_async();
    var Parser = require_parser();
    var bitmapper = require_bitmapper();
    var formatNormaliser = require_format_normaliser();
    var ParserAsync = module.exports = function(options) {
      ChunkStream.call(this);
      this._parser = new Parser(options, {
        read: this.read.bind(this),
        error: this._handleError.bind(this),
        metadata: this._handleMetaData.bind(this),
        gamma: this.emit.bind(this, "gamma"),
        palette: this._handlePalette.bind(this),
        transColor: this._handleTransColor.bind(this),
        finished: this._finished.bind(this),
        inflateData: this._inflateData.bind(this),
        simpleTransparency: this._simpleTransparency.bind(this),
        headersFinished: this._headersFinished.bind(this)
      });
      this._options = options;
      this.writable = true;
      this._parser.start();
    };
    util.inherits(ParserAsync, ChunkStream);
    ParserAsync.prototype._handleError = function(err) {
      this.emit("error", err);
      this.writable = false;
      this.destroy();
      if (this._inflate && this._inflate.destroy) {
        this._inflate.destroy();
      }
      if (this._filter) {
        this._filter.destroy();
        this._filter.on("error", function() {
        });
      }
      this.errord = true;
    };
    ParserAsync.prototype._inflateData = function(data) {
      if (!this._inflate) {
        if (this._bitmapInfo.interlace) {
          this._inflate = zlib.createInflate();
          this._inflate.on("error", this.emit.bind(this, "error"));
          this._filter.on("complete", this._complete.bind(this));
          this._inflate.pipe(this._filter);
        } else {
          let rowSize = (this._bitmapInfo.width * this._bitmapInfo.bpp * this._bitmapInfo.depth + 7 >> 3) + 1;
          let imageSize = rowSize * this._bitmapInfo.height;
          let chunkSize = Math.max(imageSize, zlib.Z_MIN_CHUNK);
          this._inflate = zlib.createInflate({ chunkSize });
          let leftToInflate = imageSize;
          let emitError = this.emit.bind(this, "error");
          this._inflate.on("error", function(err) {
            if (!leftToInflate) {
              return;
            }
            emitError(err);
          });
          this._filter.on("complete", this._complete.bind(this));
          let filterWrite = this._filter.write.bind(this._filter);
          this._inflate.on("data", function(chunk) {
            if (!leftToInflate) {
              return;
            }
            if (chunk.length > leftToInflate) {
              chunk = chunk.slice(0, leftToInflate);
            }
            leftToInflate -= chunk.length;
            filterWrite(chunk);
          });
          this._inflate.on("end", this._filter.end.bind(this._filter));
        }
      }
      this._inflate.write(data);
    };
    ParserAsync.prototype._handleMetaData = function(metaData) {
      this._metaData = metaData;
      this._bitmapInfo = Object.create(metaData);
      this._filter = new FilterAsync(this._bitmapInfo);
    };
    ParserAsync.prototype._handleTransColor = function(transColor) {
      this._bitmapInfo.transColor = transColor;
    };
    ParserAsync.prototype._handlePalette = function(palette) {
      this._bitmapInfo.palette = palette;
    };
    ParserAsync.prototype._simpleTransparency = function() {
      this._metaData.alpha = true;
    };
    ParserAsync.prototype._headersFinished = function() {
      this.emit("metadata", this._metaData);
    };
    ParserAsync.prototype._finished = function() {
      if (this.errord) {
        return;
      }
      if (!this._inflate) {
        this.emit("error", "No Inflate block");
      } else {
        this._inflate.end();
      }
    };
    ParserAsync.prototype._complete = function(filteredData) {
      if (this.errord) {
        return;
      }
      let normalisedBitmapData;
      try {
        let bitmapData = bitmapper.dataToBitMap(filteredData, this._bitmapInfo);
        normalisedBitmapData = formatNormaliser(bitmapData, this._bitmapInfo);
        bitmapData = null;
      } catch (ex) {
        this._handleError(ex);
        return;
      }
      this.emit("parsed", normalisedBitmapData);
    };
  }
});

// ../../node_modules/pngjs/lib/bitpacker.js
var require_bitpacker = __commonJS({
  "../../node_modules/pngjs/lib/bitpacker.js"(exports, module) {
    "use strict";
    var constants = require_constants();
    module.exports = function(dataIn, width, height, options) {
      let outHasAlpha = [constants.COLORTYPE_COLOR_ALPHA, constants.COLORTYPE_ALPHA].indexOf(
        options.colorType
      ) !== -1;
      if (options.colorType === options.inputColorType) {
        let bigEndian = (function() {
          let buffer = new ArrayBuffer(2);
          new DataView(buffer).setInt16(
            0,
            256,
            true
            /* littleEndian */
          );
          return new Int16Array(buffer)[0] !== 256;
        })();
        if (options.bitDepth === 8 || options.bitDepth === 16 && bigEndian) {
          return dataIn;
        }
      }
      let data = options.bitDepth !== 16 ? dataIn : new Uint16Array(dataIn.buffer);
      let maxValue = 255;
      let inBpp = constants.COLORTYPE_TO_BPP_MAP[options.inputColorType];
      if (inBpp === 4 && !options.inputHasAlpha) {
        inBpp = 3;
      }
      let outBpp = constants.COLORTYPE_TO_BPP_MAP[options.colorType];
      if (options.bitDepth === 16) {
        maxValue = 65535;
        outBpp *= 2;
      }
      let outData = Buffer.alloc(width * height * outBpp);
      let inIndex = 0;
      let outIndex = 0;
      let bgColor = options.bgColor || {};
      if (bgColor.red === void 0) {
        bgColor.red = maxValue;
      }
      if (bgColor.green === void 0) {
        bgColor.green = maxValue;
      }
      if (bgColor.blue === void 0) {
        bgColor.blue = maxValue;
      }
      function getRGBA() {
        let red;
        let green;
        let blue;
        let alpha = maxValue;
        switch (options.inputColorType) {
          case constants.COLORTYPE_COLOR_ALPHA:
            alpha = data[inIndex + 3];
            red = data[inIndex];
            green = data[inIndex + 1];
            blue = data[inIndex + 2];
            break;
          case constants.COLORTYPE_COLOR:
            red = data[inIndex];
            green = data[inIndex + 1];
            blue = data[inIndex + 2];
            break;
          case constants.COLORTYPE_ALPHA:
            alpha = data[inIndex + 1];
            red = data[inIndex];
            green = red;
            blue = red;
            break;
          case constants.COLORTYPE_GRAYSCALE:
            red = data[inIndex];
            green = red;
            blue = red;
            break;
          default:
            throw new Error(
              "input color type:" + options.inputColorType + " is not supported at present"
            );
        }
        if (options.inputHasAlpha) {
          if (!outHasAlpha) {
            alpha /= maxValue;
            red = Math.min(
              Math.max(Math.round((1 - alpha) * bgColor.red + alpha * red), 0),
              maxValue
            );
            green = Math.min(
              Math.max(Math.round((1 - alpha) * bgColor.green + alpha * green), 0),
              maxValue
            );
            blue = Math.min(
              Math.max(Math.round((1 - alpha) * bgColor.blue + alpha * blue), 0),
              maxValue
            );
          }
        }
        return { red, green, blue, alpha };
      }
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let rgba = getRGBA(data, inIndex);
          switch (options.colorType) {
            case constants.COLORTYPE_COLOR_ALPHA:
            case constants.COLORTYPE_COLOR:
              if (options.bitDepth === 8) {
                outData[outIndex] = rgba.red;
                outData[outIndex + 1] = rgba.green;
                outData[outIndex + 2] = rgba.blue;
                if (outHasAlpha) {
                  outData[outIndex + 3] = rgba.alpha;
                }
              } else {
                outData.writeUInt16BE(rgba.red, outIndex);
                outData.writeUInt16BE(rgba.green, outIndex + 2);
                outData.writeUInt16BE(rgba.blue, outIndex + 4);
                if (outHasAlpha) {
                  outData.writeUInt16BE(rgba.alpha, outIndex + 6);
                }
              }
              break;
            case constants.COLORTYPE_ALPHA:
            case constants.COLORTYPE_GRAYSCALE: {
              let grayscale = (rgba.red + rgba.green + rgba.blue) / 3;
              if (options.bitDepth === 8) {
                outData[outIndex] = grayscale;
                if (outHasAlpha) {
                  outData[outIndex + 1] = rgba.alpha;
                }
              } else {
                outData.writeUInt16BE(grayscale, outIndex);
                if (outHasAlpha) {
                  outData.writeUInt16BE(rgba.alpha, outIndex + 2);
                }
              }
              break;
            }
            default:
              throw new Error("unrecognised color Type " + options.colorType);
          }
          inIndex += inBpp;
          outIndex += outBpp;
        }
      }
      return outData;
    };
  }
});

// ../../node_modules/pngjs/lib/filter-pack.js
var require_filter_pack = __commonJS({
  "../../node_modules/pngjs/lib/filter-pack.js"(exports, module) {
    "use strict";
    var paethPredictor = require_paeth_predictor();
    function filterNone(pxData, pxPos, byteWidth, rawData, rawPos) {
      for (let x = 0; x < byteWidth; x++) {
        rawData[rawPos + x] = pxData[pxPos + x];
      }
    }
    function filterSumNone(pxData, pxPos, byteWidth) {
      let sum = 0;
      let length = pxPos + byteWidth;
      for (let i = pxPos; i < length; i++) {
        sum += Math.abs(pxData[i]);
      }
      return sum;
    }
    function filterSub(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let val = pxData[pxPos + x] - left;
        rawData[rawPos + x] = val;
      }
    }
    function filterSumSub(pxData, pxPos, byteWidth, bpp) {
      let sum = 0;
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let val = pxData[pxPos + x] - left;
        sum += Math.abs(val);
      }
      return sum;
    }
    function filterUp(pxData, pxPos, byteWidth, rawData, rawPos) {
      for (let x = 0; x < byteWidth; x++) {
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let val = pxData[pxPos + x] - up;
        rawData[rawPos + x] = val;
      }
    }
    function filterSumUp(pxData, pxPos, byteWidth) {
      let sum = 0;
      let length = pxPos + byteWidth;
      for (let x = pxPos; x < length; x++) {
        let up = pxPos > 0 ? pxData[x - byteWidth] : 0;
        let val = pxData[x] - up;
        sum += Math.abs(val);
      }
      return sum;
    }
    function filterAvg(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let val = pxData[pxPos + x] - (left + up >> 1);
        rawData[rawPos + x] = val;
      }
    }
    function filterSumAvg(pxData, pxPos, byteWidth, bpp) {
      let sum = 0;
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let val = pxData[pxPos + x] - (left + up >> 1);
        sum += Math.abs(val);
      }
      return sum;
    }
    function filterPaeth(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let upleft = pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0;
        let val = pxData[pxPos + x] - paethPredictor(left, up, upleft);
        rawData[rawPos + x] = val;
      }
    }
    function filterSumPaeth(pxData, pxPos, byteWidth, bpp) {
      let sum = 0;
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let upleft = pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0;
        let val = pxData[pxPos + x] - paethPredictor(left, up, upleft);
        sum += Math.abs(val);
      }
      return sum;
    }
    var filters = {
      0: filterNone,
      1: filterSub,
      2: filterUp,
      3: filterAvg,
      4: filterPaeth
    };
    var filterSums = {
      0: filterSumNone,
      1: filterSumSub,
      2: filterSumUp,
      3: filterSumAvg,
      4: filterSumPaeth
    };
    module.exports = function(pxData, width, height, options, bpp) {
      let filterTypes;
      if (!("filterType" in options) || options.filterType === -1) {
        filterTypes = [0, 1, 2, 3, 4];
      } else if (typeof options.filterType === "number") {
        filterTypes = [options.filterType];
      } else {
        throw new Error("unrecognised filter types");
      }
      if (options.bitDepth === 16) {
        bpp *= 2;
      }
      let byteWidth = width * bpp;
      let rawPos = 0;
      let pxPos = 0;
      let rawData = Buffer.alloc((byteWidth + 1) * height);
      let sel = filterTypes[0];
      for (let y = 0; y < height; y++) {
        if (filterTypes.length > 1) {
          let min = Infinity;
          for (let i = 0; i < filterTypes.length; i++) {
            let sum = filterSums[filterTypes[i]](pxData, pxPos, byteWidth, bpp);
            if (sum < min) {
              sel = filterTypes[i];
              min = sum;
            }
          }
        }
        rawData[rawPos] = sel;
        rawPos++;
        filters[sel](pxData, pxPos, byteWidth, rawData, rawPos, bpp);
        rawPos += byteWidth;
        pxPos += byteWidth;
      }
      return rawData;
    };
  }
});

// ../../node_modules/pngjs/lib/packer.js
var require_packer = __commonJS({
  "../../node_modules/pngjs/lib/packer.js"(exports, module) {
    "use strict";
    var constants = require_constants();
    var CrcStream = require_crc();
    var bitPacker = require_bitpacker();
    var filter = require_filter_pack();
    var zlib = __require("zlib");
    var Packer = module.exports = function(options) {
      this._options = options;
      options.deflateChunkSize = options.deflateChunkSize || 32 * 1024;
      options.deflateLevel = options.deflateLevel != null ? options.deflateLevel : 9;
      options.deflateStrategy = options.deflateStrategy != null ? options.deflateStrategy : 3;
      options.inputHasAlpha = options.inputHasAlpha != null ? options.inputHasAlpha : true;
      options.deflateFactory = options.deflateFactory || zlib.createDeflate;
      options.bitDepth = options.bitDepth || 8;
      options.colorType = typeof options.colorType === "number" ? options.colorType : constants.COLORTYPE_COLOR_ALPHA;
      options.inputColorType = typeof options.inputColorType === "number" ? options.inputColorType : constants.COLORTYPE_COLOR_ALPHA;
      if ([
        constants.COLORTYPE_GRAYSCALE,
        constants.COLORTYPE_COLOR,
        constants.COLORTYPE_COLOR_ALPHA,
        constants.COLORTYPE_ALPHA
      ].indexOf(options.colorType) === -1) {
        throw new Error(
          "option color type:" + options.colorType + " is not supported at present"
        );
      }
      if ([
        constants.COLORTYPE_GRAYSCALE,
        constants.COLORTYPE_COLOR,
        constants.COLORTYPE_COLOR_ALPHA,
        constants.COLORTYPE_ALPHA
      ].indexOf(options.inputColorType) === -1) {
        throw new Error(
          "option input color type:" + options.inputColorType + " is not supported at present"
        );
      }
      if (options.bitDepth !== 8 && options.bitDepth !== 16) {
        throw new Error(
          "option bit depth:" + options.bitDepth + " is not supported at present"
        );
      }
    };
    Packer.prototype.getDeflateOptions = function() {
      return {
        chunkSize: this._options.deflateChunkSize,
        level: this._options.deflateLevel,
        strategy: this._options.deflateStrategy
      };
    };
    Packer.prototype.createDeflate = function() {
      return this._options.deflateFactory(this.getDeflateOptions());
    };
    Packer.prototype.filterData = function(data, width, height) {
      let packedData = bitPacker(data, width, height, this._options);
      let bpp = constants.COLORTYPE_TO_BPP_MAP[this._options.colorType];
      let filteredData = filter(packedData, width, height, this._options, bpp);
      return filteredData;
    };
    Packer.prototype._packChunk = function(type, data) {
      let len = data ? data.length : 0;
      let buf = Buffer.alloc(len + 12);
      buf.writeUInt32BE(len, 0);
      buf.writeUInt32BE(type, 4);
      if (data) {
        data.copy(buf, 8);
      }
      buf.writeInt32BE(
        CrcStream.crc32(buf.slice(4, buf.length - 4)),
        buf.length - 4
      );
      return buf;
    };
    Packer.prototype.packGAMA = function(gamma) {
      let buf = Buffer.alloc(4);
      buf.writeUInt32BE(Math.floor(gamma * constants.GAMMA_DIVISION), 0);
      return this._packChunk(constants.TYPE_gAMA, buf);
    };
    Packer.prototype.packIHDR = function(width, height) {
      let buf = Buffer.alloc(13);
      buf.writeUInt32BE(width, 0);
      buf.writeUInt32BE(height, 4);
      buf[8] = this._options.bitDepth;
      buf[9] = this._options.colorType;
      buf[10] = 0;
      buf[11] = 0;
      buf[12] = 0;
      return this._packChunk(constants.TYPE_IHDR, buf);
    };
    Packer.prototype.packIDAT = function(data) {
      return this._packChunk(constants.TYPE_IDAT, data);
    };
    Packer.prototype.packIEND = function() {
      return this._packChunk(constants.TYPE_IEND, null);
    };
  }
});

// ../../node_modules/pngjs/lib/packer-async.js
var require_packer_async = __commonJS({
  "../../node_modules/pngjs/lib/packer-async.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var Stream = __require("stream");
    var constants = require_constants();
    var Packer = require_packer();
    var PackerAsync = module.exports = function(opt) {
      Stream.call(this);
      let options = opt || {};
      this._packer = new Packer(options);
      this._deflate = this._packer.createDeflate();
      this.readable = true;
    };
    util.inherits(PackerAsync, Stream);
    PackerAsync.prototype.pack = function(data, width, height, gamma) {
      this.emit("data", Buffer.from(constants.PNG_SIGNATURE));
      this.emit("data", this._packer.packIHDR(width, height));
      if (gamma) {
        this.emit("data", this._packer.packGAMA(gamma));
      }
      let filteredData = this._packer.filterData(data, width, height);
      this._deflate.on("error", this.emit.bind(this, "error"));
      this._deflate.on(
        "data",
        function(compressedData) {
          this.emit("data", this._packer.packIDAT(compressedData));
        }.bind(this)
      );
      this._deflate.on(
        "end",
        function() {
          this.emit("data", this._packer.packIEND());
          this.emit("end");
        }.bind(this)
      );
      this._deflate.end(filteredData);
    };
  }
});

// ../../node_modules/pngjs/lib/sync-inflate.js
var require_sync_inflate = __commonJS({
  "../../node_modules/pngjs/lib/sync-inflate.js"(exports, module) {
    "use strict";
    var assert = __require("assert").ok;
    var zlib = __require("zlib");
    var util = __require("util");
    var kMaxLength = __require("buffer").kMaxLength;
    function Inflate(opts) {
      if (!(this instanceof Inflate)) {
        return new Inflate(opts);
      }
      if (opts && opts.chunkSize < zlib.Z_MIN_CHUNK) {
        opts.chunkSize = zlib.Z_MIN_CHUNK;
      }
      zlib.Inflate.call(this, opts);
      this._offset = this._offset === void 0 ? this._outOffset : this._offset;
      this._buffer = this._buffer || this._outBuffer;
      if (opts && opts.maxLength != null) {
        this._maxLength = opts.maxLength;
      }
    }
    function createInflate(opts) {
      return new Inflate(opts);
    }
    function _close(engine, callback) {
      if (callback) {
        process.nextTick(callback);
      }
      if (!engine._handle) {
        return;
      }
      engine._handle.close();
      engine._handle = null;
    }
    Inflate.prototype._processChunk = function(chunk, flushFlag, asyncCb) {
      if (typeof asyncCb === "function") {
        return zlib.Inflate._processChunk.call(this, chunk, flushFlag, asyncCb);
      }
      let self = this;
      let availInBefore = chunk && chunk.length;
      let availOutBefore = this._chunkSize - this._offset;
      let leftToInflate = this._maxLength;
      let inOff = 0;
      let buffers = [];
      let nread = 0;
      let error;
      this.on("error", function(err) {
        error = err;
      });
      function handleChunk(availInAfter, availOutAfter) {
        if (self._hadError) {
          return;
        }
        let have = availOutBefore - availOutAfter;
        assert(have >= 0, "have should not go down");
        if (have > 0) {
          let out = self._buffer.slice(self._offset, self._offset + have);
          self._offset += have;
          if (out.length > leftToInflate) {
            out = out.slice(0, leftToInflate);
          }
          buffers.push(out);
          nread += out.length;
          leftToInflate -= out.length;
          if (leftToInflate === 0) {
            return false;
          }
        }
        if (availOutAfter === 0 || self._offset >= self._chunkSize) {
          availOutBefore = self._chunkSize;
          self._offset = 0;
          self._buffer = Buffer.allocUnsafe(self._chunkSize);
        }
        if (availOutAfter === 0) {
          inOff += availInBefore - availInAfter;
          availInBefore = availInAfter;
          return true;
        }
        return false;
      }
      assert(this._handle, "zlib binding closed");
      let res;
      do {
        res = this._handle.writeSync(
          flushFlag,
          chunk,
          // in
          inOff,
          // in_off
          availInBefore,
          // in_len
          this._buffer,
          // out
          this._offset,
          //out_off
          availOutBefore
        );
        res = res || this._writeState;
      } while (!this._hadError && handleChunk(res[0], res[1]));
      if (this._hadError) {
        throw error;
      }
      if (nread >= kMaxLength) {
        _close(this);
        throw new RangeError(
          "Cannot create final Buffer. It would be larger than 0x" + kMaxLength.toString(16) + " bytes"
        );
      }
      let buf = Buffer.concat(buffers, nread);
      _close(this);
      return buf;
    };
    util.inherits(Inflate, zlib.Inflate);
    function zlibBufferSync(engine, buffer) {
      if (typeof buffer === "string") {
        buffer = Buffer.from(buffer);
      }
      if (!(buffer instanceof Buffer)) {
        throw new TypeError("Not a string or buffer");
      }
      let flushFlag = engine._finishFlushFlag;
      if (flushFlag == null) {
        flushFlag = zlib.Z_FINISH;
      }
      return engine._processChunk(buffer, flushFlag);
    }
    function inflateSync(buffer, opts) {
      return zlibBufferSync(new Inflate(opts), buffer);
    }
    module.exports = exports = inflateSync;
    exports.Inflate = Inflate;
    exports.createInflate = createInflate;
    exports.inflateSync = inflateSync;
  }
});

// ../../node_modules/pngjs/lib/sync-reader.js
var require_sync_reader = __commonJS({
  "../../node_modules/pngjs/lib/sync-reader.js"(exports, module) {
    "use strict";
    var SyncReader = module.exports = function(buffer) {
      this._buffer = buffer;
      this._reads = [];
    };
    SyncReader.prototype.read = function(length, callback) {
      this._reads.push({
        length: Math.abs(length),
        // if length < 0 then at most this length
        allowLess: length < 0,
        func: callback
      });
    };
    SyncReader.prototype.process = function() {
      while (this._reads.length > 0 && this._buffer.length) {
        let read2 = this._reads[0];
        if (this._buffer.length && (this._buffer.length >= read2.length || read2.allowLess)) {
          this._reads.shift();
          let buf = this._buffer;
          this._buffer = buf.slice(read2.length);
          read2.func.call(this, buf.slice(0, read2.length));
        } else {
          break;
        }
      }
      if (this._reads.length > 0) {
        return new Error("There are some read requests waitng on finished stream");
      }
      if (this._buffer.length > 0) {
        return new Error("unrecognised content at end of stream");
      }
    };
  }
});

// ../../node_modules/pngjs/lib/filter-parse-sync.js
var require_filter_parse_sync = __commonJS({
  "../../node_modules/pngjs/lib/filter-parse-sync.js"(exports) {
    "use strict";
    var SyncReader = require_sync_reader();
    var Filter = require_filter_parse();
    exports.process = function(inBuffer, bitmapInfo) {
      let outBuffers = [];
      let reader = new SyncReader(inBuffer);
      let filter = new Filter(bitmapInfo, {
        read: reader.read.bind(reader),
        write: function(bufferPart) {
          outBuffers.push(bufferPart);
        },
        complete: function() {
        }
      });
      filter.start();
      reader.process();
      return Buffer.concat(outBuffers);
    };
  }
});

// ../../node_modules/pngjs/lib/parser-sync.js
var require_parser_sync = __commonJS({
  "../../node_modules/pngjs/lib/parser-sync.js"(exports, module) {
    "use strict";
    var hasSyncZlib = true;
    var zlib = __require("zlib");
    var inflateSync = require_sync_inflate();
    if (!zlib.deflateSync) {
      hasSyncZlib = false;
    }
    var SyncReader = require_sync_reader();
    var FilterSync = require_filter_parse_sync();
    var Parser = require_parser();
    var bitmapper = require_bitmapper();
    var formatNormaliser = require_format_normaliser();
    module.exports = function(buffer, options) {
      if (!hasSyncZlib) {
        throw new Error(
          "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
        );
      }
      let err;
      function handleError(_err_) {
        err = _err_;
      }
      let metaData;
      function handleMetaData(_metaData_) {
        metaData = _metaData_;
      }
      function handleTransColor(transColor) {
        metaData.transColor = transColor;
      }
      function handlePalette(palette) {
        metaData.palette = palette;
      }
      function handleSimpleTransparency() {
        metaData.alpha = true;
      }
      let gamma;
      function handleGamma(_gamma_) {
        gamma = _gamma_;
      }
      let inflateDataList = [];
      function handleInflateData(inflatedData2) {
        inflateDataList.push(inflatedData2);
      }
      let reader = new SyncReader(buffer);
      let parser = new Parser(options, {
        read: reader.read.bind(reader),
        error: handleError,
        metadata: handleMetaData,
        gamma: handleGamma,
        palette: handlePalette,
        transColor: handleTransColor,
        inflateData: handleInflateData,
        simpleTransparency: handleSimpleTransparency
      });
      parser.start();
      reader.process();
      if (err) {
        throw err;
      }
      let inflateData = Buffer.concat(inflateDataList);
      inflateDataList.length = 0;
      let inflatedData;
      if (metaData.interlace) {
        inflatedData = zlib.inflateSync(inflateData);
      } else {
        let rowSize = (metaData.width * metaData.bpp * metaData.depth + 7 >> 3) + 1;
        let imageSize = rowSize * metaData.height;
        inflatedData = inflateSync(inflateData, {
          chunkSize: imageSize,
          maxLength: imageSize
        });
      }
      inflateData = null;
      if (!inflatedData || !inflatedData.length) {
        throw new Error("bad png - invalid inflate data response");
      }
      let unfilteredData = FilterSync.process(inflatedData, metaData);
      inflateData = null;
      let bitmapData = bitmapper.dataToBitMap(unfilteredData, metaData);
      unfilteredData = null;
      let normalisedBitmapData = formatNormaliser(bitmapData, metaData);
      metaData.data = normalisedBitmapData;
      metaData.gamma = gamma || 0;
      return metaData;
    };
  }
});

// ../../node_modules/pngjs/lib/packer-sync.js
var require_packer_sync = __commonJS({
  "../../node_modules/pngjs/lib/packer-sync.js"(exports, module) {
    "use strict";
    var hasSyncZlib = true;
    var zlib = __require("zlib");
    if (!zlib.deflateSync) {
      hasSyncZlib = false;
    }
    var constants = require_constants();
    var Packer = require_packer();
    module.exports = function(metaData, opt) {
      if (!hasSyncZlib) {
        throw new Error(
          "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
        );
      }
      let options = opt || {};
      let packer = new Packer(options);
      let chunks = [];
      chunks.push(Buffer.from(constants.PNG_SIGNATURE));
      chunks.push(packer.packIHDR(metaData.width, metaData.height));
      if (metaData.gamma) {
        chunks.push(packer.packGAMA(metaData.gamma));
      }
      let filteredData = packer.filterData(
        metaData.data,
        metaData.width,
        metaData.height
      );
      let compressedData = zlib.deflateSync(
        filteredData,
        packer.getDeflateOptions()
      );
      filteredData = null;
      if (!compressedData || !compressedData.length) {
        throw new Error("bad png - invalid compressed data response");
      }
      chunks.push(packer.packIDAT(compressedData));
      chunks.push(packer.packIEND());
      return Buffer.concat(chunks);
    };
  }
});

// ../../node_modules/pngjs/lib/png-sync.js
var require_png_sync = __commonJS({
  "../../node_modules/pngjs/lib/png-sync.js"(exports) {
    "use strict";
    var parse = require_parser_sync();
    var pack = require_packer_sync();
    exports.read = function(buffer, options) {
      return parse(buffer, options || {});
    };
    exports.write = function(png, options) {
      return pack(png, options);
    };
  }
});

// ../../node_modules/pngjs/lib/png.js
var require_png = __commonJS({
  "../../node_modules/pngjs/lib/png.js"(exports) {
    "use strict";
    var util = __require("util");
    var Stream = __require("stream");
    var Parser = require_parser_async();
    var Packer = require_packer_async();
    var PNGSync = require_png_sync();
    var PNG = exports.PNG = function(options) {
      Stream.call(this);
      options = options || {};
      this.width = options.width | 0;
      this.height = options.height | 0;
      this.data = this.width > 0 && this.height > 0 ? Buffer.alloc(4 * this.width * this.height) : null;
      if (options.fill && this.data) {
        this.data.fill(0);
      }
      this.gamma = 0;
      this.readable = this.writable = true;
      this._parser = new Parser(options);
      this._parser.on("error", this.emit.bind(this, "error"));
      this._parser.on("close", this._handleClose.bind(this));
      this._parser.on("metadata", this._metadata.bind(this));
      this._parser.on("gamma", this._gamma.bind(this));
      this._parser.on(
        "parsed",
        function(data) {
          this.data = data;
          this.emit("parsed", data);
        }.bind(this)
      );
      this._packer = new Packer(options);
      this._packer.on("data", this.emit.bind(this, "data"));
      this._packer.on("end", this.emit.bind(this, "end"));
      this._parser.on("close", this._handleClose.bind(this));
      this._packer.on("error", this.emit.bind(this, "error"));
    };
    util.inherits(PNG, Stream);
    PNG.sync = PNGSync;
    PNG.prototype.pack = function() {
      if (!this.data || !this.data.length) {
        this.emit("error", "No data provided");
        return this;
      }
      process.nextTick(
        function() {
          this._packer.pack(this.data, this.width, this.height, this.gamma);
        }.bind(this)
      );
      return this;
    };
    PNG.prototype.parse = function(data, callback) {
      if (callback) {
        let onParsed, onError;
        onParsed = function(parsedData) {
          this.removeListener("error", onError);
          this.data = parsedData;
          callback(null, this);
        }.bind(this);
        onError = function(err) {
          this.removeListener("parsed", onParsed);
          callback(err, null);
        }.bind(this);
        this.once("parsed", onParsed);
        this.once("error", onError);
      }
      this.end(data);
      return this;
    };
    PNG.prototype.write = function(data) {
      this._parser.write(data);
      return true;
    };
    PNG.prototype.end = function(data) {
      this._parser.end(data);
    };
    PNG.prototype._metadata = function(metadata) {
      this.width = metadata.width;
      this.height = metadata.height;
      this.emit("metadata", metadata);
    };
    PNG.prototype._gamma = function(gamma) {
      this.gamma = gamma;
    };
    PNG.prototype._handleClose = function() {
      if (!this._parser.writable && !this._packer.readable) {
        this.emit("close");
      }
    };
    PNG.bitblt = function(src, dst, srcX, srcY, width, height, deltaX, deltaY) {
      srcX |= 0;
      srcY |= 0;
      width |= 0;
      height |= 0;
      deltaX |= 0;
      deltaY |= 0;
      if (srcX > src.width || srcY > src.height || srcX + width > src.width || srcY + height > src.height) {
        throw new Error("bitblt reading outside image");
      }
      if (deltaX > dst.width || deltaY > dst.height || deltaX + width > dst.width || deltaY + height > dst.height) {
        throw new Error("bitblt writing outside image");
      }
      for (let y = 0; y < height; y++) {
        src.data.copy(
          dst.data,
          (deltaY + y) * dst.width + deltaX << 2,
          (srcY + y) * src.width + srcX << 2,
          (srcY + y) * src.width + srcX + width << 2
        );
      }
    };
    PNG.prototype.bitblt = function(dst, srcX, srcY, width, height, deltaX, deltaY) {
      PNG.bitblt(this, dst, srcX, srcY, width, height, deltaX, deltaY);
      return this;
    };
    PNG.adjustGamma = function(src) {
      if (src.gamma) {
        for (let y = 0; y < src.height; y++) {
          for (let x = 0; x < src.width; x++) {
            let idx = src.width * y + x << 2;
            for (let i = 0; i < 3; i++) {
              let sample = src.data[idx + i] / 255;
              sample = Math.pow(sample, 1 / 2.2 / src.gamma);
              src.data[idx + i] = Math.round(sample * 255);
            }
          }
        }
        src.gamma = 0;
      }
    };
    PNG.prototype.adjustGamma = function() {
      PNG.adjustGamma(this);
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS({
  "../../node_modules/qrcode/lib/renderer/utils.js"(exports) {
    function hex2rgba(hex) {
      if (typeof hex === "number") {
        hex = hex.toString();
      }
      if (typeof hex !== "string") {
        throw new Error("Color should be defined as hex string");
      }
      let hexCode = hex.slice().replace("#", "").split("");
      if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
        throw new Error("Invalid hex color: " + hex);
      }
      if (hexCode.length === 3 || hexCode.length === 4) {
        hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
          return [c, c];
        }));
      }
      if (hexCode.length === 6) hexCode.push("F", "F");
      const hexValue = parseInt(hexCode.join(""), 16);
      return {
        r: hexValue >> 24 & 255,
        g: hexValue >> 16 & 255,
        b: hexValue >> 8 & 255,
        a: hexValue & 255,
        hex: "#" + hexCode.slice(0, 6).join("")
      };
    }
    exports.getOptions = function getOptions(options) {
      if (!options) options = {};
      if (!options.color) options.color = {};
      const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
      const width = options.width && options.width >= 21 ? options.width : void 0;
      const scale = options.scale || 4;
      return {
        width,
        scale: width ? 4 : scale,
        margin,
        color: {
          dark: hex2rgba(options.color.dark || "#000000ff"),
          light: hex2rgba(options.color.light || "#ffffffff")
        },
        type: options.type,
        rendererOpts: options.rendererOpts || {}
      };
    };
    exports.getScale = function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    };
    exports.getImageWidth = function getImageWidth(qrSize, opts) {
      const scale = exports.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    };
    exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports.getScale(size, opts);
      const symbolSize = Math.floor((size + opts.margin * 2) * scale);
      const scaledMargin = opts.margin * scale;
      const palette = [opts.color.light, opts.color.dark];
      for (let i = 0; i < symbolSize; i++) {
        for (let j = 0; j < symbolSize; j++) {
          let posDst = (i * symbolSize + j) * 4;
          let pxColor = opts.color.light;
          if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
            const iSrc = Math.floor((i - scaledMargin) / scale);
            const jSrc = Math.floor((j - scaledMargin) / scale);
            pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
          }
          imgData[posDst++] = pxColor.r;
          imgData[posDst++] = pxColor.g;
          imgData[posDst++] = pxColor.b;
          imgData[posDst] = pxColor.a;
        }
      }
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/png.js
var require_png2 = __commonJS({
  "../../node_modules/qrcode/lib/renderer/png.js"(exports) {
    var fs = __require("fs");
    var PNG = require_png().PNG;
    var Utils = require_utils2();
    exports.render = function render(qrData, options) {
      const opts = Utils.getOptions(options);
      const pngOpts = opts.rendererOpts;
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      pngOpts.width = size;
      pngOpts.height = size;
      const pngImage = new PNG(pngOpts);
      Utils.qrToImageData(pngImage.data, qrData, opts);
      return pngImage;
    };
    exports.renderToDataURL = function renderToDataURL(qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      exports.renderToBuffer(qrData, options, function(err, output) {
        if (err) cb(err);
        let url = "data:image/png;base64,";
        url += output.toString("base64");
        cb(null, url);
      });
    };
    exports.renderToBuffer = function renderToBuffer(qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      const png = exports.render(qrData, options);
      const buffer = [];
      png.on("error", cb);
      png.on("data", function(data) {
        buffer.push(data);
      });
      png.on("end", function() {
        cb(null, Buffer.concat(buffer));
      });
      png.pack();
    };
    exports.renderToFile = function renderToFile(path, qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      let called = false;
      const done = (...args) => {
        if (called) return;
        called = true;
        cb.apply(null, args);
      };
      const stream = fs.createWriteStream(path);
      stream.on("error", done);
      stream.on("close", done);
      exports.renderToFileStream(stream, qrData, options);
    };
    exports.renderToFileStream = function renderToFileStream(stream, qrData, options) {
      const png = exports.render(qrData, options);
      png.pack().pipe(stream);
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/utf8.js
var require_utf8 = __commonJS({
  "../../node_modules/qrcode/lib/renderer/utf8.js"(exports) {
    var Utils = require_utils2();
    var BLOCK_CHAR = {
      WW: " ",
      WB: "\u2584",
      BB: "\u2588",
      BW: "\u2580"
    };
    var INVERTED_BLOCK_CHAR = {
      BB: " ",
      BW: "\u2584",
      WW: "\u2588",
      WB: "\u2580"
    };
    function getBlockChar(top, bottom, blocks) {
      if (top && bottom) return blocks.BB;
      if (top && !bottom) return blocks.BW;
      if (!top && bottom) return blocks.WB;
      return blocks.WW;
    }
    exports.render = function(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      let blocks = BLOCK_CHAR;
      if (opts.color.dark.hex === "#ffffff" || opts.color.light.hex === "#000000") {
        blocks = INVERTED_BLOCK_CHAR;
      }
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      let output = "";
      let hMargin = Array(size + opts.margin * 2 + 1).join(blocks.WW);
      hMargin = Array(opts.margin / 2 + 1).join(hMargin + "\n");
      const vMargin = Array(opts.margin + 1).join(blocks.WW);
      output += hMargin;
      for (let i = 0; i < size; i += 2) {
        output += vMargin;
        for (let j = 0; j < size; j++) {
          const topModule = data[i * size + j];
          const bottomModule = data[(i + 1) * size + j];
          output += getBlockChar(topModule, bottomModule, blocks);
        }
        output += vMargin + "\n";
      }
      output += hMargin.slice(0, -1);
      if (typeof cb === "function") {
        cb(null, output);
      }
      return output;
    };
    exports.renderToFile = function renderToFile(path, qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      const fs = __require("fs");
      const utf8 = exports.render(qrData, options);
      fs.writeFile(path, utf8, cb);
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/terminal/terminal.js
var require_terminal = __commonJS({
  "../../node_modules/qrcode/lib/renderer/terminal/terminal.js"(exports) {
    exports.render = function(qrData, options, cb) {
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const black = "\x1B[40m  \x1B[0m";
      const white = "\x1B[47m  \x1B[0m";
      let output = "";
      const hMargin = Array(size + 3).join(white);
      const vMargin = Array(2).join(white);
      output += hMargin + "\n";
      for (let i = 0; i < size; ++i) {
        output += white;
        for (let j = 0; j < size; j++) {
          output += data[i * size + j] ? black : white;
        }
        output += vMargin + "\n";
      }
      output += hMargin + "\n";
      if (typeof cb === "function") {
        cb(null, output);
      }
      return output;
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/terminal/terminal-small.js
var require_terminal_small = __commonJS({
  "../../node_modules/qrcode/lib/renderer/terminal/terminal-small.js"(exports) {
    var backgroundWhite = "\x1B[47m";
    var backgroundBlack = "\x1B[40m";
    var foregroundWhite = "\x1B[37m";
    var foregroundBlack = "\x1B[30m";
    var reset = "\x1B[0m";
    var lineSetupNormal = backgroundWhite + foregroundBlack;
    var lineSetupInverse = backgroundBlack + foregroundWhite;
    var createPalette = function(lineSetup, foregroundWhite2, foregroundBlack2) {
      return {
        // 1 ... white, 2 ... black, 0 ... transparent (default)
        "00": reset + " " + lineSetup,
        "01": reset + foregroundWhite2 + "\u2584" + lineSetup,
        "02": reset + foregroundBlack2 + "\u2584" + lineSetup,
        10: reset + foregroundWhite2 + "\u2580" + lineSetup,
        11: " ",
        12: "\u2584",
        20: reset + foregroundBlack2 + "\u2580" + lineSetup,
        21: "\u2580",
        22: "\u2588"
      };
    };
    var mkCodePixel = function(modules, size, x, y) {
      const sizePlus = size + 1;
      if (x >= sizePlus || y >= sizePlus || y < -1 || x < -1) return "0";
      if (x >= size || y >= size || y < 0 || x < 0) return "1";
      const idx = y * size + x;
      return modules[idx] ? "2" : "1";
    };
    var mkCode = function(modules, size, x, y) {
      return mkCodePixel(modules, size, x, y) + mkCodePixel(modules, size, x, y + 1);
    };
    exports.render = function(qrData, options, cb) {
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const inverse = !!(options && options.inverse);
      const lineSetup = options && options.inverse ? lineSetupInverse : lineSetupNormal;
      const white = inverse ? foregroundBlack : foregroundWhite;
      const black = inverse ? foregroundWhite : foregroundBlack;
      const palette = createPalette(lineSetup, white, black);
      const newLine = reset + "\n" + lineSetup;
      let output = lineSetup;
      for (let y = -1; y < size + 1; y += 2) {
        for (let x = -1; x < size; x++) {
          output += palette[mkCode(data, size, x, y)];
        }
        output += palette[mkCode(data, size, size, y)] + newLine;
      }
      output += reset;
      if (typeof cb === "function") {
        cb(null, output);
      }
      return output;
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/terminal.js
var require_terminal2 = __commonJS({
  "../../node_modules/qrcode/lib/renderer/terminal.js"(exports) {
    var big = require_terminal();
    var small = require_terminal_small();
    exports.render = function(qrData, options, cb) {
      if (options && options.small) {
        return small.render(qrData, options, cb);
      }
      return big.render(qrData, options, cb);
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS({
  "../../node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
    var Utils = require_utils2();
    function getColorAttrib(color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';
      return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
    }
    function svgCmd(cmd, x, y) {
      let str = cmd + x;
      if (typeof y !== "undefined") str += " " + y;
      return str;
    }
    function qrToPath(data, size, margin) {
      let path = "";
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;
      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);
        if (!col && !newRow) newRow = true;
        if (data[i]) {
          lineLength++;
          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
            moveBy = 0;
            newRow = false;
          }
          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd("h", lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }
      return path;
    }
    exports.render = function render(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;
      const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
      const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
      const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
      const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
      if (typeof cb === "function") {
        cb(null, svgTag);
      }
      return svgTag;
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/svg.js
var require_svg = __commonJS({
  "../../node_modules/qrcode/lib/renderer/svg.js"(exports) {
    var svgTagRenderer = require_svg_tag();
    exports.render = svgTagRenderer.render;
    exports.renderToFile = function renderToFile(path, qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      const fs = __require("fs");
      const svgTag = exports.render(qrData, options);
      const xmlStr = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + svgTag;
      fs.writeFile(path, xmlStr, cb);
    };
  }
});

// ../../node_modules/qrcode/lib/renderer/canvas.js
var require_canvas = __commonJS({
  "../../node_modules/qrcode/lib/renderer/canvas.js"(exports) {
    var Utils = require_utils2();
    function clearCanvas(ctx, canvas, size) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!canvas.style) canvas.style = {};
      canvas.height = size;
      canvas.width = size;
      canvas.style.height = size + "px";
      canvas.style.width = size + "px";
    }
    function getCanvasElement() {
      try {
        return document.createElement("canvas");
      } catch (e) {
        throw new Error("You need to specify a canvas element");
      }
    }
    exports.render = function render(qrData, canvas, options) {
      let opts = options;
      let canvasEl = canvas;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!canvas) {
        canvasEl = getCanvasElement();
      }
      opts = Utils.getOptions(opts);
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      const ctx = canvasEl.getContext("2d");
      const image = ctx.createImageData(size, size);
      Utils.qrToImageData(image.data, qrData, opts);
      clearCanvas(ctx, canvasEl, size);
      ctx.putImageData(image, 0, 0);
      return canvasEl;
    };
    exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
      let opts = options;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!opts) opts = {};
      const canvasEl = exports.render(qrData, canvas, opts);
      const type = opts.type || "image/png";
      const rendererOpts = opts.rendererOpts || {};
      return canvasEl.toDataURL(type, rendererOpts.quality);
    };
  }
});

// ../../node_modules/qrcode/lib/browser.js
var require_browser = __commonJS({
  "../../node_modules/qrcode/lib/browser.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var CanvasRenderer = require_canvas();
    var SvgRenderer = require_svg_tag();
    function renderCanvas(renderFunc, canvas, text, opts, cb) {
      const args = [].slice.call(arguments, 1);
      const argsNum = args.length;
      const isLastArgCb = typeof args[argsNum - 1] === "function";
      if (!isLastArgCb && !canPromise()) {
        throw new Error("Callback required as last argument");
      }
      if (isLastArgCb) {
        if (argsNum < 2) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 2) {
          cb = text;
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 3) {
          if (canvas.getContext && typeof cb === "undefined") {
            cb = opts;
            opts = void 0;
          } else {
            cb = opts;
            opts = text;
            text = canvas;
            canvas = void 0;
          }
        }
      } else {
        if (argsNum < 1) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 1) {
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 2 && !canvas.getContext) {
          opts = text;
          text = canvas;
          canvas = void 0;
        }
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, opts);
            resolve(renderFunc(data, canvas, opts));
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, opts);
        cb(null, renderFunc(data, canvas, opts));
      } catch (e) {
        cb(e);
      }
    }
    exports.create = QRCode2.create;
    exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
    exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
    exports.toString = renderCanvas.bind(null, function(data, _, opts) {
      return SvgRenderer.render(data, opts);
    });
  }
});

// ../../node_modules/qrcode/lib/server.js
var require_server = __commonJS({
  "../../node_modules/qrcode/lib/server.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var PngRenderer = require_png2();
    var Utf8Renderer = require_utf8();
    var TerminalRenderer = require_terminal2();
    var SvgRenderer = require_svg();
    function checkParams(text, opts, cb) {
      if (typeof text === "undefined") {
        throw new Error("String required as first argument");
      }
      if (typeof cb === "undefined") {
        cb = opts;
        opts = {};
      }
      if (typeof cb !== "function") {
        if (!canPromise()) {
          throw new Error("Callback required as last argument");
        } else {
          opts = cb || {};
          cb = null;
        }
      }
      return {
        opts,
        cb
      };
    }
    function getTypeFromFilename(path) {
      return path.slice((path.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    }
    function getRendererFromType(type) {
      switch (type) {
        case "svg":
          return SvgRenderer;
        case "txt":
        case "utf8":
          return Utf8Renderer;
        case "png":
        case "image/png":
        default:
          return PngRenderer;
      }
    }
    function getStringRendererFromType(type) {
      switch (type) {
        case "svg":
          return SvgRenderer;
        case "terminal":
          return TerminalRenderer;
        case "utf8":
        default:
          return Utf8Renderer;
      }
    }
    function render(renderFunc, text, params) {
      if (!params.cb) {
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, params.opts);
            return renderFunc(data, params.opts, function(err, data2) {
              return err ? reject(err) : resolve(data2);
            });
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, params.opts);
        return renderFunc(data, params.opts, params.cb);
      } catch (e) {
        params.cb(e);
      }
    }
    exports.create = QRCode2.create;
    exports.toCanvas = require_browser().toCanvas;
    exports.toString = function toString(text, opts, cb) {
      const params = checkParams(text, opts, cb);
      const type = params.opts ? params.opts.type : void 0;
      const renderer = getStringRendererFromType(type);
      return render(renderer.render, text, params);
    };
    exports.toDataURL = function toDataURL(text, opts, cb) {
      const params = checkParams(text, opts, cb);
      const renderer = getRendererFromType(params.opts.type);
      return render(renderer.renderToDataURL, text, params);
    };
    exports.toBuffer = function toBuffer(text, opts, cb) {
      const params = checkParams(text, opts, cb);
      const renderer = getRendererFromType(params.opts.type);
      return render(renderer.renderToBuffer, text, params);
    };
    exports.toFile = function toFile(path, text, opts, cb) {
      if (typeof path !== "string" || !(typeof text === "string" || typeof text === "object")) {
        throw new Error("Invalid argument");
      }
      if (arguments.length < 3 && !canPromise()) {
        throw new Error("Too few arguments provided");
      }
      const params = checkParams(text, opts, cb);
      const type = params.opts.type || getTypeFromFilename(path);
      const renderer = getRendererFromType(type);
      const renderToFile = renderer.renderToFile.bind(null, path);
      return render(renderToFile, text, params);
    };
    exports.toFileStream = function toFileStream(stream, text, opts) {
      if (arguments.length < 2) {
        throw new Error("Too few arguments provided");
      }
      const params = checkParams(text, opts, stream.emit.bind(stream, "error"));
      const renderer = getRendererFromType("png");
      const renderToFileStream = renderer.renderToFileStream.bind(null, stream);
      render(renderToFileStream, text, params);
    };
  }
});

// ../../node_modules/qrcode/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/qrcode/lib/index.js"(exports, module) {
    module.exports = require_server();
  }
});

// ../../node_modules/ws/lib/constants.js
var require_constants2 = __commonJS({
  "../../node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// ../../node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "../../node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants2();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// ../../node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "../../node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// ../../node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "../../node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants2();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// ../../node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "../../node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants2();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// ../../node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "../../node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants2();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// ../../node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "../../node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants2();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// ../../node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "../../node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants2();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// ../../node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "../../node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name2, elem) {
      if (dest[name2] === void 0) dest[name2] = [elem];
      else dest[name2].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name2 = header.slice(start, end);
            if (code === 44) {
              push(offers, name2, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name2;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse };
  }
});

// ../../node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "../../node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net3 = __require("net");
    var tls = __require("tls");
    var { randomBytes: randomBytes2, createHash: createHash2 } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants2();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            if (!options || options.protocols === void 0) {
              protocols = [];
            } else if (Array.isArray(options.protocols)) {
              protocols = options.protocols;
            } else {
              protocols = [options.protocols];
            }
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              if (options.protocols === void 0) {
                protocols = [];
              } else if (Array.isArray(options.protocols)) {
                protocols = options.protocols;
              } else {
                protocols = [options.protocols];
              }
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._readyState = _WebSocket.CLOSING;
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        protocols: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes2(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash2("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net3.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net3.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// ../../node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "../../node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// ../../node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "../../node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse };
  }
});

// ../../node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "../../node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash: createHash2 } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants2();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash2("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// src/index.js
import { readFileSync as readFileSync3, writeFileSync as writeFileSync4, mkdirSync as mkdirSync4 } from "node:fs";
import { join as join7, dirname as dirname3 } from "node:path";
import { homedir as homedir4 } from "node:os";
import { randomInt as randomInt2 } from "node:crypto";

// src/service.mjs
var import_qrcode = __toESM(require_lib(), 1);
import { networkInterfaces, hostname as osHostname, platform as osPlatform, arch as osArch } from "node:os";
import { readFileSync, rmSync, mkdirSync as mkdirSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join5, dirname } from "node:path";
import { homedir as homedir2 } from "node:os";

// src/proxy.mjs
import { createServer } from "node:http";
import { request as httpRequest } from "node:http";
import { createHash, timingSafeEqual, randomInt } from "node:crypto";
var UPSTREAM = { host: "127.0.0.1", port: 3080 };
var PRIVATE_RE = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1(?:0\d|1\d|2[0-7]))\.)/;
function hostClass(host) {
  let name2 = String(host ?? "").trim().toLowerCase();
  if (name2.startsWith("[")) {
    const end = name2.indexOf("]");
    if (end >= 0) name2 = name2.slice(1, end);
  } else {
    name2 = name2.replace(/:\d+$/, "");
  }
  if (name2 === "localhost" || name2 === "0.0.0.0" || name2 === "::1" || /^127\./.test(name2)) return "loopback";
  if (PRIVATE_RE.test(name2)) return "lan";
  if (/^(?:fe80:|f[cd][0-9a-f]{2}:)/.test(name2) && name2.includes(":")) return "lan";
  if (name2 === "" || name2.includes(":")) return "loopback";
  if (name2.endsWith(".local") || !name2.includes(".")) return "lan";
  return "public";
}
function sourceClass(addr) {
  let a = String(addr ?? "").trim().toLowerCase();
  if (!a) return null;
  if (a.startsWith("::ffff:")) a = a.slice(7);
  if (a === "::1" || /^127\./.test(a)) return "loopback";
  if (PRIVATE_RE.test(a) || /^169\.254\./.test(a)) return "lan";
  if (/^(?:fe80:|f[cd][0-9a-f]{2}:)/.test(a)) return "lan";
  return "public";
}
var RANK = { loopback: 0, lan: 1, public: 2 };
function policyHost(req, host) {
  const actual = sourceClass(req?.socket?.remoteAddress);
  if (!actual) return host;
  const claimed = hostClass(host);
  if (RANK[actual] <= RANK[claimed]) return host;
  let addr = String(req.socket.remoteAddress);
  if (addr.toLowerCase().startsWith("::ffff:")) addr = addr.slice(7);
  return addr;
}
var POLYFILL_HTML = `<script data-dsh-relay-polyfill="1">!function(){try{if(!(self.crypto&&self.crypto.randomUUID)){var u=new Uint8Array(16);self.crypto=self.crypto||{};self.crypto.randomUUID=function(){self.crypto.getRandomValues(u);u[6]=u[6]&15|64;u[8]=u[8]&63|128;var h="";for(var i=0;i<16;i++){h+=(i===4||i===6||i===8||i===10?"-":"")+u[i].toString(16).padStart(2,"0");}return h;};}}catch(e){}}();
!function(){try{if(self.AbortSignal&&!self.AbortSignal.any){self.AbortSignal.any=function(list){list=Array.from(list||[]);var ctl=new AbortController();var done=false;function relay(){if(done)return;for(var i=0;i<list.length;i++){if(list[i].aborted){done=true;try{ctl.abort(list[i].reason);}catch(e){ctl.abort();}break;}}}for(var i=0;i<list.length;i++){list[i].addEventListener("abort",relay,{once:true});}relay();return ctl.signal;};}}catch(e){}}();
!function(){try{var K="__DSH_TRANSPORT__";function fix(t){try{if(t&&typeof t==="object"&&typeof t.createApiClient!=="function"){t.createApiClient=function(){return null;};}}catch(e){}return t;}var cur=globalThis[K];if(cur)fix(cur);Object.defineProperty(globalThis,K,{configurable:true,enumerable:true,get:function(){return cur;},set:function(v){cur=fix(v);}});}catch(e){}}();</script>`;
var POLYFILL_MARK = 'data-dsh-relay-polyfill="1"';
function isCompressed(headers) {
  return /(^|,\s*)(gzip|br|deflate)(\s*,|$)/i.test(String(headers["content-encoding"] ?? ""));
}
function isHtmlRequest(req) {
  const accept = String(req.headers.accept ?? "");
  if (accept.includes("text/html")) return true;
  let pathname = String(req.url ?? "/");
  try {
    pathname = new URL(req.url || "/", "http://x").pathname;
  } catch {
  }
  return pathname === "/" || /\.html?$/i.test(pathname);
}
var AUTH_COOKIE = "dsh_relay_auth";
var COOKIE_MAX_AGE = 30 * 24 * 3600;
function cookieValue(pin, sessionKey) {
  return sessionKey ? createHash("sha256").update(`${pin}:${sessionKey}`).digest("hex") : pin;
}
function safeEqual(a, b) {
  const ba = Buffer.from(String(a ?? ""), "utf8");
  const bb = Buffer.from(String(b ?? ""), "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
function parseCookies(header) {
  const out = {};
  for (const part of String(header ?? "").split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0) out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}
function loginPageHtml(error, isPublic, retryAfter = 0) {
  const where = isPublic ? "This public address" : "This LAN address";
  const whereZh = isPublic ? "\u6B64\u516C\u7F51\u5730\u5740" : "\u6B64\u5C40\u57DF\u7F51\u5730\u5740";
  const errMsg = error === "locked" ? `\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u8BF7 ${retryAfter} \u79D2\u540E\u518D\u8BD5 | Try again in ${retryAfter}s` : error ? "\u5BC6\u7801\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5 | Wrong PIN" : "";
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DSH Relay \xB7 \u8BBF\u95EE\u9A8C\u8BC1</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;max-width:320px;width:calc(100% - 48px);text-align:center}
h1{font-size:16px;margin:0 0 4px;color:#111827}p{font-size:13px;color:#6b7280;margin:0 0 16px}
input{width:100%;box-sizing:border-box;padding:10px 12px;font-size:18px;letter-spacing:6px;text-align:center;border:1px solid #d1d5db;border-radius:8px;outline:none;margin-bottom:12px}
button{width:100%;padding:10px;font-size:15px;background:#4f6ef7;color:#fff;border:none;border-radius:8px;cursor:pointer}
.err{color:#dc2626;font-size:12px;margin-bottom:10px;min-height:16px}</style>
</head><body><div class="card"><h1>\u{1F510} DSH Relay</h1>
<p>${whereZh}\u53D7\u8BBF\u95EE\u5BC6\u7801\u4FDD\u62A4\uFF0C\u8BF7\u8F93\u5165 8 \u4F4D\u5BC6\u7801 | ${where} is PIN-protected (8 chars)</p>
<div class="err">${errMsg}</div>
<form method="post" action="/auth/login">
<input name="token" type="password" maxlength="8" autocomplete="one-time-code" autofocus required>
<button type="submit">\u8FDB\u5165 | Enter</button></form></div></body></html>`;
}
function lanDisabledPageHtml() {
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>DSH Relay \xB7 \u5C40\u57DF\u7F51\u8BBF\u95EE\u5DF2\u5173\u95ED</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-family:-apple-system,sans-serif}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;max-width:360px;text-align:center}
h1{font-size:16px;color:#111827;margin:0 0 8px}p{font-size:13px;color:#6b7280;margin:0;line-height:1.6}</style>
</head><body><div class="card"><h1>\u{1F512} DSH Relay</h1>
<p>\u5C40\u57DF\u7F51\u8BBF\u95EE\u5DF2\u5173\u95ED\u3002<br>\u8BF7\u5728\u7535\u8111\u4E0A\u7684\u8BBE\u7F6E\u9875\u91CD\u65B0\u5F00\u542F\u3002<br><br>LAN access is disabled. Re-enable it on the computer.</p>
</div></body></html>`;
}
function transitionPageHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/"><title>DSH Relay</title></head><body style="font-family:sans-serif;color:#6b7280">\u6B63\u5728\u8FDB\u5165\u2026 | opening\u2026</body></html>`;
}
function createRateLimiter() {
  const perIp = /* @__PURE__ */ new Map();
  const global_ = { count: 0, windowStart: 0, lockedUntil: 0 };
  return {
    status(ip) {
      const now = Date.now();
      if (global_.lockedUntil > now) return { locked: true, retryAfter: Math.ceil((global_.lockedUntil - now) / 1e3) };
      const until = perIp.get(ip)?.lockedUntil ?? 0;
      if (until > now) return { locked: true, retryAfter: Math.ceil((until - now) / 1e3) };
      return { locked: false, retryAfter: 0 };
    },
    record(ip) {
      const now = Date.now();
      let rec = perIp.get(ip);
      if (!rec || now - rec.windowStart > 6e4) rec = { count: 0, windowStart: now, lockedUntil: 0 };
      rec.count += 1;
      if (rec.count >= 5) rec.lockedUntil = now + 6e4;
      perIp.set(ip, rec);
      if (now - global_.windowStart > 6e4) {
        global_.count = 0;
        global_.windowStart = now;
      }
      if (++global_.count >= 50) global_.lockedUntil = now + 3e4;
    },
    clear(ip) {
      perIp.delete(ip);
    }
  };
}
function clientIp(req) {
  return req.socket?.remoteAddress || "unknown";
}
function loopbackHeaders(headers, upstream) {
  const authority = `${upstream.host}:${upstream.port}`;
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    const lk = k.toLowerCase();
    if (lk === "host" || lk === "origin" || lk === "referer" || lk === "sec-fetch-site") continue;
    out[lk] = v;
  }
  out.host = authority;
  out.origin = `http://${authority}`;
  if (headers.referer) {
    try {
      const ref = new URL(String(headers.referer));
      ref.protocol = "http:";
      ref.host = authority;
      out.referer = ref.toString();
    } catch {
      out.referer = `http://${authority}/`;
    }
  }
  out["sec-fetch-site"] = "same-origin";
  return out;
}
var DSH_AUTH_COOKIE_PREFIX = "dsh-auth-";
var HANDSHAKE_LIMIT = 3;
var HANDSHAKE_WINDOW_MS = 6e4;
function createHandshakeTracker() {
  const hits = /* @__PURE__ */ new Map();
  return {
    record(ip, now = Date.now()) {
      let rec = hits.get(ip);
      if (!rec || now - rec.start > HANDSHAKE_WINDOW_MS) {
        rec = { count: 1, start: now };
        hits.set(ip, rec);
        return 1;
      }
      return ++rec.count;
    },
    clear(ip) {
      hits.delete(ip);
    },
    exhausted(ip) {
      return (hits.get(ip)?.count ?? 0) >= HANDSHAKE_LIMIT;
    }
  };
}
function hasDshAuthCookie(cookieHeader) {
  return String(cookieHeader ?? "").includes(DSH_AUTH_COOKIE_PREFIX);
}
function withLaunchToken(reqUrl, req, launchToken, tracker) {
  if (req.method !== "GET") return reqUrl;
  let u;
  try {
    u = new URL(reqUrl || "/", "http://x");
  } catch {
    return reqUrl;
  }
  if (u.pathname !== "/") return reqUrl;
  if (hasDshAuthCookie(req.headers.cookie)) return reqUrl;
  const ip = clientIp(req);
  if (tracker.exhausted(ip)) return reqUrl;
  const token = launchToken();
  if (!token) return reqUrl;
  tracker.record(ip);
  u.searchParams.set("token", token);
  return `${u.pathname}${u.search}`;
}
function createRelayProxy({
  port = 3082,
  host = "0.0.0.0",
  upstream = UPSTREAM,
  auth = null,
  lanAccessEnabled = () => true,
  launchToken = () => "",
  injectPolyfills = true,
  tunnelPort = null,
  log = () => {
  }
} = {}) {
  const limiter = auth ? createRateLimiter() : null;
  const handshake = createHandshakeTracker();
  function pinKindFor(req, forcePublic = false) {
    if (forcePublic) return "public";
    const host2 = policyHost(req, String(req.headers.host ?? ""));
    const cls = hostClass(host2);
    if (cls === "public") return "public";
    if (cls === "lan") return "lan";
    return null;
  }
  function authCheck(req, pin) {
    const expectedCookie = cookieValue(pin, auth?.sessionKey);
    const cookies = parseCookies(req.headers.cookie);
    if (cookies[AUTH_COOKIE] && safeEqual(cookies[AUTH_COOKIE], expectedCookie)) return { ok: true, seed: null };
    let qTok = null;
    try {
      qTok = new URL(req.url || "/", "http://x").searchParams.get("token");
    } catch {
    }
    if (qTok && safeEqual(qTok, pin)) return { ok: true, seed: qTok };
    return { ok: false, seed: null };
  }
  function seedCookie(res, rawPin) {
    const origWriteHead = res.writeHead.bind(res);
    res.writeHead = function(status, headers) {
      const h = { ...headers ?? {} };
      const cookie = `${AUTH_COOKIE}=${cookieValue(rawPin, auth?.sessionKey)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
      const prev = h["set-cookie"];
      if (Array.isArray(prev)) h["set-cookie"] = [...prev, cookie];
      else if (typeof prev === "string") h["set-cookie"] = [prev, cookie];
      else h["set-cookie"] = cookie;
      return origWriteHead(status, h);
    };
  }
  function handleRequest(req, res, forcePublic = false) {
    const host2 = policyHost(req, String(req.headers.host ?? ""));
    const cls = hostClass(host2);
    if (cls === "lan" && !lanAccessEnabled()) {
      if (isHtmlRequest(req)) {
        res.writeHead(403, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        res.end(lanDisabledPageHtml());
      } else {
        res.writeHead(403, { "content-type": "application/json" });
        res.end('{"error":"lan-disabled"}');
      }
      return;
    }
    if (auth) {
      const kind = pinKindFor(req, forcePublic);
      const protectedKind = kind === "public" ? true : kind === "lan" ? auth.isProtected("lan") : false;
      if (protectedKind) {
        const pin = auth.getPin(kind);
        if (pin) {
          const ip = clientIp(req);
          if (req.method === "POST" && (req.url || "").startsWith("/auth/login")) {
            const rl = limiter.status(ip);
            if (rl.locked) {
              res.writeHead(429, { "content-type": "text/html; charset=utf-8", "retry-after": String(rl.retryAfter) });
              res.end(loginPageHtml("locked", kind === "public", rl.retryAfter));
              return;
            }
            let body = "";
            req.on("data", (c) => {
              body += c;
              if (body.length > 1024) req.destroy();
            });
            req.on("end", () => {
              const submitted = String(new URLSearchParams(body).get("token") ?? "");
              if (safeEqual(submitted, pin)) {
                limiter.clear(ip);
                seedCookie(res, pin);
                res.writeHead(302, { location: "/" });
                res.end();
              } else {
                limiter.record(ip);
                res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                res.end(loginPageHtml(true, kind === "public"));
              }
            });
            return;
          }
          const result = authCheck(req, pin);
          if (!result.ok) {
            if ((req.url || "").includes("token=")) limiter.record(ip);
            if (isHtmlRequest(req)) {
              const rl = limiter.status(ip);
              res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
              res.end(loginPageHtml(rl.locked ? "locked" : true, kind === "public", rl.retryAfter));
            } else {
              res.writeHead(401, { "content-type": "application/json" });
              res.end('{"error":"unauthorized"}');
            }
            return;
          }
          if (result.seed) {
            limiter.clear(ip);
            seedCookie(res, result.seed);
          }
        }
      }
    }
    const cleanPath = req.url;
    const upstreamPath = withLaunchToken(cleanPath, req, launchToken, handshake);
    const didInject = upstreamPath !== cleanPath;
    if (!didInject && hasDshAuthCookie(req.headers.cookie)) handshake.clear(clientIp(req));
    const headers = loopbackHeaders({ ...req.headers }, upstream);
    const proxyReq = httpRequest(
      { host: upstream.host, port: upstream.port, method: req.method, path: upstreamPath, headers, agent: false },
      (proxyRes) => {
        const contentType = String(proxyRes.headers["content-type"] ?? "");
        if (didInject && proxyRes.statusCode === 303 && isHtmlRequest(req)) {
          const out = { ...proxyRes.headers };
          delete out["content-length"];
          delete out["transfer-encoding"];
          delete out["location"];
          const page = Buffer.from(transitionPageHtml());
          out["content-type"] = "text/html; charset=utf-8";
          out["content-length"] = String(page.length);
          out["cache-control"] = "no-store";
          proxyRes.resume();
          res.writeHead(200, out);
          res.end(page);
          return;
        }
        if (injectPolyfills && contentType.includes("text/html") && !isCompressed(proxyRes.headers)) {
          const chunks = [];
          proxyRes.on("data", (c) => chunks.push(c));
          proxyRes.on("end", () => {
            let html = Buffer.concat(chunks).toString("utf8");
            if (!html.includes(POLYFILL_MARK)) {
              html = html.replace(/<head[^>]*>/i, (m) => `${m}${POLYFILL_HTML}`);
            }
            const out = Buffer.from(html, "utf8");
            const outHeaders = { ...proxyRes.headers };
            delete outHeaders["content-length"];
            delete outHeaders["transfer-encoding"];
            outHeaders["content-length"] = String(out.length);
            outHeaders["cache-control"] = "no-store";
            delete outHeaders["etag"];
            res.writeHead(proxyRes.statusCode ?? 200, outHeaders);
            res.end(out);
          });
          proxyRes.on("error", () => res.destroy());
          return;
        }
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
        res.on("close", () => proxyRes.destroy());
        proxyRes.on("error", () => res.destroy());
        proxyRes.on("close", () => {
          if (!res.writableEnded) res.destroy();
        });
      }
    );
    proxyReq.on("error", (err) => {
      if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      res.end(`dsh-relay: \u65E0\u6CD5\u8FDE\u63A5\u4E0A\u6E38 dsh web\uFF08${upstream.host}:${upstream.port}\uFF09\u2014\u2014\u5148\u542F\u52A8 dsh web | upstream unreachable: ${err.message}`);
    });
    req.pipe(proxyReq);
  }
  function handleUpgrade(req, socket, head, forcePublic = false) {
    const host2 = policyHost(req, String(req.headers.host ?? ""));
    const cls = hostClass(host2);
    if (cls === "lan" && !lanAccessEnabled()) {
      socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    if (auth) {
      const kind = pinKindFor(req, forcePublic);
      const protectedKind = kind === "public" ? true : kind === "lan" ? auth.isProtected("lan") : false;
      if (protectedKind) {
        const pin = auth.getPin(kind);
        if (pin && !authCheck(req, pin).ok) {
          socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
          socket.destroy();
          return;
        }
      }
    }
    const headers = loopbackHeaders({ ...req.headers }, upstream);
    const proxyReq = httpRequest({
      host: upstream.host,
      port: upstream.port,
      method: req.method,
      path: req.url,
      headers,
      agent: false
    });
    proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
      socket.write("HTTP/1.1 101 Switching Protocols\r\n");
      const raw = [];
      for (const [k, v] of Object.entries(proxyRes.headers)) {
        raw.push(`${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
      }
      socket.write(`${raw.join("\r\n")}\r
\r
`);
      if (proxyHead?.length) socket.write(proxyHead);
      socket.pipe(proxySocket, { end: false });
      proxySocket.pipe(socket, { end: false });
      let misses = 0;
      const heartbeat = setInterval(() => {
        misses += 1;
        if (misses >= 2) {
          try {
            socket.destroy();
          } catch {
          }
          return;
        }
        try {
          socket.write(Buffer.from([137, 0]));
        } catch {
        }
      }, 3e4);
      heartbeat.unref?.();
      socket.on("data", () => {
        misses = 0;
      });
      const teardown = () => {
        clearInterval(heartbeat);
        try {
          proxySocket.resetAndDestroy?.() ?? proxySocket.destroy();
        } catch {
          try {
            proxySocket.destroy();
          } catch {
          }
        }
        try {
          socket.destroy();
        } catch {
        }
      };
      proxySocket.on("error", () => {
        try {
          socket.destroy();
        } catch {
        }
      });
      proxySocket.on("close", teardown);
      socket.on("close", teardown);
      socket.on("end", teardown);
      proxySocket.on("end", teardown);
    });
    proxyReq.on("response", (proxyRes) => {
      if (proxyRes.statusCode === 101) return;
      try {
        const raw = [`HTTP/1.1 ${proxyRes.statusCode} ${proxyRes.statusMessage ?? ""}`.trim()];
        for (const [k, v] of Object.entries(proxyRes.headers)) {
          raw.push(`${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
        }
        socket.end(raw.join("\r\n") + "\r\n\r\n");
        proxyRes.resume();
      } catch {
        socket.destroy();
      }
    });
    proxyReq.on("error", () => socket.destroy());
    if (head?.length) proxyReq.write(head);
    proxyReq.end();
    socket.on("error", () => socket.destroy());
  }
  const sockets = /* @__PURE__ */ new Set();
  const track = (server2) => server2.on("connection", (sock) => {
    sockets.add(sock);
    sock.on("close", () => sockets.delete(sock));
    sock.on("error", () => {
    });
  });
  const server = createServer((req, res) => handleRequest(req, res, false));
  server.on("upgrade", (req, socket, head) => handleUpgrade(req, socket, head, false));
  track(server);
  const inlet = createServer((req, res) => handleRequest(req, res, true));
  inlet.on("upgrade", (req, socket, head) => handleUpgrade(req, socket, head, true));
  track(inlet);
  const tunnelInlet = typeof tunnelPort === "number" && tunnelPort >= 0 ? createServer((req, res) => handleRequest(req, res, true)) : null;
  if (tunnelInlet) {
    tunnelInlet.on("upgrade", (req, socket, head) => handleUpgrade(req, socket, head, true));
    track(tunnelInlet);
  }
  function listenWithFallback(srv, want, bindHost) {
    return new Promise((resolvePort, rejectPort) => {
      let retries = 10;
      let current = want;
      const onError = (err) => {
        if (err?.code === "EADDRINUSE" && retries > 0) {
          retries -= 1;
          current += 1;
          srv.listen(current, bindHost, onListening);
          return;
        }
        srv.removeListener("error", onError);
        rejectPort(err);
      };
      const onListening = () => {
        srv.removeListener("error", onError);
        resolvePort(srv.address()?.port ?? current);
      };
      srv.on("error", onError);
      srv.listen(current, bindHost, onListening);
    });
  }
  const listeners = [server, inlet];
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    inlet.once("error", reject);
    server.listen(port, host, () => {
      inlet.listen(0, "127.0.0.1", () => {
        const finish = (resolvedTunnelPort) => {
          resolve({
            server,
            inlet,
            tunnelInlet,
            port: server.address().port,
            inletPort: inlet.address().port,
            tunnelPort: resolvedTunnelPort,
            // 未启用时为 null
            close: () => new Promise((r) => {
              for (const s of sockets) {
                try {
                  s.destroy();
                } catch {
                }
              }
              let n = listeners.length;
              const done = () => {
                if (--n === 0) r();
              };
              for (const l of listeners) l.close(done);
            })
          });
        };
        if (!tunnelInlet) return finish(null);
        listenWithFallback(tunnelInlet, tunnelPort, "127.0.0.1").then((resolved) => {
          tunnelInlet.on("error", (err) => log(`dsh-relay: tunnel inlet error: ${err?.message ?? err}`));
          listeners.push(tunnelInlet);
          finish(resolved);
        }).catch(reject);
      });
    });
  });
}

// ../../node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// src/relay.mjs
import net from "node:net";
import { randomBytes } from "node:crypto";
var POOL_SIZE = 8;
var PING_INTERVAL_MS = 15e3;
var PONG_TIMEOUT_MS = 2e4;
var CTL_BACKOFF_MAX_MS = 3e4;
var DATA_BACKOFF_MAX_MS = 1e4;
function normalizeServerUrl(input) {
  let v = String(input ?? "").trim();
  if (!v) return "";
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = `https://${v}`;
  let u;
  try {
    u = new URL(v);
  } catch {
    return "";
  }
  if (u.protocol !== "https:" && u.protocol !== "http:" && u.protocol !== "wss:" && u.protocol !== "ws:") return "";
  const scheme = u.protocol === "http:" || u.protocol === "ws:" ? "ws" : "wss";
  const port = u.port ? `:${u.port}` : "";
  const path = u.pathname.replace(/\/+$/, "");
  return `${scheme}://${u.hostname}${port}${path}`;
}
function publicUrlFromServer(input) {
  const base = normalizeServerUrl(input);
  if (!base) return "";
  try {
    const u = new URL(base.replace(/^ws/, "http"));
    u.protocol = u.protocol === "http:" ? "http:" : "https:";
    u.pathname = "/";
    return u.toString().replace(/\/$/, "/");
  } catch {
    return "";
  }
}
function httpBaseFromServer(input) {
  const base = normalizeServerUrl(input);
  return base ? base.replace(/^ws/, "http") : "";
}
function backoffMs(attempt, cap) {
  const raw = Math.min(1e3 * 2 ** Math.max(0, attempt - 1), cap);
  const jitter = 0.8 + randomBytes(1)[0] / 255 * 0.4;
  return Math.floor(raw * jitter);
}
function tokenEqualStr(a, b) {
  return a === b;
}
var RelayClient = class {
  constructor({ serverUrl, token, proxyPort: proxyPort2, onChange = () => {
  }, log = () => {
  }, identity = null, onRotate = null, hooks = {} }) {
    this.base = normalizeServerUrl(serverUrl);
    this.token = String(token ?? "");
    this.proxyPort = proxyPort2;
    this.onChange = onChange;
    this.log = log;
    this.identity = identity;
    this.onRotate = onRotate;
    this.WS = hooks.WebSocket ?? wrapper_default;
    this.connectTcp = hooks.connectTcp ?? ((port, cb) => {
      const s = net.connect(port, "127.0.0.1", () => cb(null, s));
      s.once("error", (err) => cb(err, s));
      return s;
    });
    this.stopped = true;
    this.ctl = null;
    this.pool = /* @__PURE__ */ new Set();
    this.dataInflight = 0;
    this.dataAttempt = 0;
    this.ctlAttempt = 0;
    this.retryTimers = /* @__PURE__ */ new Set();
    this.ctlTimer = null;
    this.pingTimer = null;
    this.lastPong = 0;
    this.server = null;
    this.phase = "idle";
    this.detail = "";
    this.startedAt = null;
    this.attempts = 0;
    this.nextRetryAt = null;
    this._snapshot = { phase: "idle", detail: "", attempts: 0, nextRetryAt: null, server: null };
  }
  _emit(patch) {
    this._snapshot = { ...this._snapshot, ...patch };
    this.onChange(this._snapshot);
  }
  snapshot() {
    return { ...this._snapshot };
  }
  get running() {
    return !this.stopped;
  }
  start() {
    if (!this.base || !this.token) {
      this.phase = "error";
      this._emit({ phase: "error", detail: "\u672A\u914D\u7F6E\u670D\u52A1\u7AEF\u5730\u5740\u6216 token | server address or token missing" });
      return;
    }
    this.stopped = false;
    this.attempts = 0;
    this.dataAttempt = 0;
    this.dataInflight = 0;
    this.startedAt = Date.now();
    this.phase = "connecting";
    this._emit({ phase: "connecting", detail: "\u8FDE\u63A5\u4E2D\u7EE7\u670D\u52A1\u7AEF\u2026 | connecting to relay\u2026", attempts: 0, nextRetryAt: null });
    this._connectCtl();
    for (let i = 0; i < POOL_SIZE; i++) this._connectData();
  }
  stop() {
    this.stopped = true;
    clearTimeout(this.ctlTimer);
    this.ctlTimer = null;
    for (const t of this.retryTimers) clearTimeout(t);
    this.retryTimers.clear();
    clearInterval(this.pingTimer);
    this.pingTimer = null;
    try {
      this.ctl?.close(1e3, "stopped");
    } catch {
    }
    this.ctl = null;
    for (const ws of [...this.pool]) {
      try {
        ws.close(1e3, "stopped");
      } catch {
      }
    }
    this.pool.clear();
    this.phase = "idle";
    this.attempts = 0;
    this.nextRetryAt = null;
    this.server = null;
    this._emit({ phase: "idle", detail: "", attempts: 0, nextRetryAt: null, server: null });
  }
  dispose() {
    this.stop();
  }
  // ---------- 控制连接 ----------
  _connectCtl() {
    if (this.stopped) return;
    let ws;
    try {
      ws = new this.WS(`${this.base}/__relay/ctl`, { headers: { "x-relay-token": this.token } });
    } catch (err) {
      this._ctlFail(err);
      return;
    }
    this.ctl = ws;
    ws.on("open", () => {
      this.ctlAttempt = 0;
      this.attempts = 0;
      this.nextRetryAt = null;
      this.phase = "ready";
      this.detail = "\u5DF2\u8FDE\u63A5 | connected";
      this._emit({ phase: "ready", detail: this.detail, attempts: 0, nextRetryAt: null });
      this.log("relay: control connected");
      clearInterval(this.pingTimer);
      this.lastPong = Date.now();
      this.pingTimer = setInterval(() => {
        if (Date.now() - this.lastPong > PONG_TIMEOUT_MS) {
          this.log("relay: ping timeout, reconnecting");
          try {
            ws.terminate();
          } catch {
          }
          return;
        }
        try {
          ws.send(JSON.stringify({ type: "ping", t: Date.now() }));
        } catch {
        }
      }, PING_INTERVAL_MS);
      this.pingTimer.unref?.();
      if (this.identity) {
        try {
          ws.send(JSON.stringify({ type: "info", info: this.identity }));
        } catch {
        }
      }
    });
    ws.on("message", (raw, isBinary) => {
      if (isBinary) return;
      let msg;
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (msg.type === "pong") this.lastPong = Date.now();
      else if (msg.type === "hello") this.server = { name: msg.server, protocol: msg.protocol, pool: msg.pool, client: msg.client };
      else if (msg.type === "stats") this.server = { ...this.server, phone: msg.phone, idle: msg.idle, uptime: msg.uptime };
      else if (msg.type === "rotate" && typeof msg.token === "string" && msg.token.length >= 16 && !tokenEqualStr(msg.token, this.token)) {
        this.log("relay: server rotated token, switching credentials");
        this.token = msg.token;
        try {
          this.onRotate?.(msg.token);
        } catch {
        }
        setImmediate(() => {
          if (this.stopped) return;
          this.stop();
          this.start();
        });
      }
      if (msg.type === "hello" || msg.type === "stats") this._emit({ server: this.server });
    });
    const drop = (err) => this._ctlFail(err ?? new Error("control connection lost"));
    let ctlDead = false;
    const dropOnce = (err) => {
      if (ctlDead) return;
      ctlDead = true;
      drop(err);
    };
    ws.on("close", () => dropOnce());
    ws.on("error", dropOnce);
  }
  _ctlFail(err) {
    if (this.stopped) return;
    clearInterval(this.pingTimer);
    this.pingTimer = null;
    try {
      this.ctl?.removeAllListeners?.();
      this.ctl?.close();
    } catch {
    }
    this.ctl = null;
    for (const ws of [...this.pool]) {
      try {
        ws.close();
      } catch {
      }
    }
    this.ctlAttempt += 1;
    this.attempts = this.ctlAttempt;
    const delay = backoffMs(this.ctlAttempt, CTL_BACKOFF_MAX_MS);
    this.nextRetryAt = Date.now() + delay;
    this.phase = "reconnecting";
    this.detail = `\u8FDE\u63A5\u65AD\u5F00\uFF0C${(delay / 1e3).toFixed(0)}s \u540E\u7B2C ${this.ctlAttempt} \u6B21\u91CD\u8BD5 | retry #${this.ctlAttempt} in ${(delay / 1e3).toFixed(0)}s`;
    this._emit({ phase: "reconnecting", detail: this.detail, attempts: this.ctlAttempt, nextRetryAt: this.nextRetryAt });
    this.log(`relay: ${err.message ?? err}; retry in ${delay}ms`);
    clearTimeout(this.ctlTimer);
    this.ctlTimer = setTimeout(() => this._connectCtl(), delay);
    this.ctlTimer.unref?.();
  }
  // ---------- 数据连接池 ----------
  _scheduleDataConnect(delay) {
    if (this.stopped) return;
    this._spreadSeq = ((this._spreadSeq ?? 0) + 1) % 5;
    const spread = this._spreadSeq * 700;
    const t = setTimeout(() => {
      this.retryTimers.delete(t);
      this._connectData();
    }, delay + spread);
    t.unref?.();
    this.retryTimers.add(t);
  }
  _connectData() {
    if (this.stopped) return;
    if (this.dataInflight >= POOL_SIZE) return;
    this.dataInflight++;
    let ws;
    try {
      ws = new this.WS(`${this.base}/__relay/data`, { headers: { "x-relay-token": this.token } });
    } catch {
      this.dataInflight--;
      this.dataAttempt++;
      this._scheduleDataConnect(backoffMs(this.dataAttempt, DATA_BACKOFF_MAX_MS));
      return;
    }
    this.pool.add(ws);
    ws._opened = false;
    ws.on("open", () => {
      ws._opened = true;
      this.dataAttempt = 0;
      this.dataInflight--;
    });
    ws.on("message", (raw, isBinary) => {
      if (!isBinary) {
        let msg;
        try {
          msg = JSON.parse(String(raw));
        } catch {
          return;
        }
        if (typeof msg.bind === "number") {
          ws._consumed = true;
          this._connectData();
          this._bindLocal(ws, msg.bind);
        }
        return;
      }
      if (ws._local) {
        try {
          ws._local.write(raw);
        } catch {
        }
      } else {
        (ws._pending ??= []).push(raw);
      }
    });
    let dead = false;
    const drop = () => {
      if (dead) return;
      dead = true;
      this.pool.delete(ws);
      if (ws._local) {
        try {
          ws._local.destroy();
        } catch {
        }
        ws._local = null;
      }
      if (!ws._opened) this.dataInflight = Math.max(0, this.dataInflight - 1);
      if (this.stopped) return;
      if (ws._consumed) return;
      this.dataAttempt++;
      this._scheduleDataConnect(backoffMs(this.dataAttempt, DATA_BACKOFF_MAX_MS));
    };
    ws.on("close", () => drop());
    ws.on("error", () => drop());
  }
  /** 绑定帧到达：向本地代理发起 TCP 并开始搬运。 */
  _bindLocal(ws, connId) {
    this.connectTcp(this.proxyPort, (err, socket) => {
      if (err || !socket) {
        this.log(`relay: local proxy connect failed for conn #${connId}: ${err?.message ?? err}`);
        try {
          ws.close();
        } catch {
        }
        return;
      }
      ws._local = socket;
      if (ws._pending?.length) {
        for (const chunk of ws._pending) {
          try {
            socket.write(chunk);
          } catch {
          }
        }
        ws._pending = [];
      }
      socket.on("data", (chunk) => {
        if (ws.readyState === wrapper_default.OPEN) ws.send(chunk);
      });
      const teardown = () => {
        if (ws._local) {
          try {
            ws._local.destroy();
          } catch {
          }
          ws._local = null;
        }
        try {
          ws.close();
        } catch {
        }
      };
      socket.on("close", teardown);
      socket.on("error", teardown);
      ws.on("close", teardown);
    });
  }
};

// src/tunnel.mjs
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join as join4 } from "node:path";

// src/tunnels/frp.mjs
import { join as join2 } from "node:path";

// src/tunnels/resolve-bin.mjs
import { existsSync, accessSync, constants as fsConstants } from "node:fs";
import net2 from "node:net";
import { delimiter, isAbsolute, join, resolve as resolvePath } from "node:path";
import { homedir, platform } from "node:os";
function isExecutable(p) {
  try {
    accessSync(p, fsConstants.X_OK);
    return existsSync(p);
  } catch {
    return false;
  }
}
function resolveBin(name2, override = "") {
  const exeNames = platform() === "win32" ? [`${name2}.exe`, `${name2}.cmd`, `${name2}.bat`, name2] : [name2];
  const o = String(override ?? "").trim();
  if (o) {
    const p = resolvePath(o);
    if (existsSync(p) && isExecutable(p)) return { bin: p };
    return { bin: null, reason: `\u6307\u5B9A\u7684\u7A0B\u5E8F\u8DEF\u5F84\u4E0D\u5B58\u5728\u6216\u4E0D\u53EF\u6267\u884C\uFF1A${o} | overridden binary not found or not executable` };
  }
  const dirs = [
    ...(process.env.PATH ?? "").split(delimiter).filter(Boolean),
    join(homedir(), ".dsh", "dsh-relay", "bin")
    // 插件托管下载目录（预留）
  ];
  for (const dir of dirs) {
    for (const n of exeNames) {
      const p = isAbsolute(n) ? n : join(dir, n);
      if (existsSync(p) && isExecutable(p)) return { bin: p };
    }
  }
  return { bin: null, reason: `\u672A\u627E\u5230 ${name2}\uFF1A\u8BF7\u5B89\u88C5\u540E\u91CD\u8BD5\uFF0C\u6216\u5728\u8BBE\u7F6E\u91CC\u624B\u52A8\u586B\u5199\u5B8C\u6574\u8DEF\u5F84 | ${name2} not found in PATH; install it or set the full path in settings` };
}
function freeLoopbackPort() {
  return new Promise((res, rej) => {
    const srv = net2.createServer();
    srv.unref();
    srv.on("error", rej);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });
}

// src/tunnels/frp.mjs
var TOOL = "frpc";
function tomlStr(v) {
  return JSON.stringify(String(v ?? ""));
}
function buildFrpcToml({ config, localPort, adminPort, logFile }) {
  const c = config ?? {};
  const raw = String(c.rawToml ?? "").trim();
  if (raw) {
    if (!/serverAddr\s*=/.test(raw)) throw new Error("frpc.toml \u7F3A\u5C11 serverAddr | raw frpc.toml has no serverAddr");
    let t = raw;
    if (!/webServer\.port\s*=/.test(t)) {
      t += `
webServer.addr = "127.0.0.1"
webServer.port = ${adminPort}
`;
    }
    return t.endsWith("\n") ? t : `${t}
`;
  }
  const serverAddr = String(c.serverAddr ?? "").trim();
  if (!serverAddr) throw new Error("\u8BF7\u586B\u5199 frps \u670D\u52A1\u5668\u5730\u5740 | frps server address required");
  const token = String(c.token ?? "").trim();
  if (!token) throw new Error("\u8BF7\u586B\u5199 frps \u9274\u6743 token | frps auth token required");
  const type = ["tcp", "http", "https"].includes(c.proxyType) ? c.proxyType : "tcp";
  if (type !== "tcp" && !String(c.customDomain ?? "").trim() && !String(c.subdomain ?? "").trim()) {
    throw new Error("http/https \u5F62\u6001\u9700\u8981\u586B\u5199\u81EA\u5B9A\u4E49\u57DF\u540D\u6216\u5B50\u57DF\u540D | custom domain or subdomain required");
  }
  const lines = [
    `serverAddr = ${tomlStr(serverAddr)}`,
    `serverPort = ${Number(c.serverPort) > 0 ? Number(c.serverPort) : 7e3}`,
    `auth.token = ${tomlStr(token)}`,
    `loginFailExit = false`,
    `transport.tls.enable = ${c.tlsDisable === true ? "false" : "true"}`,
    `webServer.addr = "127.0.0.1"`,
    `webServer.port = ${adminPort}`,
    `log.to = ${tomlStr(logFile)}`,
    `log.level = "info"`,
    `log.maxDays = 3`,
    ``,
    `[[proxies]]`,
    `name = "dsh-relay"`,
    `type = "${type}"`,
    `localIP = "127.0.0.1"`,
    `localPort = ${localPort}`
  ];
  if (type === "tcp") {
    lines.push(`remotePort = ${Number(c.remotePort) > 0 ? Number(c.remotePort) : 0}`);
    if (c.useEncryption !== false) lines.push(`transport.useEncryption = true`);
  } else {
    const domain = String(c.customDomain ?? "").trim();
    const sub = String(c.subdomain ?? "").trim();
    if (domain) lines.push(`customDomains = [${tomlStr(domain)}]`);
    if (sub) lines.push(`subdomain = ${tomlStr(sub)}`);
  }
  return `${lines.join("\n")}
`;
}
function derivePublicUrl(config = {}) {
  const c = config;
  const raw = String(c.rawToml ?? "").trim();
  if (raw) return "";
  const addr = String(c.serverAddr ?? "").trim();
  const type = ["tcp", "http", "https"].includes(c.proxyType) ? c.proxyType : "tcp";
  if (type === "tcp") {
    const port = Number(c.remotePort) > 0 ? Number(c.remotePort) : 0;
    return addr && port ? `http://${addr}:${port}` : "";
  }
  const domain = String(c.customDomain ?? "").trim();
  if (!domain) return "";
  return type === "https" ? `https://${domain}` : `http://${domain}`;
}
var frp = {
  id: "frp",
  label: "frp",
  wantsAdminPort: true,
  docs: {
    zh: "\u590D\u7528\u4F60\uFF08\u6216\u670B\u53CB\uFF09\u5DF2\u6709\u7684 frp \u670D\u52A1\uFF1A\u586B frps \u5730\u5740\u3001\u7AEF\u53E3\u548C token \u5373\u53EF\u3002\u652F\u6301\u7EAF\u7AEF\u53E3\u6620\u5C04\uFF08\u6700\u901A\u7528\uFF09\u4E0E http/https \u57DF\u540D\u590D\u7528\uFF08\u9700 frps \u5F00 vhost \u7AEF\u53E3\uFF09\u3002\u4E5F\u53EF\u4EE5\u76F4\u63A5\u7C98\u8D34\u5B8C\u6574 frpc.toml\uFF08\u9AD8\u7EA7\uFF09\u3002",
    en: "Reuse an existing frp server: fill in the frps address, port and token. Supports plain TCP port mapping (most universal) and http/https vhost (requires vhost ports on frps). Or paste a full frpc.toml (advanced).",
    download: {
      zh: "frp \u5B98\u65B9\u4E0B\u8F7D\uFF08\u56FD\u5185\u6E90 gofrp.net\uFF0C\u5907\u7528 GitHub Releases\uFF09\uFF1A\u4E0B\u8F7D\u540E\u628A frpc \u653E\u8FDB PATH \u6216\u5728\u4E0B\u65B9\u586B\u5199\u5B8C\u6574\u8DEF\u5F84\u3002",
      en: "Download frp (gofrp.net mirror, or GitHub Releases), then put frpc on PATH or set the full path below."
    },
    downloadUrl: "https://gofrp.org/zh-cn/docs/download/"
  },
  resolveBin(config = {}) {
    return resolveBin(TOOL, config.binPath);
  },
  /** 纯函数：产出落盘文件与启动参数（不碰文件系统，便于单测）。 */
  launch({ config = {}, localPort, dir, adminPort }) {
    const toml = buildFrpcToml({ config, localPort, adminPort, logFile: join2(dir, "frpc.log") });
    return {
      args: ["-c", join2(dir, "frpc.toml")],
      env: null,
      files: [{ path: join2(dir, "frpc.toml"), content: toml }]
    };
  },
  /** 启动前预检：frpc verify 校验配置合法性（版本过老没有 verify 时跳过并提示）。 */
  async verify({ bin, files, spawnImpl }) {
    const toml = files?.find((f) => f.path.endsWith(".toml"));
    if (!toml) return { ok: true };
    return await new Promise((res) => {
      let out = "";
      let p;
      try {
        p = spawnImpl(bin, ["verify", "-c", toml.path], { timeout: 15e3 });
      } catch (err) {
        res({ ok: false, detail: `\u65E0\u6CD5\u6267\u884C frpc\uFF1A${err.message}` });
        return;
      }
      p.stdout?.on("data", (d) => {
        out += d;
      });
      p.stderr?.on("data", (d) => {
        out += d;
      });
      p.on("error", (err) => {
        res({ ok: true, note: `frpc verify \u4E0D\u53EF\u7528\uFF08${err.message}\uFF09\uFF0C\u8DF3\u8FC7\u9884\u68C0` });
      });
      p.on("exit", (code) => {
        if (code === 0) res({ ok: true });
        else res({ ok: false, detail: `frpc verify \u6821\u9A8C\u5931\u8D25\uFF1A${out.trim().slice(-400) || `exit ${code}`}` });
      });
    });
  },
  derivePublicUrl
};

// src/tunnels/cloudflared.mjs
var QUICK_URL_RE = /(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/i;
var cloudflared = {
  id: "cloudflared",
  label: "Cloudflare Tunnel",
  wantsAdminPort: false,
  docs: {
    zh: "\u65E0\u9700\u4EFB\u4F55\u670D\u52A1\u5668\u4E0E\u8D26\u53F7\uFF08quick \u6A21\u5F0F\uFF09\uFF1A\u542F\u52A8\u5373\u5F97\u4E00\u4E2A\u4E34\u65F6 HTTPS \u57DF\u540D\u3002\u9002\u5408\u300C\u5C31\u662F\u4E0D\u60F3\u90E8\u7F72\u300D\u7684\u573A\u666F\uFF1B\u7F3A\u70B9\u662F\u57DF\u540D\u968F\u673A\u3001\u56FD\u5185\u8FDE\u901A\u6027\u770B\u7F51\u7EDC\u73AF\u5883\u3002\u6709 Cloudflare \u8D26\u53F7\u53EF\u586B tunnel token \u83B7\u5F97\u56FA\u5B9A\u57DF\u540D\u3002",
    en: "No server, no account needed (quick mode): get a temporary HTTPS URL instantly. Fixed domain available with a Cloudflare tunnel token.",
    download: {
      zh: "\u4ECE Cloudflare \u5B98\u7F51\u4E0B\u8F7D cloudflared \u5355\u6587\u4EF6\u4E8C\u8FDB\u5236\uFF0C\u653E\u8FDB PATH \u6216\u5728\u4E0B\u65B9\u586B\u5199\u5B8C\u6574\u8DEF\u5F84\u3002",
      en: "Download the cloudflared binary from Cloudflare, put it on PATH or set the full path below."
    },
    downloadUrl: "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  },
  resolveBin(config = {}) {
    return resolveBin("cloudflared", config.binPath);
  },
  launch({ config = {}, localPort }) {
    const token = String(config.token ?? "").trim();
    if (token) {
      return {
        args: ["tunnel", "--no-autoupdate", "run"],
        env: { TUNNEL_TOKEN: token },
        files: []
      };
    }
    return {
      args: ["tunnel", "--no-autoupdate", "--url", `http://127.0.0.1:${localPort}`],
      env: null,
      files: []
    };
  },
  /** 从输出行提取 quick tunnel 域名。 */
  parseLine(line) {
    const m = QUICK_URL_RE.exec(String(line ?? ""));
    return m ? { publicUrl: m[1] } : null;
  },
  derivePublicUrl() {
    return "";
  }
  // 动态分配，只能从日志拿
};

// src/tunnels/natapp.mjs
var FWD_URL_RE = /(https?:\/\/[^\s"'<>]+)\s*->/;
var natapp = {
  id: "natapp",
  label: "natapp",
  wantsAdminPort: false,
  docs: {
    zh: "\u56FD\u5185\u7A7F\u900F\u670D\u52A1\uFF08 natapp.cn \uFF09\uFF1A\u6CE8\u518C\u540E\u5728\u540E\u53F0\u590D\u5236\u96A7\u9053 authtoken \u586B\u5165\u5373\u53EF\u3002\u514D\u8D39\u96A7\u9053\u9650 1Mbps \u5E26\u5BBD\u3001\u968F\u673A\u57DF\u540D\uFF1B\u4ED8\u8D39\u96A7\u9053\u66F4\u5FEB\u3001\u57DF\u540D\u56FA\u5B9A\u3002",
    en: "China-friendly tunnel service: paste the tunnel authtoken from natapp.cn. Free tunnels are 1Mbps with random domains.",
    download: {
      zh: "\u4ECE natapp.cn \u4E0B\u8F7D\u5BA2\u6237\u7AEF\uFF0C\u653E\u8FDB PATH \u6216\u5728\u4E0B\u65B9\u586B\u5199\u5B8C\u6574\u8DEF\u5F84\u3002",
      en: "Download the natapp client from natapp.cn, put it on PATH or set the full path below."
    },
    downloadUrl: "https://natapp.cn/#download"
  },
  resolveBin(config = {}) {
    return resolveBin("natapp", config.binPath);
  },
  launch({ config = {}, localPort }) {
    const token = String(config.authtoken ?? "").trim();
    if (!token) throw new Error("\u8BF7\u586B\u5199 natapp \u96A7\u9053 authtoken | natapp authtoken required");
    return {
      args: [`-authtoken=${token}`, "-log=stdout"],
      env: null,
      files: []
    };
  },
  parseLine(line) {
    const m = FWD_URL_RE.exec(String(line ?? ""));
    return m ? { publicUrl: m[1] } : null;
  },
  derivePublicUrl() {
    return "";
  }
};

// src/tunnels/custom.mjs
import { join as join3 } from "node:path";
function splitCommand(line) {
  const out = [];
  let cur = "";
  let has = false;
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === "\\" && q === '"' && i + 1 < line.length) {
        cur += line[++i];
        continue;
      }
      if (ch === q) {
        q = null;
        continue;
      }
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      q = ch;
      has = true;
      continue;
    }
    if (ch === "\\" && i + 1 < line.length) {
      cur += line[++i];
      has = true;
      continue;
    }
    if (ch === " " || ch === "	") {
      if (has || cur) {
        out.push(cur);
        cur = "";
        has = false;
      }
      continue;
    }
    cur += ch;
    has = true;
  }
  if (q) throw new Error("\u547D\u4EE4\u91CC\u7684\u5F15\u53F7\u6CA1\u6709\u95ED\u5408 | unclosed quote in command");
  if (has || cur) out.push(cur);
  return out;
}
var custom = {
  id: "custom",
  label: "Custom command",
  wantsAdminPort: false,
  docs: {
    zh: "\u4EFB\u4F55\u96A7\u9053\u5DE5\u5177\u90FD\u80FD\u63A5\uFF1A\u586B\u542F\u52A8\u547D\u4EE4\uFF08\u652F\u6301 {{port}} / {{configFile}} \u5360\u4F4D\u7B26\uFF09\uFF0C\u53EF\u9009\u914D\u7F6E\u6587\u4EF6\u6A21\u677F\u3002\u4F8B\uFF1Abore local {{port}} --to bore.pub\uFF1Brathole client.toml\uFF08\u914D\u7F6E\u6A21\u677F\u91CC\u5199 local_port = {{port}}\uFF09\u3002",
    en: "Bring any tunnel tool: provide the launch command (supports {{port}} / {{configFile}} placeholders) and an optional config file template.",
    download: {
      zh: "\u81EA\u884C\u51C6\u5907\u76EE\u6807\u5DE5\u5177\u7684\u4E8C\u8FDB\u5236\uFF0C\u547D\u4EE4\u91CC\u76F4\u63A5\u5199\u5B8C\u6574\u8DEF\u5F84\u6700\u7A33\u59A5\u3002",
      en: "Prepare the tool binary yourself; prefer the full path in the command."
    },
    downloadUrl: ""
  },
  /**
   * 命令首词即二进制：裸名走 PATH 解析，绝对/相对路径校验存在性。
   * config.binPath 覆盖首词。
   */
  resolveBin(config = {}) {
    const cmd = String(config.command ?? "").trim();
    if (!cmd) return { bin: null, reason: "\u8BF7\u586B\u5199\u542F\u52A8\u547D\u4EE4 | launch command required" };
    let words;
    try {
      words = splitCommand(cmd);
    } catch (err) {
      return { bin: null, reason: err.message };
    }
    if (!words.length) return { bin: null, reason: "\u542F\u52A8\u547D\u4EE4\u4E3A\u7A7A | empty command" };
    const bare = words[0];
    if (config.binPath) return resolveBin(bare, config.binPath);
    if (/[/\\]/.test(bare)) return resolveBin(bare, bare);
    return resolveBin(bare, "");
  },
  launch({ config = {}, localPort, dir }) {
    const cmd = String(config.command ?? "").trim();
    if (!cmd) throw new Error("\u8BF7\u586B\u5199\u542F\u52A8\u547D\u4EE4 | launch command required");
    let configFile = "";
    const files = [];
    const template = String(config.configTemplate ?? "");
    if (template.trim()) {
      const fileName = String(config.configFileName ?? "").trim() || "custom-config.txt";
      configFile = join3(dir, fileName.replace(/[^\w.-]+/g, "_"));
      files.push({ path: configFile, content: template.replaceAll("{{port}}", String(localPort)) });
    }
    const rendered = cmd.replaceAll("{{port}}", String(localPort)).replaceAll("{{configFile}}", configFile);
    const words = splitCommand(rendered);
    if (!words.length) throw new Error("\u542F\u52A8\u547D\u4EE4\u4E3A\u7A7A | empty command");
    return { args: words.slice(1), env: null, files };
  },
  parseLine() {
    return null;
  },
  derivePublicUrl(config = {}) {
    return String(config.publicUrl ?? "").trim();
  }
};

// src/tunnels/index.mjs
var ADAPTERS = { frp, cloudflared, natapp, custom };
function getAdapter(id) {
  return ADAPTERS[id] ?? null;
}
function listAdapters() {
  return Object.values(ADAPTERS);
}

// src/tunnel.mjs
var BACKOFF_BASE_MS = 1e3;
var BACKOFF_CAP_MS = 6e4;
var STABLE_RESET_MS = 6e4;
var KILL_GRACE_MS_DEFAULT = 5e3;
var LOG_LINES_MAX = 50;
function backoffMs2(attempt) {
  const raw = Math.min(BACKOFF_BASE_MS * 2 ** Math.max(0, attempt - 1), BACKOFF_CAP_MS);
  return Math.min(Math.floor(raw * (0.8 + Math.random() * 0.4)), BACKOFF_CAP_MS);
}
function createTunnelManager({ home, localPort, onChange = () => {
}, log = () => {
}, hooks = {} }) {
  const spawnImpl = hooks.spawnImpl ?? spawn;
  const killImpl = hooks.killImpl ?? defaultKill;
  const nowImpl = hooks.nowImpl ?? Date.now;
  const freePortImpl = hooks.freePortImpl ?? freeLoopbackPort;
  const killGraceMs = hooks.killGraceMs ?? KILL_GRACE_MS_DEFAULT;
  const logInfo = (...a) => (log.info ?? log.log).call(log, ...a);
  const logWarn = (...a) => {
    if (typeof log.warn === "function") log.warn(...a);
    else console.warn(...a);
  };
  function defaultKill(pid, sig) {
    try {
      process.kill(-pid, sig);
    } catch {
    }
  }
  let stopped = true;
  let adapter = null;
  let cfg = null;
  let bin = "";
  let child = null;
  let attempt = 0;
  let startedAt = 0;
  let retryTimer = null;
  let killTimer = null;
  let exiting = false;
  let outBuf = "";
  const logs = [];
  let snap = {
    phase: "idle",
    // idle | starting | running | backoff | error
    tool: "",
    detail: "",
    publicUrl: "",
    attempts: 0,
    nextRetryAt: null,
    pid: null,
    binPath: "",
    logs: []
  };
  function emit(patch) {
    snap = { ...snap, ...patch, logs: logs.slice(-8) };
    onChange({ ...snap });
  }
  function pushLog(line) {
    const t = String(line ?? "").replace(/\s+$/, "");
    if (!t) return;
    logs.push(t);
    if (logs.length > LOG_LINES_MAX) logs.shift();
    const found = adapter?.parseLine?.(t);
    if (found?.publicUrl && found.publicUrl !== snap.publicUrl) {
      emit({ publicUrl: found.publicUrl, detail: `\u5DF2\u83B7\u53D6\u516C\u7F51\u5730\u5740 ${found.publicUrl}` });
      logInfo(`dsh-relay: tunnel public url ${found.publicUrl}`);
    }
  }
  function onOutput(chunk) {
    outBuf += chunk;
    let idx;
    while ((idx = outBuf.indexOf("\n")) >= 0) {
      pushLog(outBuf.slice(0, idx));
      outBuf = outBuf.slice(idx + 1);
    }
    if (outBuf.length > 16 * 1024) {
      pushLog(outBuf);
      outBuf = "";
    }
  }
  function handleExit(why) {
    if (exiting) return;
    exiting = true;
    const c = child;
    child = null;
    if (killTimer) {
      clearTimeout(killTimer);
      killTimer = null;
    }
    if (stopped) {
      emit({ phase: "idle", pid: null, detail: "" });
      return;
    }
    if (nowImpl() - startedAt >= STABLE_RESET_MS) attempt = 0;
    attempt += 1;
    const delay = backoffMs2(attempt);
    const nextAt = nowImpl() + delay;
    const secs = Math.round(delay / 1e3);
    emit({
      phase: "backoff",
      pid: null,
      detail: `\u8FDB\u7A0B\u9000\u51FA\uFF08${why}\uFF09\uFF0C${secs}s \u540E\u7B2C ${attempt} \u6B21\u91CD\u542F | exited (${why}); restart #${attempt} in ${secs}s`,
      attempts: attempt,
      nextRetryAt: nextAt
    });
    logWarn(`dsh-relay: tunnel process exited (${why}); retry in ${delay}ms`);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void _start();
    }, delay);
    retryTimer.unref?.();
  }
  async function _start() {
    if (stopped) return;
    if (child) return;
    exiting = false;
    outBuf = "";
    const dir = join4(home, "dsh-relay", "tunnel", cfg.tool);
    try {
      mkdirSync(dir, { recursive: true });
    } catch (err) {
      stopped = true;
      emit({ phase: "error", detail: `\u65E0\u6CD5\u521B\u5EFA\u96A7\u9053\u5DE5\u4F5C\u76EE\u5F55\uFF1A${err.message}` });
      return;
    }
    const adminPort = adapter.wantsAdminPort ? await freePortImpl().catch(() => 0) : 0;
    let plan;
    try {
      plan = adapter.launch({ config: cfg.config, bin, localPort, dir, adminPort });
    } catch (err) {
      stopped = true;
      emit({ phase: "error", detail: err.message });
      return;
    }
    for (const f of plan.files ?? []) {
      try {
        writeFileSync(f.path, f.content, { mode: 384 });
      } catch (err) {
        stopped = true;
        emit({ phase: "error", detail: `\u65E0\u6CD5\u5199\u5165\u914D\u7F6E\u6587\u4EF6 ${f.path}\uFF1A${err.message}` });
        return;
      }
    }
    if (typeof adapter.verify === "function") {
      const v = await adapter.verify({ bin, files: plan.files, spawnImpl });
      if (v?.note) logInfo(`dsh-relay: ${v.note}`);
      if (v && v.ok === false) {
        stopped = true;
        emit({ phase: "error", detail: v.detail ?? "\u914D\u7F6E\u6821\u9A8C\u5931\u8D25 | config verification failed" });
        return;
      }
    }
    startedAt = nowImpl();
    let p;
    try {
      p = spawnImpl(bin, plan.args, {
        stdio: ["ignore", "pipe", "pipe"],
        ...plan.env ? { env: { ...process.env, ...plan.env } } : {},
        detached: process.platform !== "win32",
        windowsHide: true
      });
    } catch (err) {
      handleExit(`spawn: ${err.message}`);
      return;
    }
    child = p;
    emit({
      phase: "running",
      pid: p.pid,
      publicUrl: adapter.derivePublicUrl?.(cfg.config) || snap.publicUrl || "",
      detail: adapter.derivePublicUrl?.(cfg.config) ? `\u5DF2\u542F\u52A8 ${cfg.tool}` : "\u5DF2\u542F\u52A8\uFF0C\u7B49\u5F85\u516C\u7F51\u5730\u5740\u2026 | started, waiting for public url\u2026",
      binPath: bin
    });
    logInfo(`dsh-relay: tunnel ${cfg.tool} started (pid ${p.pid})`);
    p.stdout?.setEncoding?.("utf8");
    p.stderr?.setEncoding?.("utf8");
    p.stdout?.on("data", onOutput);
    p.stderr?.on("data", onOutput);
    p.on("exit", (code, signal) => handleExit(signal ? `signal ${signal}` : `code ${code}`));
    p.on("error", (err) => handleExit(err.message));
  }
  return {
    /**
     * 启动（幂等：同配置且在跑则直接返回）。配置错误会抛出（含未找到二进制）。
     * @param {{tool:string, binPath?:string, config?:object}} next
     */
    async start(next) {
      const ad = getAdapter(next?.tool);
      if (!ad) throw new Error(`\u672A\u77E5\u96A7\u9053\u5DE5\u5177 | unknown tunnel tool: ${next?.tool}`);
      const nextKey = JSON.stringify([next.tool, next.binPath ?? "", next.config ?? {}]);
      if (!stopped && child && adapter === ad && nextKey === this._cfgKey) return this.snapshot();
      this.stop();
      stopped = false;
      adapter = ad;
      cfg = { tool: next.tool, config: next.config ?? {} };
      this._cfgKey = nextKey;
      attempt = 0;
      logs.length = 0;
      emit({ phase: "starting", tool: next.tool, detail: "\u5B9A\u4F4D\u7A0B\u5E8F\u5E76\u51C6\u5907\u914D\u7F6E\u2026 | resolving binary\u2026", publicUrl: "", attempts: 0, nextRetryAt: null, pid: null });
      const rb = ad.resolveBin(cfg.config);
      if (!rb.bin) {
        stopped = true;
        emit({ phase: "error", detail: rb.reason, binPath: "" });
        throw new Error(rb.reason);
      }
      bin = rb.bin;
      emit({ binPath: bin });
      await this._start();
      return this.snapshot();
    },
    _start,
    /** 停止并收割进程组。 */
    stop() {
      stopped = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      const c = child;
      child = null;
      if (c) {
        const pid = c.pid;
        try {
          killImpl(pid, "SIGTERM");
        } catch {
          try {
            c.kill("SIGTERM");
          } catch {
          }
        }
        if (killTimer) clearTimeout(killTimer);
        killTimer = setTimeout(() => {
          killTimer = null;
          try {
            killImpl(pid, "SIGKILL");
          } catch {
            try {
              c.kill("SIGKILL");
            } catch {
            }
          }
        }, killGraceMs);
        killTimer.unref?.();
      }
      emit({ phase: "idle", pid: null, detail: "", publicUrl: "", attempts: 0, nextRetryAt: null });
    },
    dispose() {
      this.stop();
    },
    /** 探测各工具在本机的可用性（设置页工具选择用）。 */
    detect(currentConfig = {}) {
      return listAdapters().map((a) => {
        const binPath = a.id === currentConfig.tool ? String(currentConfig.binPath ?? "") : "";
        let r;
        try {
          r = a.resolveBin({ ...currentConfig.config, binPath });
        } catch {
          r = { bin: null, reason: "detect failed" };
        }
        return {
          id: a.id,
          label: a.label,
          available: Boolean(r.bin),
          binPath: r.bin ?? "",
          reason: r.bin ? "" : r.reason ?? "not found",
          docs: a.docs
        };
      });
    },
    snapshot() {
      return { ...snap, logs: [...snap.logs] };
    },
    get running() {
      return !stopped && Boolean(child);
    },
    _cfgKey: ""
  };
}

// src/service.mjs
function qrDataUrl(text, { width = 220, margin = 1 } = {}) {
  return import_qrcode.default.toDataURL(text, { errorCorrectionLevel: "M", margin, width, type: "image/png" });
}
var PRIVATE_RE2 = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1(?:0\d|1\d|2[0-7]))\.)/;
var PHYSICAL_RE = /^(?:wlan|wi-?fi|wireless|eth|en\d|wlp\d|以太网|有线|无线|本地连接)/i;
var VIRTUAL_RE = /(?:tailscale|zerotier|tun|tap|vpn|virtual|vmware|virtualbox|wsl|docker|vethernet|bridge)/i;
function selectLanIPv4(interfaces) {
  const cands = [];
  for (const [name2, addrs] of Object.entries(interfaces ?? {})) {
    for (const addr of addrs ?? []) {
      if (addr.family !== "IPv4" || addr.internal) continue;
      const ip = addr.address;
      if (!ip || ip.startsWith("127.") || ip.startsWith("169.254.")) continue;
      let score = 0;
      if (PRIVATE_RE2.test(ip)) score += 100;
      if (PHYSICAL_RE.test(name2)) score += 20;
      else if (VIRTUAL_RE.test(name2)) score -= 50;
      cands.push({ ip, score, order: cands.length });
    }
  }
  cands.sort((a, b) => b.score - a.score || a.order - b.order);
  return cands[0]?.ip ?? null;
}
function allLanCandidates() {
  const ips = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family !== "IPv4" || addr.internal) continue;
      const ip = addr.address;
      if (ip && !ip.startsWith("127.") && !ip.startsWith("169.254.") && !ips.includes(ip)) ips.push(ip);
    }
  }
  return ips;
}
function createRelayService({
  dshPort,
  port = 3082,
  home,
  hooks = {},
  getLanIpOverride = () => "",
  getLanEnabled = () => true,
  getLanAuthEnabled = () => true,
  getPins = () => ({ public: "", lan: "" }),
  isPinCustom = () => false,
  getRelayConfig = () => ({ url: "", token: "", enabled: false }),
  saveRelayConfig = null,
  // async ({ url, token }) => void：准入批准/密钥轮换时持久化
  // ---- 外接隧道模式 ----
  getTunnelConfig = () => ({ tool: "frp", binPath: "", config: {} }),
  getTunnelInletPort = () => 0,
  // 0 = 用默认 3083
  saveTunnelInletPort = null,
  // (actualPort) => void：注入口被占漂移后持久化实际值
  getAccessMode = () => "relay",
  // 'relay' | 'tunnel' | 'lan'
  setAccessMode: setAccessMode2 = null,
  // (mode) => void：启动/停止时同步持久化
  pluginVersion = "",
  onRelayReady = () => {
  },
  /** dsh web 浏览器会话启动 token（实时取，issue 平台契约：GET / 首次需 ?token= 换 cookie） */
  launchToken = () => "",
  log = console
} = {}) {
  const logInfo = (...a) => (log.info ?? log.log).call(log, ...a);
  const logWarn = (...a) => {
    if (typeof log.warn === "function") log.warn(...a);
    else console.warn(...a);
  };
  const createProxyFn = hooks.createProxy ?? createRelayProxy;
  const RelayClientCls = hooks.RelayClient ?? RelayClient;
  const qr = hooks.qrDataUrl ?? qrDataUrl;
  let proxy = null;
  let client = null;
  let tunnel = null;
  let relayState = { phase: "idle", detail: "", attempts: 0, nextRetryAt: null, server: null };
  let tunnelState = { phase: "idle", tool: "", detail: "", publicUrl: "", attempts: 0, nextRetryAt: null, pid: null, logs: [] };
  const qrCache = /* @__PURE__ */ new Map();
  let lanCache = null;
  const sessionKey = hooks.sessionKey ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const homeDir2 = home ?? process.env.DSH_HOME ?? join5(homedir2(), ".dsh");
  const autoMarkerPath = join5(homeDir2, "dsh-relay", "relay-auto.json");
  function persistAutoMarker() {
    try {
      mkdirSync2(dirname(autoMarkerPath), { recursive: true });
      writeFileSync2(autoMarkerPath, JSON.stringify({ at: Date.now() }), "utf8");
    } catch {
    }
  }
  function clearAutoMarker() {
    try {
      rmSync(autoMarkerPath, { force: true });
    } catch {
    }
  }
  async function qrCached(text) {
    if (!text) return null;
    if (!qrCache.has(text)) {
      if (qrCache.size >= 8) qrCache.delete(qrCache.keys().next().value);
      qrCache.set(text, qr(text).catch(() => null));
    }
    return qrCache.get(text);
  }
  function lanIp() {
    const override = String(getLanIpOverride() ?? "").trim();
    if (override) return override;
    const now = Date.now();
    if (!lanCache || now - lanCache.at > 15e3) {
      lanCache = { at: now, ip: selectLanIPv4(networkInterfaces()) };
    }
    return lanCache.ip;
  }
  const ENROLL_POLL_MS = 3e3;
  const ENROLL_TIMEOUT_MS = 10 * 6e4;
  let enroll = null;
  function collectIdentity() {
    const macs = [];
    const ips = [];
    for (const addrs of Object.values(networkInterfaces())) {
      for (const addr of addrs ?? []) {
        if (addr.mac && addr.mac !== "00:00:00:00:00:00" && !macs.includes(addr.mac)) macs.push(addr.mac);
        if (addr.family === "IPv4" && !addr.internal && !ips.includes(addr.address)) ips.push(addr.address);
      }
    }
    return {
      hostname: osHostname(),
      os: `${osPlatform()} ${osArch()}`,
      macs: macs.slice(0, 8),
      ips: ips.slice(0, 8),
      version: pluginVersion
    };
  }
  function enrollSetState(phase, detail) {
    if (enroll) {
      enroll.phase = phase;
      enroll.detail = detail ?? "";
    }
  }
  function enrollClear() {
    if (enroll?.timer) clearTimeout(enroll.timer);
    enroll = null;
  }
  async function enrollStart(serverUrl, code = "") {
    const httpBase = httpBaseFromServer(serverUrl);
    if (!httpBase) throw new Error("\u670D\u52A1\u7AEF\u5730\u5740\u65E0\u6548 | invalid server address");
    enrollClear();
    enroll = { phase: "submitting", serverUrl, requestId: null, detail: "\u6B63\u5728\u63D0\u4EA4\u7533\u8BF7\u2026", deadline: 0, timer: null };
    let res;
    try {
      res = await fetch(`${httpBase}/__relay/enroll`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, info: collectIdentity() }),
        signal: AbortSignal.timeout(1e4)
      });
    } catch (err) {
      enrollSetState("error", `\u65E0\u6CD5\u8FDE\u63A5\u670D\u52A1\u7AEF\uFF1A${err?.cause?.message ?? err?.message ?? err}`);
      return;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) {
      const msgs = { "bad-code": "\u9080\u8BF7\u7801\u9519\u8BEF", "rate-limited": "\u5C1D\u8BD5\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5", "pending-full": "\u670D\u52A1\u7AEF\u5F85\u5BA1\u6279\u961F\u5217\u5DF2\u6EE1", "bad-identity": "\u7533\u8BF7\u88AB\u62D2\u7EDD" };
      enrollSetState("error", msgs[body.error] ?? `\u7533\u8BF7\u5931\u8D25\uFF08${res.status}\uFF09`);
      return;
    }
    enroll.requestId = body.requestId;
    enroll.deadline = Date.now() + ENROLL_TIMEOUT_MS;
    enrollSetState("pending", "\u7533\u8BF7\u5DF2\u63D0\u4EA4\uFF0C\u7B49\u5F85\u7BA1\u7406\u5458\u5728\u670D\u52A1\u7AEF\u7BA1\u7406\u53F0\u6279\u51C6\u2026\uFF0810 \u5206\u949F\u5185\u6709\u6548\uFF09");
    enrollPoll();
  }
  function enrollPoll() {
    if (!enroll || enroll.phase !== "pending") return;
    if (Date.now() > enroll.deadline) {
      enrollSetState("expired", "\u7533\u8BF7\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u63D0\u4EA4");
      return;
    }
    const tick = async () => {
      if (!enroll || enroll.phase !== "pending") return;
      let body;
      try {
        const httpBase = httpBaseFromServer(enroll.serverUrl);
        const res = await fetch(`${httpBase}/__relay/enroll/poll`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ requestId: enroll.requestId }),
          signal: AbortSignal.timeout(8e3)
        });
        body = await res.json().catch(() => ({}));
      } catch {
        body = null;
      }
      if (!enroll || enroll.phase !== "pending") return;
      const status = body?.status;
      if (status === "pending") {
        enroll.timer = setTimeout(enrollPoll, ENROLL_POLL_MS);
        enroll.timer.unref?.();
        return;
      }
      if (status === "approved" && body.token?.length >= 16) {
        const serverUrl = enroll.serverUrl;
        enrollClear();
        enroll = { phase: "approved", serverUrl, requestId: null, detail: "\u5DF2\u6279\u51C6\uFF0C\u6B63\u5728\u5EFA\u7ACB\u96A7\u9053\u2026", deadline: 0, timer: null };
        try {
          if (!saveRelayConfig) throw new Error("\u65E0\u6CD5\u4FDD\u5B58\u914D\u7F6E");
          await saveRelayConfig({ url: serverUrl, token: body.token });
          await api.startRelay();
          enrollSetState("done", "\u63A5\u5165\u6210\u529F\uFF01\u96A7\u9053\u5DF2\u5EFA\u7ACB");
        } catch (err) {
          enrollSetState("error", `\u63A5\u5165\u6210\u529F\u4F46\u542F\u52A8\u5931\u8D25\uFF1A${err?.message ?? err}`);
        }
        return;
      }
      if (status === "denied") {
        enrollSetState("denied", "\u7BA1\u7406\u5458\u62D2\u7EDD\u4E86\u8FD9\u6B21\u7533\u8BF7");
        return;
      }
      if (status === "expired") {
        enrollSetState("expired", "\u7533\u8BF7\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u63D0\u4EA4");
        return;
      }
      enroll.timer = setTimeout(enrollPoll, ENROLL_POLL_MS);
      enroll.timer.unref?.();
    };
    tick();
  }
  const api = {
    dshPort,
    /** 启动本地代理（幂等）。端口被占自动 +1 重试；同时拉起稳定隧道注入口。 */
    async startProxy() {
      if (proxy) return proxy;
      let lastErr = null;
      for (let p = port; p < port + 10; p++) {
        try {
          proxy = await createProxyFn({
            port: p,
            host: "0.0.0.0",
            upstream: { host: "127.0.0.1", port: dshPort },
            auth: {
              sessionKey,
              getPin: (kind) => getPins()[kind] ?? "",
              isProtected: (kind) => kind === "public" ? true : getLanAuthEnabled()
            },
            lanAccessEnabled: () => getLanEnabled(),
            launchToken,
            tunnelPort: getTunnelInletPort() || 3083
          });
          if (p !== port) logInfo(`dsh-relay: port ${port} busy, proxy on ${p} | \u7AEF\u53E3\u88AB\u5360\uFF0C\u6539\u7528 ${p}`);
          if (proxy.tunnelPort && proxy.tunnelPort !== (getTunnelInletPort() || 3083)) {
            logInfo(`dsh-relay: tunnel inlet drifted to ${proxy.tunnelPort} | \u96A7\u9053\u6CE8\u5165\u53E3\u88AB\u5360\uFF0C\u6539\u7528 ${proxy.tunnelPort}`);
            try {
              saveTunnelInletPort?.(proxy.tunnelPort);
            } catch {
            }
          }
          return proxy;
        } catch (err) {
          if (err?.code !== "EADDRINUSE") throw err;
          lastErr = err;
        }
      }
      throw lastErr ?? new Error("proxy start failed");
    },
    /** 开启中继（幂等）。中继与外接隧道互斥：开中继先停隧道。 */
    async startRelay() {
      const cfg = getRelayConfig();
      if (!cfg.url || !cfg.token) {
        throw new Error("\u8BF7\u5148\u5728\u8BBE\u7F6E\u91CC\u586B\u5199\u670D\u52A1\u7AEF\u5730\u5740\u548C\u5BC6\u94A5\u4E32 | set the relay server address and secret first");
      }
      const p = await this.startProxy();
      if (client?.running) {
        this._markMode("relay");
        return publicUrlFromServer(cfg.url);
      }
      this.stopTunnel({ keepMarker: true });
      client = new RelayClientCls({
        serverUrl: cfg.url,
        token: cfg.token,
        proxyPort: p.inletPort ?? p.port,
        identity: collectIdentity(),
        onRotate: (token) => {
          try {
            saveRelayConfig?.({ url: cfg.url, token });
          } catch (err) {
            logWarn(`dsh-relay: persist rotated token failed: ${err?.message ?? err}`);
          }
        },
        log: logInfo,
        onChange: (snap) => {
          relayState = snap;
          if (snap.phase === "ready") onRelayReady();
        },
        ...hooks.relayHooks ? { hooks: hooks.relayHooks } : {}
      });
      client.start();
      persistAutoMarker();
      this._markMode("relay");
      return publicUrlFromServer(cfg.url);
    },
    stopRelay({ keepMarker = false } = {}) {
      client?.stop();
      client = null;
      relayState = { phase: "idle", detail: "", attempts: 0, nextRetryAt: null, server: null };
      const wasActiveMode = getAccessMode() === "relay";
      if (!keepMarker) {
        if (wasActiveMode) {
          clearAutoMarker();
          this._markMode("lan");
        } else if (!tunnel?.running) clearAutoMarker();
      }
    },
    // ---------- 外接隧道（frp / cloudflared / natapp / 自定义） ----------
    _markMode(mode) {
      try {
        setAccessMode2?.(mode);
      } catch (err) {
        logWarn(`dsh-relay: persist access mode failed: ${err?.message ?? err}`);
      }
    },
    /** 开启外接隧道（幂等）。与中继互斥：开隧道先停中继。 */
    async startTunnel() {
      const p = await this.startProxy();
      if (!p.tunnelPort) throw new Error("\u96A7\u9053\u6CE8\u5165\u53E3\u672A\u542F\u52A8 | tunnel inlet not available");
      const cfg = getTunnelConfig();
      this.stopRelay({ keepMarker: true });
      if (!tunnel) {
        tunnel = createTunnelManager({
          home: homeDir2,
          localPort: p.tunnelPort,
          log: { info: logInfo, warn: logWarn },
          onChange: (snap) => {
            tunnelState = snap;
          },
          ...hooks.tunnelHooks ? { hooks: hooks.tunnelHooks } : {}
        });
      }
      await tunnel.start(cfg);
      persistAutoMarker();
      this._markMode("tunnel");
      return tunnel.snapshot();
    },
    stopTunnel({ keepMarker = false } = {}) {
      tunnel?.stop();
      tunnelState = { phase: "idle", tool: "", detail: "", publicUrl: "", attempts: 0, nextRetryAt: null, pid: null, logs: [] };
      const wasActiveMode = getAccessMode() === "tunnel";
      if (!keepMarker) {
        if (wasActiveMode) {
          clearAutoMarker();
          this._markMode("lan");
        } else if (!client?.running) clearAutoMarker();
      }
    },
    tunnelDetect() {
      const cfg = getTunnelConfig();
      if (!tunnel) {
        tunnel = createTunnelManager({
          home: homeDir2,
          localPort: 0,
          log: { info: () => {
          }, warn: () => {
          } },
          onChange: (snap) => {
            tunnelState = snap;
          },
          ...hooks.tunnelHooks ? { hooks: hooks.tunnelHooks } : {}
        });
      }
      return tunnel.detect(cfg);
    },
    /** 客户端主动申请接入服务端（准入审批流）。 */
    async enroll(serverUrl, code = "") {
      return enrollStart(serverUrl, code);
    },
    enrollCancel() {
      enrollClear();
    },
    enrollState() {
      return enroll ? { phase: enroll.phase, detail: enroll.detail, serverUrl: enroll.serverUrl } : { phase: "idle", detail: "" };
    },
    /** 重启后自动恢复：按持久化的接入方式（mode）重新拉起；无标记则不动。 */
    async restoreIfNeeded() {
      try {
        readFileSync(autoMarkerPath, "utf8");
      } catch {
        return false;
      }
      const mode = getAccessMode();
      try {
        if (mode === "tunnel") {
          await this.startTunnel();
          logInfo("dsh-relay: tunnel auto-restored | \u5DF2\u81EA\u52A8\u6062\u590D\u5916\u63A5\u96A7\u9053");
          return true;
        }
        if (mode === "relay") {
          const cfg = getRelayConfig();
          if (!cfg.url || !cfg.token) return false;
          await this.startRelay();
          logInfo("dsh-relay: relay auto-restored | \u5DF2\u81EA\u52A8\u6062\u590D\u4E2D\u7EE7");
          return true;
        }
        return false;
      } catch (err) {
        logWarn(`dsh-relay: auto-restore failed | \u81EA\u52A8\u6062\u590D\u5931\u8D25: ${err?.message ?? err}`);
        return false;
      }
    },
    async status() {
      const p = await this.startProxy();
      const lan = lanIp();
      const lanUrl = lan ? `http://${lan}:${p.port}` : null;
      const cfg = getRelayConfig();
      const publicUrl = client?.running ? publicUrlFromServer(cfg.url) : "";
      const tSnap = tunnel?.snapshot() ?? tunnelState;
      const tunnelUrl = tSnap.publicUrl || "";
      const tcfg = getTunnelConfig();
      return {
        proxyRunning: true,
        proxyPort: p.port,
        tunnelInletPort: p.tunnelPort ?? null,
        dshPort,
        mode: getAccessMode(),
        lanUrl,
        lanQr: await qrCached(lanUrl),
        lanCandidates: allLanCandidates(),
        lanIpOverride: String(getLanIpOverride() ?? ""),
        lanAuthEnabled: getLanAuthEnabled(),
        lanEnabled: getLanEnabled(),
        relayRunning: Boolean(client?.running),
        relayUrl: publicUrl || null,
        relayQr: publicUrl ? await qrCached(publicUrl) : null,
        relayState,
        relayConfig: { url: cfg.url, tokenSet: Boolean(cfg.token) },
        tunnelRunning: Boolean(tunnel?.running),
        tunnelUrl: tunnelUrl || null,
        tunnelQr: tunnelUrl ? await qrCached(tunnelUrl) : null,
        tunnelState: tSnap,
        tunnelConfig: { tool: tcfg.tool, binPath: tcfg.binPath, config: tcfg.config },
        enroll: enroll ? { phase: enroll.phase, detail: enroll.detail, serverUrl: enroll.serverUrl } : { phase: "idle", detail: "" }
      };
    },
    async dispose() {
      this.stopRelay({ keepMarker: true });
      this.stopTunnel({ keepMarker: true });
      enrollClear();
      if (proxy) {
        const p = proxy;
        proxy = null;
        try {
          await p.close();
        } catch {
        }
      }
    }
  };
  return api;
}

// src/rpc.mjs
var LOOPBACK = /* @__PURE__ */ new Set(["127.0.0.1", "localhost", "::1"]);
var BODY_MAX = 8 * 1024 * 1024;
var SEGMENT_RE = /^[A-Za-z0-9_$.-]+$/;
function fail(message) {
  return { ok: false, error: { code: "bad-request", message, details: { issues: [{ message }] } } };
}
function endpointFromPath(channel, pathname) {
  if (!pathname.startsWith(`${channel}/`)) return void 0;
  const endpoint = pathname.slice(channel.length + 1);
  if (endpoint.split("/").some((seg) => seg === "" || seg === "." || seg === ".." || !SEGMENT_RE.test(seg))) return void 0;
  return endpoint;
}
function trustedLoopback(req) {
  const host = String(req.headers?.host ?? "");
  if (!LOOPBACK.has(host.split(":")[0])) return false;
  if (req.headers["sec-fetch-site"] === "cross-site") return false;
  const origin = req.headers.origin;
  if (origin === void 0) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
function installRpc(ctx, { channel, handler, log = console }) {
  const webServer = ctx?.webServer;
  if (!webServer || typeof webServer.register !== "function") {
    log.warn?.("dsh-relay: webServer unavailable \u2014 settings page disabled | \u65E0 webServer\uFF0C\u8BBE\u7F6E\u9875\u4E0D\u53EF\u7528");
    return () => {
    };
  }
  async function bridge(req, res) {
    const abort = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) abort.abort();
    });
    const declared = Number(req.headers["content-length"] ?? 0);
    if (declared > BODY_MAX) {
      res.writeHead(413).end();
      req.destroy();
      return;
    }
    const chunks = [];
    let received = 0;
    for await (const chunk of req) {
      received += chunk.length;
      if (received > BODY_MAX) {
        res.writeHead(413).end();
        req.destroy();
        return;
      }
      chunks.push(chunk);
    }
    let result;
    const url = `http://${req.headers.host ?? "127.0.0.1"}${req.url}`;
    try {
      const mediaType = String(req.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
      const endpoint = endpointFromPath(channel, new URL(req.url, "http://x").pathname);
      if (req.method !== "POST" || endpoint === void 0) {
        res.writeHead(404).end("not found");
        return;
      }
      if (mediaType !== "application/json") {
        res.writeHead(415).end("content type must be application/json");
        return;
      }
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      } catch {
        res.writeHead(400).end("body is not JSON");
        return;
      }
      const rpcId = typeof body?.rpcId === "string" ? body.rpcId : "invalid-request";
      const method = typeof body?.method === "string" ? body.method : null;
      if (rpcId === "invalid-request" || method === null || method !== endpoint) {
        result = { ok: false, error: { code: "bad-request", message: "invalid client-request", details: { issues: [] } } };
      } else {
        try {
          result = await handler(endpoint, body.payload ?? {}, abort.signal);
        } catch (err) {
          log.error?.("dsh-relay: rpc %s failed | RPC \u5931\u8D25: %s", endpoint, err?.message ?? err);
          result = fail(err?.message ?? String(err));
        }
      }
      const payload = JSON.stringify({ type: "server-response", rpcId, result });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(payload);
    } catch (err) {
      try {
        res.writeHead(500).end(`handler failure: ${String(err)}`);
      } catch {
      }
    }
  }
  const route = {
    kind: "prefix",
    path: channel,
    handler: async (req, res) => {
      let rejection;
      const connection = ctx?.connection;
      if (typeof connection?.requestRejection === "function") {
        try {
          rejection = connection.requestRejection(req);
        } catch {
          rejection = 403;
        }
      } else if (!trustedLoopback(req)) {
        rejection = 403;
      }
      if (rejection !== void 0) {
        res.writeHead(rejection, { "content-type": "text/plain; charset=utf-8" });
        res.end(rejection === 401 ? "unauthorized" : "forbidden");
        return;
      }
      await bridge(req, res);
    }
  };
  const registered = webServer.register(route);
  if (typeof registered === "function") return () => {
    try {
      registered();
    } catch {
    }
  };
  if (registered && typeof registered.then === "function") {
    return async () => {
      try {
        const d = await registered;
        if (typeof d === "function") d();
      } catch {
      }
    };
  }
  return () => {
  };
}

// src/settings.mjs
import { readFileSync as readFileSync2, writeFileSync as writeFileSync3, mkdirSync as mkdirSync3, rmSync as rmSync2 } from "node:fs";
import { join as join6, dirname as dirname2 } from "node:path";
import { homedir as homedir3 } from "node:os";

// src/ip.mjs
function isValidIpv4(value) {
  const v = String(value ?? "").trim();
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v);
  if (!m) return false;
  return m.slice(1).every((seg) => Number(seg) <= 255);
}

// src/settings.mjs
var SETTINGS_REL = join6("dsh-relay", "settings.json");
function settingsPath() {
  return join6(process.env.DSH_HOME ?? join6(homedir3(), ".dsh"), SETTINGS_REL);
}
function read() {
  try {
    const raw = JSON.parse(readFileSync2(settingsPath(), "utf8"));
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}
function write(s) {
  try {
    mkdirSync3(dirname2(settingsPath()), { recursive: true });
    writeFileSync3(settingsPath(), JSON.stringify(s, null, 2), { mode: 384 });
  } catch {
  }
  return s;
}
var lanEnabled = () => read().lanEnabled !== false;
function setLanEnabled(on) {
  const s = read();
  s.lanEnabled = !!on;
  write(s);
  return s.lanEnabled;
}
var lanAuthEnabled = () => read().lanAuthEnabled !== false;
function setLanAuthEnabled(on) {
  const s = read();
  s.lanAuthEnabled = !!on;
  write(s);
  return s.lanAuthEnabled;
}
var lanIpOverride = () => read().lanIpOverride ?? "";
function setLanIpOverride(value) {
  const ip = String(value ?? "").trim();
  if (ip && !isValidIpv4(ip)) throw new Error("\u5C40\u57DF\u7F51\u5730\u5740\u5FC5\u987B\u662F IPv4 | LAN address must be an IPv4");
  const s = read();
  if (ip) s.lanIpOverride = ip;
  else delete s.lanIpOverride;
  write(s);
  return ip;
}
var PIN_KEYS = { public: "publicPinCustom", lan: "lanPinCustom" };
function pinCustom(which) {
  return PIN_KEYS[which] ? read()[PIN_KEYS[which]] === true : false;
}
function setPinCustom(which, on) {
  const key = PIN_KEYS[which];
  if (!key) return false;
  const s = read();
  s[key] = !!on;
  write(s);
  return !!on;
}
var relayEnabled = () => read().relayEnabled === true;
function setRelayEnabled(on) {
  const s = read();
  s.relayEnabled = !!on;
  write(s);
  return s.relayEnabled;
}
var relayUrl = () => read().relayUrl ?? "";
function setRelayUrl(value) {
  const s = read();
  const v = String(value ?? "").trim();
  if (v) s.relayUrl = v;
  else delete s.relayUrl;
  write(s);
  return v;
}
var relayToken = () => {
  const v = read().relayToken;
  return typeof v === "string" ? v : "";
};
function setRelayToken(value) {
  const v = String(value ?? "").trim();
  if (v && v.length < 16) {
    throw new Error("token \u592A\u77ED\uFF08\u81F3\u5C11 16 \u5B57\u7B26\uFF0C\u5EFA\u8BAE openssl rand -hex 24 \u751F\u6210\uFF09 | token too short (min 16 chars)");
  }
  const s = read();
  if (v) s.relayToken = v;
  else delete s.relayToken;
  write(s);
  return v;
}
function proxyPort() {
  const v = Number(read().proxyPort);
  return Number.isInteger(v) && v >= 1 && v <= 65535 ? v : 0;
}
var MODES = /* @__PURE__ */ new Set(["relay", "tunnel", "lan"]);
function accessMode() {
  const s = read();
  if (MODES.has(s.mode)) return s.mode;
  return s.relayEnabled === true ? "relay" : "lan";
}
function setAccessMode(mode) {
  if (!MODES.has(mode)) throw new Error(`\u672A\u77E5\u63A5\u5165\u65B9\u5F0F | unknown access mode: ${mode}`);
  const s = read();
  s.mode = mode;
  s.relayEnabled = mode === "relay";
  write(s);
  return mode;
}
var TOOLS = /* @__PURE__ */ new Set(["frp", "cloudflared", "natapp", "custom"]);
function tunnelConfig() {
  const t = read().tunnel;
  if (!t || typeof t !== "object") return { tool: "frp", binPath: "", config: {} };
  return {
    tool: TOOLS.has(t.tool) ? t.tool : "frp",
    binPath: typeof t.binPath === "string" ? t.binPath : "",
    config: t.config && typeof t.config === "object" ? t.config : {}
  };
}
function setTunnelConfig({ tool, binPath, config } = {}) {
  if (tool !== void 0 && !TOOLS.has(tool)) throw new Error(`\u672A\u77E5\u96A7\u9053\u5DE5\u5177 | unknown tunnel tool: ${tool}`);
  const cur = tunnelConfig();
  const s = read();
  const next = {
    tool: tool ?? cur.tool,
    binPath: binPath !== void 0 ? String(binPath ?? "").trim() : cur.binPath,
    config: { ...cur.config, ...config && typeof config === "object" ? config : {} }
  };
  for (const [k, v] of Object.entries(next.config)) if (v === null) delete next.config[k];
  s.tunnel = next;
  write(s);
  return next;
}
function tunnelInletPort() {
  const v = Number(read().tunnelInletPort);
  return Number.isInteger(v) && v >= 1 && v <= 65535 ? v : 0;
}
function setTunnelInletPort(value) {
  const n = Number(value);
  const s = read();
  if (Number.isInteger(n) && n >= 1 && n <= 65535) s.tunnelInletPort = n;
  else delete s.tunnelInletPort;
  write(s);
  return tunnelInletPort();
}
function resetSettings() {
  try {
    rmSync2(settingsPath(), { force: true });
    return true;
  } catch {
    return false;
  }
}

// src/index.js
var name = "dsh-relay";
var inject = ["connection", "webServer"];
var PIN_RE = /^[a-zA-Z0-9]{8}$/;
function homeDir() {
  return process.env.DSH_HOME ?? join7(homedir4(), ".dsh");
}
function pinPath(kind) {
  return join7(homeDir(), "dsh-relay", kind === "public" ? "token" : "token-lan");
}
function readPin(kind) {
  try {
    const v = readFileSync3(pinPath(kind), "utf8").trim();
    if (PIN_RE.test(v)) return v;
  } catch {
  }
  return null;
}
function writePin(kind, value) {
  try {
    mkdirSync4(dirname3(pinPath(kind)), { recursive: true });
    writeFileSync4(pinPath(kind), value, { mode: 384 });
  } catch {
  }
  return value;
}
function getPin(kind) {
  return readPin(kind) ?? writePin(kind, String(randomInt2(1e7, 1e8)));
}
function setCustomPin(kind, value) {
  const v = String(value ?? "").trim();
  if (!PIN_RE.test(v)) throw new Error("\u5BC6\u7801\u5FC5\u987B\u662F 8 \u4F4D\u82F1\u6587\u5B57\u6BCD\u6216\u6570\u5B57 | PIN must be exactly 8 letters/digits");
  writePin(kind, v);
  setPinCustom(kind, true);
  return v;
}
function resetPins() {
  writePin("public", String(randomInt2(1e7, 1e8)));
  writePin("lan", String(randomInt2(1e7, 1e8)));
  setPinCustom("public", false);
  setPinCustom("lan", false);
  return { public: getPin("public"), lan: getPin("lan") };
}
function apply(ctx, config = {}, internals = {}) {
  const logger = ctx.logger?.(name) ?? console;
  const dshPort = internals.dshPort ?? ctx.webServer?.port;
  if (!dshPort) {
    logger.error("dsh-relay: webServer port unavailable | \u62FF\u4E0D\u5230 dsh web \u7AEF\u53E3\uFF0C\u63D2\u4EF6\u65E0\u6CD5\u5DE5\u4F5C");
    return () => {
    };
  }
  const service = internals.service ?? createRelayService({
    dshPort,
    port: internals.port ?? config.port ?? (proxyPort() || 3082),
    home: internals.home,
    hooks: internals.hooks ?? {},
    getLanIpOverride: () => lanIpOverride(),
    getLanEnabled: () => lanEnabled(),
    getLanAuthEnabled: () => lanAuthEnabled(),
    getPins: () => ({ public: getPin("public"), lan: getPin("lan") }),
    isPinCustom: (kind) => pinCustom(kind),
    getRelayConfig: () => ({ url: relayUrl(), token: relayToken(), enabled: relayEnabled() }),
    saveRelayConfig: async ({ url, token }) => {
      if (url !== void 0 && url !== "") setRelayUrl(url);
      if (token !== void 0 && token !== "") setRelayToken(token);
      setRelayEnabled(true);
    },
    // ---- 外接隧道 ----
    getTunnelConfig: () => tunnelConfig(),
    getTunnelInletPort: () => tunnelInletPort(),
    saveTunnelInletPort: (p) => {
      setTunnelInletPort(p);
    },
    getAccessMode: () => accessMode(),
    setAccessMode: (mode) => {
      setAccessMode(mode);
    },
    pluginVersion: (() => {
      try {
        return JSON.parse(readFileSync3(new URL("../package.json", import.meta.url), "utf8")).version;
      } catch {
        return "";
      }
    })(),
    onRelayReady: () => {
      logger.info("dsh-relay: relay ready | \u4E2D\u7EE7\u5DF2\u5C31\u7EEA");
    },
    // dsh web 浏览器会话启动 token：新版 dsh 要求根路径带一次 ?token= 换会话 cookie。
    // token 每次进程启动都变，必须实时从 connection 服务取（方法形式调用，勿丢 this）。
    launchToken: internals.launchToken ?? (() => {
      try {
        const fn = ctx.connection?.authenticatedUrl;
        if (typeof fn !== "function") return "";
        const url = new URL(fn.call(ctx.connection, `http://127.0.0.1:${dshPort}`));
        return url.searchParams.get("token") ?? "";
      } catch {
        return "";
      }
    }),
    log: logger
  });
  const handler = async (endpoint, payload) => {
    const statusPayload = async () => {
      const s = await service.status();
      return ok({
        ...s,
        accessToken: getPin("public"),
        lanToken: getPin("lan"),
        publicPinCustom: pinCustom("public"),
        lanPinCustom: pinCustom("lan")
      });
    };
    switch (endpoint) {
      case "relay.status":
        return await statusPayload();
      case "relay.start": {
        if (payload?.confirm !== true) {
          return fail2("\u5F00\u542F\u524D\u8BF7\u786E\u8BA4\u5B89\u5168\u63D0\u793A | please confirm the security notice first");
        }
        try {
          await service.startRelay();
          setRelayEnabled(true);
        } catch (err) {
          return fail2(err?.message ?? String(err));
        }
        return await statusPayload();
      }
      case "relay.stop":
        service.stopRelay();
        setRelayEnabled(false);
        return await statusPayload();
      case "relay.setConfig": {
        try {
          if (payload?.url !== void 0) setRelayUrl(payload.url);
          if (payload?.token !== void 0 && payload.token !== "") setRelayToken(payload.token);
        } catch (err) {
          return fail2(err?.message ?? String(err));
        }
        return await statusPayload();
      }
      case "relay.enroll": {
        const url = String(payload?.url ?? "").trim();
        if (!url) return fail2("\u8BF7\u586B\u5199\u670D\u52A1\u7AEF\u5730\u5740 | server address required");
        try {
          void service.enroll(url, String(payload?.code ?? ""));
        } catch (err) {
          return fail2(err?.message ?? String(err));
        }
        return await statusPayload();
      }
      case "relay.enroll.cancel":
        service.enrollCancel();
        return await statusPayload();
      // ---- 外接隧道 ----
      case "tunnel.status":
        return await statusPayload();
      case "tunnel.detect":
        return ok({ tools: service.tunnelDetect() });
      case "tunnel.setConfig": {
        try {
          setTunnelConfig({
            ...payload?.tool !== void 0 ? { tool: payload.tool } : {},
            ...payload?.binPath !== void 0 ? { binPath: payload.binPath } : {},
            ...payload?.config !== void 0 ? { config: payload.config } : {}
          });
        } catch (err) {
          return fail2(err?.message ?? String(err));
        }
        return await statusPayload();
      }
      case "tunnel.start": {
        if (payload?.confirm !== true) {
          return fail2("\u5F00\u542F\u524D\u8BF7\u786E\u8BA4\u5B89\u5168\u63D0\u793A | please confirm the security notice first");
        }
        try {
          await service.startTunnel();
        } catch (err) {
          return fail2(err?.message ?? String(err));
        }
        return await statusPayload();
      }
      case "tunnel.stop":
        service.stopTunnel();
        return await statusPayload();
      case "lan.setEnabled":
        setLanEnabled(payload?.on === true);
        return await statusPayload();
      case "lanAuth.setEnabled":
        setLanAuthEnabled(payload?.on === true);
        return await statusPayload();
      case "lan.setOverride":
        try {
          setLanIpOverride(payload?.ip ?? "");
        } catch (err) {
          return fail2(err?.message ?? String(err));
        }
        return await statusPayload();
      case "pin.setCustom": {
        const which = payload?.which === "public" || payload?.which === "lan" ? payload.which : null;
        if (!which) return fail2("\u672A\u77E5\u5BC6\u7801\u7C7B\u578B | unknown PIN kind");
        try {
          setCustomPin(which, payload?.value);
        } catch (err) {
          return fail2(err?.message ?? String(err));
        }
        return await statusPayload();
      }
      case "relay.reset": {
        if (payload?.confirm !== true) return fail2("\u6062\u590D\u51FA\u5382\u9700\u8981\u786E\u8BA4 | reset requires confirmation");
        service.stopRelay();
        service.stopTunnel();
        resetSettings();
        const pins = resetPins();
        return ok({ ...await service.status(), accessToken: pins.public, lanToken: pins.lan });
      }
      default:
        return fail2(`Unknown endpoint: ${endpoint}`);
    }
  };
  function fail2(message) {
    return { ok: false, error: { code: "bad-request", message, details: { issues: [{ message }] } } };
  }
  function ok(value) {
    return { ok: true, value };
  }
  const disposeRpc = installRpc(ctx, { channel: "/dsh-relay", handler, log: logger });
  void service.startProxy().then((p) => {
    logger.info("dsh-relay: proxy ready on :%d (tunnel inlet :%s) | \u672C\u5730\u4EE3\u7406\u5DF2\u5C31\u7EEA", p.port, p.tunnelPort ?? "-");
    return service.restoreIfNeeded();
  }).catch((err) => {
    logger.error("dsh-relay: proxy start failed | \u4EE3\u7406\u542F\u52A8\u5931\u8D25: %s", err?.message ?? err);
  });
  ctx.effect(() => async () => {
    try {
      disposeRpc?.();
    } catch {
    }
    await service.dispose();
  }, "dsh-relay: stop proxy and relay");
}
export {
  apply,
  inject,
  name
};
