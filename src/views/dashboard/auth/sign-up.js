import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Card from "../../../components/Card";
import Swal from "sweetalert2";
import api from "../../../api/axios";

const SignUp = () => {
  const history = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      Swal.fire({
        title: "Sedang memproses...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
      //   withCredentials: true,
      // });

      // Ambil CSRF cookie dulu
            await api.get("/sanctum/csrf-cookie");
            

      const response = await api.post(
        "/api/register",
        {
          name: `${form.full_name} ${form.last_name}`,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        },
        {
          withCredentials: true,
        }
      );

      sessionStorage.setItem("user", JSON.stringify(response.data.user || {}));

      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil",
        text: "Akun berhasil dibuat!",
      });

      history("/");
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Registrasi Gagal",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mendaftar.",
      });
    }
  };

  return (
    <section className="login-content">
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <Col md="6">
          <Row className="justify-content-center">
            <Col md="10">
              <Card className="card-transparent auth-card shadow-none d-flex justify-content-center mb-0">
                <Card.Body>
                  <Link to="/" className="navbar-brand d-flex align-items-center mb-3">
                    <svg
                      width="30"
                      className="text-primary"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="-0.757324" y="19.2427" width="28" height="4" rx="2" transform="rotate(-45 -0.757324 19.2427)" fill="currentColor" />
                      <rect x="7.72803" y="27.728" width="28" height="4" rx="2" transform="rotate(-45 7.72803 27.728)" fill="currentColor" />
                      <rect x="10.5366" y="16.3945" width="16" height="4" rx="2" transform="rotate(45 10.5366 16.3945)" fill="currentColor" />
                      <rect x="10.5562" y="-0.556152" width="28" height="4" rx="2" transform="rotate(45 10.5562 -0.556152)" fill="currentColor" />
                    </svg>
                    <h4 className="logo-title ms-3">SmartSimrs</h4>
                  </Link>
                  <h2 className="mb-2 text-center">Sign Up</h2>
                  <p className="text-center">Create your SmartSimrs account.</p>
                  <Form onSubmit={handleRegister}>
                    <Row>
                      <Col lg="6">
                        <Form.Group>
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col lg="6">
                        <Form.Group>
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col lg="6">
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col lg="6">
                        <Form.Group>
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col lg="6">
                        <Form.Group>
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-center mt-3">
                      <Button type="submit" variant="primary">Sign Up</Button>
                    </div>
                    <p className="mt-3 text-center">
                      Already have an Account?{" "}
                      <Link to="/" className="text-underline">Sign In</Link>
                    </p>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </div>
    </section>
  );
};

export default SignUp;
