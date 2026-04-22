import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import apismartremun from "../../api/smartremun";

const ModalTambah = ({ show, onHide, onSave }) => {
  const [search, setSearch] = useState("");
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [qty, setQty] = useState(1);
  const [inputHarga, setInputHarga] = useState(0); // State untuk freetext harga
  const [listTarif, setListTarif] = useState([]);
  const [dokter, setDokter] = useState("-"); // State baru untuk Dokter

  useEffect(() => {
    if (show) {
      fetchMasterTarif();
    }
  }, [show]);

  const fetchMasterTarif = async () => {
    try {
      const response = await apismartremun.get("/igd/master-tarif");
      setListTarif(response.data);
    } catch (err) {
      console.error("Gagal ambil master tarif:", err);
    }
  };

  const filteredTarif = listTarif
    ?.filter((t) => t.NamaTindakan.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10);

  const handlePilih = (tarif) => {
    setSelectedTarif(tarif);
    setSearch(tarif.NamaTindakan);
    // Jika obat, ambil harga dari DB, jika tindakan set ke 0 agar diisi manual
    setInputHarga(
      tarif.Tipe === "OBAT" ? parseFloat(tarif.TotalTarif || 0) : 0,
    );
    setDokter("-"); // Reset atau set default dokter saat pilih tarif baru
  };

  const handleClose = () => {
    setSearch("");
    setSelectedTarif(null);
    setQty(1);
    setInputHarga(0);
    setDokter("-");
    onHide();
  };

  const handleSubmit = () => {
    if (!selectedTarif || inputHarga <= 0) {
      alert("Silahkan masukkan harga terlebih dahulu");
      return;
    }
    // Kirim data dengan harga hasil input manual (freetext)
    onSave({ ...selectedTarif, Kuantitas: qty, TotalTarif: inputHarga, NamaDokter: dokter });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Tambah Tindakan / Obat</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: "350px" }}>
        <Form>
          <Row>
            <Col md={12} className="mb-3 position-relative">
              <Form.Label className="fw-bold">
                Cari Nama Tindakan / Obat
              </Form.Label>
              <InputGroup>
                <Form.Control
                  placeholder="Ketik nama (Konsul, Infus, Paracetamol...)"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedTarif(null);
                  }}
                  autoComplete="off"
                />
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
              </InputGroup>

              {search && !selectedTarif && filteredTarif.length > 0 && (
                <div
                  className="list-group position-absolute w-100 shadow-lg"
                  style={{ zIndex: 1050, top: "100%", left: 0 }}
                >
                  {filteredTarif.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      className="list-group-item list-group-item-action py-2"
                      onClick={() => handlePilih(t)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">{t.NamaTindakan}</div>
                          <small className="badge bg-secondary text-white">
                            {t.Tipe}
                          </small>
                        </div>
                        <span className="text-primary small">
                          {t.Tipe === "OBAT"
                            ? `Harga: Rp ${parseFloat(t.TotalTarif || 0).toLocaleString("id-ID")}`
                            : "Input Harga Manual"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Col>

            {selectedTarif && (
              <Col md={12} className="animate__animated animate__fadeIn">
                <hr />
                <Row className="bg-light p-3 rounded mx-0">
                  <Col md={4} className="mb-3">
                    <Form.Label className="fw-bold">
                      Harga Satuan (Rp)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={inputHarga}
                      onChange={(e) =>
                        setInputHarga(parseFloat(e.target.value) || 0)
                      }
                      placeholder="Masukkan harga..."
                      className="border-primary"
                    />
                    <Form.Text className="text-muted">
                      {selectedTarif.Tipe === "TINDAKAN"
                        ? "* Wajib isi harga tindakan"
                        : "* Harga obat dapat diubah jika perlu"}
                    </Form.Text>
                  </Col>

                  <Col md={3} className="mb-3">
                    <Form.Label className="fw-bold">Kuantitas (Qty)</Form.Label>
                    <Form.Control
                      type="number"
                      value={qty}
                      min="1"
                      onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                    />
                  </Col>

                  <Col md={5} className="mb-3 text-end">
                    <Form.Label className="fw-bold">Total Tagihan</Form.Label>
                    <h4 className="text-primary fw-bold mt-1">
                      Rp {(inputHarga * qty).toLocaleString("id-ID")}
                    </h4>
                  </Col>

                  <Col md={12} className="mt-2">
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        Dokter Pelaksana
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ketik nama dokter..."
                        value={dokter}
                        onChange={(e) => setDokter(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={handleClose}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedTarif || inputHarga <= 0}
          className="px-4"
        >
          <i className="fas fa-save me-2"></i> Tambahkan ke Billing
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalTambah;
