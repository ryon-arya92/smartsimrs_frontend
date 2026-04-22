import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ModalEdit = ({ show, onHide, onUpdate, dataEdit }) => {
  const [qty, setQty] = useState(1);
  const [pelaksana, setPelaksana] = useState("");

  // Sync state saat dataEdit berubah (ketika tombol edit diklik)
  useEffect(() => {
    if (dataEdit) {
      setQty(dataEdit.Kuantitas || 1);
      setPelaksana(dataEdit.NamaPelaksanaMedis || "");
    }
  }, [dataEdit]);

  const handleUpdate = () => {
    onUpdate({ ...dataEdit, Kuantitas: qty, NamaPelaksanaMedis: pelaksana });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title>Edit Detail Tindakan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {dataEdit && (
          <Form>
            <div className="mb-3 p-2 bg-light rounded">
              <small className="text-muted d-block">Nama Tindakan:</small>
              <h6 className="mb-0 text-primary">{dataEdit.NamaTindakan}</h6>
            </div>
            
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Jumlah (Qty)</Form.Label>
                <Form.Control 
                  type="number" 
                  value={qty} 
                  min="1" 
                  onChange={(e) => setQty(e.target.value)} 
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Subtotal</Form.Label>
                <Form.Control 
                  value={(parseFloat(dataEdit.TotalTarif || 0) * qty).toLocaleString('id-ID')} 
                  readOnly 
                  className="bg-light fw-bold" 
                />
              </Col>
              <Col md={12} className="mb-3">
                <Form.Label>Dokter Pelaksana</Form.Label>
                <Form.Control 
                  type="text" 
                  value={pelaksana} 
                  placeholder="Masukkan nama dokter..."
                  onChange={(e) => setPelaksana(e.target.value)} 
                />
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Batal</Button>
        <Button variant="warning" onClick={handleUpdate}>Simpan Perubahan</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdit;