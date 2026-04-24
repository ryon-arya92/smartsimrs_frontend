import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import CustomDataTable from "../../components/DataTable";
import api from "../../api/axios";

const MySwal = withReactContent(Swal);

const Rajal = () => {
  const [data, setData] = useState([]); // State tunggal untuk data tabel
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  const detectBodyTheme = () => {
    return document.body.className.includes("dark") ? "dark" : "light";
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Observer untuk Tema (Dark/Light)
  useEffect(() => {
    setTheme(detectBodyTheme());
    const observer = new MutationObserver(() => {
      const newTheme = detectBodyTheme();
      setTheme((prev) => (prev !== newTheme ? newTheme : prev));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Fetch Data Awal
  const fetchData = async () => {
    setLoading(true);
    try {
      // Pastikan CSRF cookie diambil sekali di awal
      await api.get("/sanctum/csrf-cookie");
      
      const res = await api.get("/api/proxy/rajal");
      const responseData = res.data.metadata.data || [];

      const formatted = responseData
        .sort((a, b) => b.IdRegisterKunjungan - a.IdRegisterKunjungan)
        .map((item) => ({
          idRegisterKunjungan: item.IdRegisterKunjungan,
          idRegister: item.IdRegister,
          noRekamMedis: item.NomorRekamMedis,
          namaPasien: item.NamaPasien,
          nomorSEP: item.NomorSEP,
          NamaAsuransi: item.NamaAsuransi,
          namaDokter: item.NamaDokter,
          poli: item.Ruangan,
          tanggalMasuk: item.TanggalMasuk,
          tanggalPulang: item.TanggalPulang,
          totalRaw: item.Total, // simpan nilai asli untuk keperluan lain
          total: parseFloat(item.Total).toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          }),
        }));

      setData(formatted);
    } catch (error) {
      console.error("Fetch error:", error);
      MySwal.fire("Gagal", "Gagal mengambil data dari server!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi Detail (Membuka Tab Baru)
  const handleDetailClick = async (id) => {
    try {
      MySwal.fire({ title: "Menyiapkan Data...", didOpen: () => MySwal.showLoading() });
      
      await api.get("/sanctum/csrf-cookie");

      // Gunakan ID yang dikirim dari baris tabel
      const [resRegister, resTransaksi] = await Promise.all([
        api.post("/api/get/registerrajal", { idRegisterKunjungan: id }),
        api.post("/api/get/transaksirajal", { idRegisterKunjungan: id }),
      ]);

      sessionStorage.setItem(`register-${id}`, JSON.stringify(resRegister.data));
      sessionStorage.setItem(`transaksi-${id}`, JSON.stringify(resTransaksi.data));

      Swal.close();
      window.open(`/smartremun/transaksi/${id}`, "_blank");
    } catch (err) {
      console.error("Gagal ambil data:", err);
      MySwal.fire("Error", "Gagal mengambil detail transaksi", "error");
    }
  };

  // Fungsi Hapus (Proxy ke Laravel -> Server UAT Delete)
  const handleDeleteRegister = async (row) => {
    const result = await MySwal.fire({
      title: "Hapus Registrasi?",
      text: `Menghapus ${row.namaPasien} dari SmartRemun. Tindakan ini permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        MySwal.fire({
          title: "Memproses...",
          text: "Menghapus data di server SmartRemun",
          allowOutsideClick: false,
          didOpen: () => MySwal.showLoading(),
        });

        await api.get("/sanctum/csrf-cookie");

        // Memanggil route Proxy Laravel yang sudah kita perbaiki tadi
        const response = await api.delete(`/api/proxy/rajal/delete-register/${row.idRegisterKunjungan}`);

        if (response.status === 200) {
          await MySwal.fire("Berhasil", "Data berhasil dihapus dari SmartRemun", "success");

          // UPDATE STATE: Hapus dari list 'data' agar UI langsung update
          setData((prev) => prev.filter((item) => item.idRegisterKunjungan !== row.idRegisterKunjungan));
        }
      } catch (err) {
        console.error("Delete error:", err);
        // Menangkap detail error 404/URL tidak tersedia dari SmartRemun
        const detailError = err.response?.data?.detail?.register?.metadata?.message || 
                            err.response?.data?.message || 
                            "Terjadi kesalahan saat menghapus data";
                            
        MySwal.fire("Gagal", detailError, "error");
      }
    }
  };

  // Logika Filter Pencarian
  const filteredData = data.filter(
    (item) =>
      item.namaPasien?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.noRekamMedis?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.nomorSEP?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.idRegisterKunjungan?.toString().includes(filterText)
  );

  const columns = [
    { name: "No Reg Kunjungan", selector: (row) => row.idRegisterKunjungan, sortable: true, width: "150px" },
    { name: "No RM", selector: (row) => row.noRekamMedis, sortable: true },
    { name: "Nama Pasien", selector: (row) => row.namaPasien, sortable: true, width: "200px" },
    { name: "Nomor SEP", selector: (row) => row.nomorSEP, width: "200px" },
    { name: "Asuransi", selector: (row) => row.NamaAsuransi},
    { name: "Poli", selector: (row) => row.poli },
    { name: "Tgl Masuk", selector: (row) => formatTanggal(row.tanggalMasuk), sortable: true },
    { name: "Total", selector: (row) => row.total, right: true, width: "150px" },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={() => handleDetailClick(row.idRegisterKunjungan)}>
            Detail
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRegister(row)}>
            Hapus
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "160px"
    },
  ];

  return (
    <Row>
      <Col sm="12">
        <Card className={theme === "dark" ? "bg-dark text-white" : ""}>
          <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 py-3 bg-transparent">
            <div className="header-title">
              <h4 className="card-title mb-0">Data Register Rajal</h4>
            </div>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Cari pasien / No RM / SEP..."
                className="flex-grow-1"
                style={{ minWidth: "250px", maxWidth: "400px" }}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
          </Card.Header>
          <Card.Body>
            <CustomDataTable
              columns={columns}
              data={filteredData}
              loading={loading}
              theme={theme}
              pagination
              highlightOnHover
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Rajal;