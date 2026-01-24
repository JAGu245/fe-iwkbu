import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

interface ReportData {
  no: number;
  loket: string;
  iwkbu_ti_tgl_transaksi: string;
  iwkbu_ti_nopol: string;
  iwkbu_ti_rupiah_penerimaan: number;
  iwkbu_tl_tgl_transaksi: string;
  iwkbu_tl_nopol: string;
  iwkbu_tl_rupiah_penerimaan: number;
}

// format tanggal menjadi yyyy-mm-dd
const formatDate = (date: Date) => date.toISOString().split("T")[0];

const RekapTabel3M = () => {
  const [data, setData] = useState<ReportData[]>([]);

  const [tanggalAwal, setTanggalAwal] = useState<string>("2025-05-01");
  const [tanggalAkhir, setTanggalAkhir] = useState<string>(
    formatDate(new Date())
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpointMap: Record<string, string> = {
    "LOKET PERWAKILAN CABANG JAWA TENGAH": "loketcabangjawatengah",
    "SAMSAT KENDAL": "samsatkendal",
    "SAMSAT DEMAK": "samsatdemak",
    "SAMSAT PURWODADI": "samsatpurwodadi",
    "SAMSAT UNGARAN": "samsatungaran",
    "SAMSAT SALATIGA": "samsatsalatiga",
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "/api/rekap";

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const endpoints = Object.values(endpointMap);

    try {
      const bulkRes = await fetch("/api/bulk-rekap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoints }),
      });

      if (!bulkRes.ok) throw new Error("Gagal mengunduh data massal");

      const bulkData = await bulkRes.json();
      const allData: ReportData[] = [];

      bulkData.results.forEach((res: any) => {
        const loketName = Object.keys(endpointMap).find(key => endpointMap[key] === res.endpoint) || res.endpoint;
        const rawData = res.data || [];

        const withLoket = rawData.map((item: any, index: number) => ({
          no: index + 1,
          loket: loketName,
          iwkbu_ti_tgl_transaksi: item.iwkbu_ti_tgl_transaksi,
          iwkbu_ti_nopol: item.iwkbu_ti_nopol,
          iwkbu_ti_rupiah_penerimaan: item.iwkbu_ti_rupiah_penerimaan,
          iwkbu_tl_tgl_transaksi: item.iwkbu_tl_tgl_transaksi,
          iwkbu_tl_nopol: item.iwkbu_tl_nopol,
          iwkbu_tl_rupiah_penerimaan: item.iwkbu_tl_rupiah_penerimaan,
        }));
        allData.push(...withLoket);
      });

      // Filter berdasarkan tanggal
      const start = new Date(tanggalAwal);
      const end = new Date(tanggalAkhir);

      const filteredData = allData.filter((item) => {
        const [day, month, year] = item.iwkbu_ti_tgl_transaksi.split("/");
        const date = new Date(`${year}-${month}-${day}`);
        return date >= start && date <= end;
      });

      const finalData = filteredData.map((item, i) => ({ ...item, no: i + 1 }));
      setData(finalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="">
      {/* Table Section */}
      <div className="overflow-auto rounded-lg border shadow-md bg-white dark:bg-zinc-900">
        <Table className="min-w-[1200px] text-sm text-center">
          <TableHeader className="bg-gray-100 dark:bg-zinc-900">
            <TableRow>
              {[
                "No",
                "Loket Kantor",
                "CI Nopol",
                "CI Rupiah",
                "CO Nopol",
                "CO Rupiah",
              ].map((header, idx) => (
                <TableHead
                  key={idx}
                  className="whitespace-nowrap text-xs font-semibold text-gray-700 dark:text-gray-200"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={`${item.loket}-${item.no}`} className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                <TableCell className="dark:text-white">{item.no}</TableCell>
                <TableCell className="dark:text-white">{item.loket}</TableCell>
                <TableCell className="dark:text-white">{item.iwkbu_tl_nopol}</TableCell>
                <TableCell className="dark:text-white">
                  {item.iwkbu_tl_rupiah_penerimaan.toLocaleString()}
                </TableCell>
                <TableCell className="dark:text-white">{item.iwkbu_ti_nopol}</TableCell>
                <TableCell className="dark:text-white">
                  {item.iwkbu_ti_rupiah_penerimaan.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RekapTabel3M;
