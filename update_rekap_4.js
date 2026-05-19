const fs = require('fs');

const path = 'C:\\Users\\JAGu\\Documents\\GitHub\\fe-iwkbu\\src\\components\\RekapDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const logicSearch = /if \(useDateRange && tlStartLimit > 0\) \{\s*const ts = parseToTimestamp\(item\.iwkbu_tl_tgl_transaksi\);\s*dateRangeMatch = isDateInRangeOptimized\(ts, tlStartLimit, tlEndLimit\);\s*\}/;

const logicReplace = `if (useDateRange && tlStartLimit > 0) {
              const ts = parseToTimestamp(item.iwkbu_tl_tgl_transaksi);
              dateRangeMatch = isDateInRangeOptimized(ts, tlStartLimit, tlEndLimit) || 
                               isDateInRangeOptimized(ts, tiStartLimit, tiEndLimit);
            }`;

content = content.replace(logicSearch, logicReplace);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated RekapDashboard.tsx logic for TL sum dates');
