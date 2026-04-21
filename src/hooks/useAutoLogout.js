import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function useAutoLogout(timeoutMinutes = 60) {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handleLogout, timeoutMinutes * 60 * 1000); // konversi ke ms
    };

    const handleLogout = () => {
      // Hapus data auth
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("user");
      delete window.axios?.defaults?.headers?.common["Authorization"];

      Swal.fire({
        title: "Sesi berakhir",
        text: "Anda telah otomatis logout karena tidak ada aktivitas.",
        icon: "info",
        confirmButtonText: "Login kembali",
      }).then(() => {
        window.location.href = "/"; // ✅ arahkan ke halaman login (root)
      });
    };

    // Event yang dianggap sebagai "aktivitas"
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Set timer pertama kali
    resetTimer();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timer);
    };
  }, [navigate, timeoutMinutes]);
}
