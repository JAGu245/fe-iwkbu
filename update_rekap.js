const fs = require('fs');

const path = 'C:\\Users\\JAGu\\Documents\\GitHub\\fe-iwkbu\\src\\components\\RekapDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace Interface
content = content.replace(
  /mengupayakanCount: number;\s*placeholderChar: "0" \| "-";\s*\}/,
  'mengupayakanCount: number;\n    checkinPlaceholder: "0" | "-";\n    checkoutPlaceholder: "0" | "-";\n  }'
);

// Replace parent loket push
content = content.replace(
  /mengupayakanCount: 0,\s*placeholderChar: "-",\s*\}\);/g,
  'mengupayakanCount: 0,\n          checkinPlaceholder: "-",\n          checkoutPlaceholder: "-",\n        });'
);

// Replace group subtotal push
content = content.replace(
  /mengupayakanCount: 0,\s*placeholderChar: "-",\s*\};/g,
  'mengupayakanCount: 0,\n          checkinPlaceholder: "-",\n          checkoutPlaceholder: "-",\n        };'
);

// Replace grand total push
content = content.replace(
  /mengupayakanCount: 0,\s*placeholderChar: "-",\s*\};\s*result\.push\(grandTotal\);/g,
  'mengupayakanCount: 0,\n      checkinPlaceholder: "-",\n      checkoutPlaceholder: "-",\n    };\n\n    result.push(grandTotal);'
);

// Replace the calculation logic
const logicSearch = /\/\/ Tentukan placeholder untuk nilai kosong berdasarkan data mentah[\s\S]*?if \(hasNihilRecord\) \{\s*rekap\.placeholderChar = "0";\s*\}\s*\}/;

const logicReplace = `// Tentukan placeholder untuk nilai kosong berdasarkan data mentah
      rekap.checkinPlaceholder = "-";
      rekap.checkoutPlaceholder = "-";

      if (rekap.checkinNopol === 0) {
        const hasNihilRecordTl = endpointData.some((item) => {
          if (!item.iwkbu_tl_tgl_transaksi) return false;

          let isInRange = false;
          if (useDateRange && tlStartLimit > 0) {
            const ts = parseToTimestamp(item.iwkbu_tl_tgl_transaksi);
            isInRange = isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit);
          } else if (!useDateRange) {
            const parts = item.iwkbu_tl_tgl_transaksi.split("/");
            isInRange = parts[1] === monthStr;
          }

          if (!isInRange) return false;

          const nopol = String(item.iwkbu_tl_nopol || "").trim().toUpperCase();
          const desc = String(item.tl_keterangan_konversi_iwkbu || "").trim().toUpperCase();

          return nopol === 'NIHIL' || desc.includes('NIHIL');
        });

        if (hasNihilRecordTl) {
          rekap.checkinPlaceholder = "0";
        }
      }

      if (rekap.checkoutNopol === 0) {
        const hasNihilRecordTi = endpointData.some((item) => {
          if (!item.iwkbu_ti_tgl_transaksi) return false;

          let isInRange = false;
          if (useDateRange && tiStartLimit > 0) {
            const ts = parseToTimestamp(item.iwkbu_ti_tgl_transaksi);
            isInRange = isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
          } else if (!useDateRange) {
            const parts = item.iwkbu_ti_tgl_transaksi.split("/");
            isInRange = parts[1] === monthStr;
          }

          if (!isInRange) return false;

          const nopol = String(item.iwkbu_ti_nopol || "").trim().toUpperCase();
          const desc = String(item.tl_keterangan_konversi_iwkbu || "").trim().toUpperCase();

          return nopol === 'NIHIL' || desc.includes('NIHIL');
        });

        if (hasNihilRecordTi) {
          rekap.checkoutPlaceholder = "0";
        }
      }`;

content = content.replace(logicSearch, logicReplace);

// Replace render usages
content = content.replace(
  /row\.checkinNopol > 0\s*\?\s*row\.checkinNopol\s*:\s*isIndividualLoketRow\s*\?\s*row\.placeholderChar\s*:\s*"-""?/g,
  'row.checkinNopol > 0 ? row.checkinNopol : isIndividualLoketRow ? row.checkinPlaceholder : "-"'
);
content = content.replace(
  /row\.checkinRupiah > 0\s*\?\s*formatRupiah\(row\.checkinRupiah\)\s*:\s*isIndividualLoketRow\s*\?\s*row\.placeholderChar\s*:\s*"-""?/g,
  'row.checkinRupiah > 0 ? formatRupiah(row.checkinRupiah) : isIndividualLoketRow ? row.checkinPlaceholder : "-"'
);

// For checkout and others, use checkoutPlaceholder
content = content.replace(/row\.placeholderChar/g, 'row.checkoutPlaceholder');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated RekapDashboard.tsx');
