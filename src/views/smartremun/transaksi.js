import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import CustomDataTable from "../../components/DataTable"; // Sesuaikan path

const MySwal = withReactContent(Swal);

const Transaksi = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [register, setRegister] = useState(null); // <-- register state
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [registerData, setRegisterData] = useState(null);

  const detectBodyTheme = () => {
    return document.body.className.includes("dark") ? "dark" : "light";
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
    const loadData = () => {
      const transaksiData = sessionStorage.getItem(`transaksi-${id}`);
      const registerData = sessionStorage.getItem(`register-${id}`);

      if (!transaksiData || !registerData) {
        MySwal.fire(
          "Gagal",
          "Data transaksi atau register tidak ditemukan!",
          "error"
        );
        return;
      }

      try {
        const transaksiParsed = JSON.parse(transaksiData);
        const registerParsed = JSON.parse(registerData);

        const dataRegister = registerParsed?.metadata?.data;
        setRegisterData(
          Array.isArray(dataRegister) ? dataRegister[0] : dataRegister
        );

        const transaksiList = transaksiParsed?.metadata?.data;
        if (!Array.isArray(transaksiList)) {
          throw new Error("Data transaksi tidak valid");
        }

        // Proses transaksi seperti sebelumnya...
        const formatted = transaksiParsed.metadata?.data?.map((item, i) => {
          const qty = parseFloat(item.Kuantitas || 0);
          const tarif = parseFloat(item.TotalTarif || 0);
          const subtotal = qty * tarif;

          return {
            no: i + 1,
            IdPelayananMedis: item.IdPelayananMedis,
            kodeTindakan: item.IdTindakan,
            namaTindakan: item.NamaTindakan,
            KelompokTindakan: item.KelompokTindakan,
            Qty: qty,
            Harga: tarif.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            }),
            Jumlah: subtotal.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            }),
            TanggalPelayanan: item.TanggalPelayanan,
          };
        });

        setData(formatted);
      } catch (error) {
        console.error("Gagal parsing data:", error);
        MySwal.fire("Gagal", "Format data tidak valid!", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const filteredData = Array.isArray(data)
    ? data.filter((item) =>
        item.namaTindakan?.toLowerCase().includes(filterText.toLowerCase())
      )
    : [];

  const getTotalJumlah = () => {
    return filteredData
      .reduce((acc, item) => {
        const clean = (item.Jumlah || "0")
          .replace(/[Rp. ]/g, "")
          .replace(",", ".");
        return acc + parseFloat(clean || 0);
      }, 0)
      .toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      });
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const columns = [
    { name: "No", selector: (row) => row.no, width: "60px" },
    { name: "Id Pelayanan", selector: (row) => row.IdPelayananMedis },
    { name: "Kode Tindakan", selector: (row) => row.kodeTindakan },
    { name: "Tindakan", selector: (row) => row.namaTindakan, width: "450px" },
    { name: "Kelompok", selector: (row) => row.KelompokTindakan },
    { name: "Qty", selector: (row) => row.Qty, width: "90px" },
    { name: "Tarif", selector: (row) => row.Harga, right: true },
    { name: "Jumlah", selector: (row) => row.Jumlah, center: true },
    { name: "Tanggal", selector: (row) => formatTanggal(row.TanggalPelayanan) },
  ];

  return (
    <>
      {/* CARD REGISTER */}
      <Row>
        <Col sm="12">
          <Card
            style={
              theme === "dark"
                ? { backgroundColor: "#222738", color: "#ffffff" }
                : {}
            }
          >
            <Card.Header>
              <h4 className="mb-0">Detail Register</h4>
            </Card.Header>
            <Card.Body
              style={theme === "dark" ? { backgroundColor: "#222738" } : {}}
            >
              {registerData ? (
                <>
                  <Row>
                    <Col lg="3">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          Id Register Kunjungan :{" "}
                          <div>{registerData.IdRegisterKunjungan}</div>
                        </h6>
                      </div>
                    </Col>
                    <Col lg="3">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          Nomor Rekam Medis :{" "}
                          <div>{registerData.NomorRekamMedis}</div>
                        </h6>
                      </div>
                    </Col>
                    <Col lg="2">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          Tanggal Masuk :{" "}
                          <div>{formatTanggal(registerData.TanggalMasuk)}</div>
                        </h6>
                      </div>
                    </Col>
                    <Col lg="2">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          Asuransi : <div>{registerData.NamaAsuransi}</div>
                        </h6>
                      </div>
                    </Col>
                    <Col lg="2">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          DPJP : <div>{registerData.NamaDokter}</div>
                        </h6>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg="3">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          Id Register Pasien :{" "}
                          <div>{registerData.IdRegister}</div>
                        </h6>
                      </div>
                    </Col>
                    <Col lg="3">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          Nama Pasien : <div>{registerData.NamaPasien}</div>
                        </h6>
                      </div>
                    </Col>
                    <Col lg="2">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          Tanggal Pulang :{" "}
                          <div>{formatTanggal(registerData.TanggalPulang)}</div>
                        </h6>
                      </div>
                    </Col>
                    <Col lg="2">
                      <div className="justify-content-between align-items-center flex-wrap mb-2">
                        <h6>
                          Nomor SEP : <div>{registerData.NomorSEP}</div>
                        </h6>
                      </div>
                    </Col>
                    <Col lg="2">
                      <h6>
                        Jumlah Register:{" "}
                        <span>
                          {registerData.Total
                            ? parseFloat(registerData.Total).toLocaleString(
                                "id-ID",
                                {
                                  style: "currency",
                                  currency: "IDR",
                                }
                              )
                            : "Rp 0,00"}
                        </span>
                      </h6>
                    </Col>
                  </Row>
                </>
              ) : (
                <p>Memuat data register...</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CARD TRANSAKSI */}
      <Row>
        <Col sm="12">
          <Card
            style={
              theme === "dark"
                ? { backgroundColor: "#222738", color: "#ffffff" }
                : {}
            }
          >
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Detail Transaksi</h4>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="text"
                  placeholder="Cari tindakan..."
                  className="w-auto"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </Card.Header>
            <Card.Body
              style={theme === "dark" ? { backgroundColor: "#222738" } : {}}
            >
              <div>
                <h5>Total Jumlah: {getTotalJumlah()}</h5>
              </div>
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
    </>
  );
};

export default Transaksi;
