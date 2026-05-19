const fs = require('fs');

const path = 'C:\\Users\\JAGu\\Documents\\GitHub\\fe-iwkbu\\src\\components\\RekapDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const logicSearch = /const hasNihilRecordTl = endpointData\.some\(\(item\) => \{\s*if \(\!item\.iwkbu_tl_tgl_transaksi\) return false;\s*let isInRange = false;\s*if \(useDateRange && tlStartLimit > 0\) \{\s*const ts = parseToTimestamp\(item\.iwkbu_tl_tgl_transaksi\);\s*isInRange = isDateInRangeOptimized\(ts, tlStartLimit, tlEndLimit\);\s*\} else if \(\!useDateRange\) \{\s*const parts = item\.iwkbu_tl_tgl_transaksi\.split\("\/"\);\s*isInRange = parts\[1\] === monthStr;\s*\}/;

const logicReplace = `const hasNihilRecordTl = endpointData.some((item) => {
          const tglTl = item.iwkbu_tl_tgl_transaksi || item.iwkbu_ti_tgl_transaksi;
          if (!tglTl) return false;

          let isInRange = false;
          if (useDateRange && tlStartLimit > 0) {
            const ts = parseToTimestamp(tglTl);
            isInRange = isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit) || 
                        isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
          } else if (!useDateRange) {
            const parts = tglTl.split("/");
            isInRange = parts[1] === monthStr;
          }`;

content = content.replace(logicSearch, logicReplace);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated RekapDashboard.tsx logic for TL dates');
