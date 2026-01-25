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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const allData: ReportData[] = [];
      for (const [loketName, endpoint] of Object.entries(endpointMap)) {
        const res = await fetch(`http://localhost:8080/${endpoint}`);
        if (!res.ok) throw new Error(`Gagal fetch dari ${endpoint}`);

        const result = await res.json();
        const rawData = result.data || [];

        const withLoket = rawData.map((item: any, index: number) => ({
          no: index + 1,
          loket: loketName,
          iwkbu_ti_tgl_transaksi: item.iwkbu_ti_tgl_transaksi,
          iwkbu_ti_nopol: item.iwkbu_ti_nopol,
          iwkbu_ti_rupiah_penerimaan: item.iwkbu_ti_rupiah_penerimaan,
          iwkbu_to_tgl_transaksi: item.iwkbu_to_tgl_transaksi,
          iwkbu_to_nopol: item.iwkbu_to_nopol,
          iwkbu_to_rupiah_penerimaan: item.iwkbu_to_rupiah_penerimaan,
        }));
        allData.push(...withLoket);
      }

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
    useEffect(() => {
      handleSubmit();
    });
  };
  return (
    <div className="">
      {/* Table Section */}
      <div className="overflow-auto rounded-lg border shadow-md">
        <Table className="min-w-[1200px] text-sm text-center">
          <TableHeader className="bg-gray-100">
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
                  className="whitespace-nowrap text-xs font-semibold text-gray-700"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={`${item.loket}-${item.no}`}>
                <TableCell>{item.no}</TableCell>
                <TableCell>{item.loket}</TableCell>
                <TableCell>{item.iwkbu_tl_nopol}</TableCell>
                <TableCell>
                  {item.iwkbu_tl_rupiah_penerimaan.toLocaleString()}
                </TableCell>
                <TableCell>{item.iwkbu_ti_nopol}</TableCell>
                <TableCell>
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
