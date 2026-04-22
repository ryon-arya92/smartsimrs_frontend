import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";

const ModalTambah = ({ show, onHide, onSave, listTarif }) => {
  const [search, setSearch] = useState("");
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [qty, setQty] = useState(1);

  // Filter tarif berdasarkan input search
  const filteredTarif = listTarif?.filter((t) =>
    t.NamaTindakan.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10); // Limit 10 agar modal tidak kepanjangan

  const handlePilih = (tarif) => {
    setSelectedTarif(tarif);
    setSearch(tarif.NamaTindakan);
  };

  const handleSubmit = () => {
    if (!selectedTarif) return;
    onSave({ ...selectedTarif, Kuantitas: qty });
    // Reset state setelah simpan
    setSelectedTarif(null);
    setSearch("");
    setQty(1);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Tambah Tindakan / Layanan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={12} className="mb-3">
              <Form.Label>Cari Nama Tindakan</Form.Label>
              <InputGroup>
                <Form.Control
                  placeholder="Ketik nama tindakan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
              </InputGroup>
              
              {/* Dropdown Hasil Pencarian */}
              {search && !selectedTarif && (
                <div className="list-group position-absolute w-100 z-index-10 shadow">
                  {filteredTarif.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      className="list-group-item list-group-item-action"
                      onClick={() => handlePilih(t)}
                    >
                      <div className="d-flex justify-content-between">
                        <span>{t.NamaTindakan}</span>
                        <span className="text-primary fw-bold">Rp {parseFloat(t.TotalTarif).toLocaleString('id-ID')}</span>
                      </div>
                      <small className="text-muted">{t.KelompokTindakan} - {t.NamaRuangan}</small>
                    </button>
                  ))}
                </div>
              )}
            </Col>

            {selectedTarif && (
              <>
                <Col md={6} className="mb-3">
                  <Form.Label>Kelompok</Form.Label>
                  <Form.Control value={selectedTarif.KelompokTindakan} readOnly className="bg-light" />
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Label>Kuantitas (Qty)</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={qty} 
                    min="1" 
                    onChange={(e) => setQty(e.target.value)} 
                  />
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Label>Total Harga</Form.Label>
                  <Form.Control 
                    value={(selectedTarif.TotalTarif * qty).toLocaleString('id-ID')} 
                    readOnly 
                    className="bg-light fw-bold text-primary" 
                  />
                </Col>
              </>
            )}
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Batal</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!selectedTarif}>
          Tambahkan ke Billing
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalTambah;