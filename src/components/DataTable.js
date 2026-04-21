// src/components/DataTable.js
import React from "react";
import DataTable, { createTheme } from "react-data-table-component";

// Buat tema custom untuk dark mode
createTheme("bootstrapDark", {
  text: {
    primary: "#ffffff",
    secondary: "#cccccc",
  },
  background: {
    default: "#222738",
  },
  context: {
    background: "#222738",
    text: "#FFFFFF",
  },
  divider: {
    default: "#444444",
  },
  action: {
    button: "rgba(255,255,255,0.54)",
    hover: "rgba(255,255,255,0.08)",
    disabled: "rgba(255,255,255,0.12)",
  },
});

// Style untuk dark mode
const customStylesDark = {
  headCells: {
    style: {
      backgroundColor: "#2c2f36",
      color: "#ffffff",
      fontWeight: "bold",
      borderBottom: "#444444",
    },
  },
  cells: {
    style: {
      borderBottom: "#444444",
    },
  },
};

// Style untuk light mode
const customStylesLight = {
  headCells: {
    style: {
      backgroundColor: "#f8f9fa",
      color: "#343a40",
      fontWeight: "bold",
      borderBottom: "#dee2e6",
    },
  },
  cells: {
    style: {
      borderBottom: "#dee2e6",
    },
  },
};



const CustomDataTable = ({ columns, data, loading = false, theme = "light" }) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      progressPending={loading}
      pagination
      highlightOnHover
      responsive
      theme={theme === "dark" ? "bootstrapDark" : "default"}
      customStyles={theme === "dark" ? customStylesDark : customStylesLight}
      noDataComponent="Tidak ada data tersedia"
    />
  );
};

export default CustomDataTable;
