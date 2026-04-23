import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import CustomDataTable from "../../components/DataTable";
import api from "../../api/axios";

const MySwal = withReactContent(Swal);

// Fungsi ambil CSRF token dari Sanctum
const getCsrfCookie = async () => {
  await api.get("/sanctum/csrf-cookie", {
    withCredentials: true,
  });
};

const Igd = () => {
  const [data, setData] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      MySwal.fire({
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading(),
      });

      try {
        await getCsrfCookie(); // Ambil CSRF cookie
        const res = await api.get("/api/proxy/igd", {
          withCredentials: true,
        });

        const responseData = res.data.metadata.data;

        const formatted = responseData
          .sort((a, b) => new Date(b.id) - new Date(a.id))
          .map((item) => ({
            idRegisterKunjungan: item.IdRegisterKunjungan,
            idRegister: item.IdRegister,
            noRekamMedis: item.NomorRekamMedis,
            namaPasien: item.NamaPasien,
            nomorSEP: item.NomorSEP,
            namaDokter: item.NamaDokter,
            namaAsuransi: item.NamaAsuransi,
            poli: item.Ruangan,
            tanggalMasuk: item.TanggalMasuk,
            tanggalPulang: item.TanggalPulang,
            total: parseFloat(item.Total).toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            }),
          }));

        setData(formatted);
      } catch (error) {
        console.error("Fetch error:", error);
        MySwal.fire("Gagal", "Gagal mengambil data!", "error");
      } finally {
        setLoading(false);
        Swal.close();
      }
    };

    fetchData();
  }, []);

  const handleDetailClick = async (id) => {
  try {
    // 1. Minta token CSRF dari Laravel (penting agar cookie XSRF-TOKEN ter-set)
    await api.get("/sanctum/csrf-cookie", {
      withCredentials: true,
    });

    // 2. Kirim POST ke Laravel dengan credentials
    const [resRegister, resTransaksi] = await Promise.all([
      api.post(
        "/api/get/registerigd",
        { idRegisterKunjungan: id },
        { withCredentials: true } // tanpa perlu set header X-XSRF-TOKEN
      ),
      api.post(
        "/api/get/transaksiigd",
        { idRegisterKunjungan: id },
        { withCredentials: true }
      ),
    ]);

    // 3. Simpan hasilnya di sessionStorage
    sessionStorage.setItem(`register-${id}`, JSON.stringify(resRegister.data));
    sessionStorage.setItem(`transaksi-${id}`, JSON.stringify(resTransaksi.data));

    // 4. Buka halaman detail
    window.open(`/smartremun/transaksi/${id}`, "_blank");
  } catch (err) {
    console.error("Gagal ambil data:", err);
    alert("Gagal ambil data dari server");
  }
};


  const filteredData = data.filter(
    (item) =>
      item.namaPasien?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.noRekamMedis?.toLowerCase().includes(filterText.toLowerCase()) || item.nomorSEP?.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    { name: "Id Register Kunjungan", selector: (row) => row.idRegisterKunjungan, sortable: true },
    { name: "Id Register", selector: (row) => row.idRegister, sortable: true },
    { name: "No RM", selector: (row) => row.noRekamMedis },
    { name: "Nama Pasien", selector: (row) => row.namaPasien },
    { name: "Nomor SEP", selector: (row) => row.nomorSEP, width: "200px" },
    { name: "Nama Dokter", selector: (row) => row.namaDokter },
    { name: "Asuransi", selector: (row) => row.namaAsuransi },
    { name: "Poli", selector: (row) => row.poli },
    { name: "Tanggal Masuk", selector: (row) => formatTanggal(row.tanggalMasuk) },
    { name: "Tanggal Pulang", selector: (row) => formatTanggal(row.tanggalPulang) },
    { name: "Total", selector: (row) => row.total, right: true },
    {
      name: "Aksi",
      cell: (row) => (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => handleDetailClick(row.idRegisterKunjungan)}
        >
          Detail
        </button>
      ),
    },
  ];

  return (
    <Row>
      <Col sm="12">
        <Card
          style={
            theme === "dark"
              ? { backgroundColor: "#222738", color: "#ffffff" }
              : {}
          }
        >
          <Card.Header className="d-flex justify-content-between">
            <div className="header-title">
              <h4 className="card-title">Data Register IGD</h4>
            </div>
            <div className="d-flex">
              <Form.Control
                type="text"
                placeholder="Cari pasien..."
                className="form-control"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
          </Card.Header>
          <Card.Body
            style={theme === "dark" ? { backgroundColor: "#222738" } : {}}
          >
            <CustomDataTable
              columns={columns}
              data={filteredData}
              loading={loading}
              theme={theme}
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Igd;
