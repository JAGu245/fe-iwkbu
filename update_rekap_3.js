const fs = require('fs');

const path = 'C:\\Users\\JAGu\\Documents\\GitHub\\fe-iwkbu\\src\\components\\RekapDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const logicSearch = /const hasNihilRecordTi = endpointData\.some\(\(item\) => \{\s*if \(\!item\.iwkbu_ti_tgl_transaksi\) return false;\s*let isInRange = false;\s*if \(useDateRange && tiStartLimit > 0\) \{\s*const ts = parseToTimestamp\(item\.iwkbu_ti_tgl_transaksi\);\s*isInRange = isDateInRangeOptimized\(ts, tiStartLimit, tiEndLimit\);\s*\} else if \(\!useDateRange\) \{\s*const parts = item\.iwkbu_ti_tgl_transaksi\.split\("\/"\);\s*isInRange = parts\[1\] === monthStr;\s*\}/;

const logicReplace = `const hasNihilRecordTi = endpointData.some((item) => {
            const tglTi = item.iwkbu_ti_tgl_transaksi || item.iwkbu_tl_tgl_transaksi;
            if (!tglTi) return false;

            let isInRange = false;
            if (useDateRange && tiStartLimit > 0) {
              const ts = parseToTimestamp(tglTi);
              isInRange = isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit) || 
                          isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit);
            } else if (!useDateRange) {
              const parts = tglTi.split("/");
              isInRange = parts[1] === monthStr;
            }`;

content = content.replace(logicSearch, logicReplace);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated RekapDashboard.tsx logic for TI dates');
