import { Routes, Route } from "react-router-dom";
import Proyecciones from "./Proyecciones/Proyecciones.jsx";
import FormInicioProyecto from "./FormInicioProyecto/FormInicioProyecto.jsx";

function Pages() {
  return (
    <Routes>
      <Route path="/" element={<FormInicioProyecto />} />
      <Route path="/proyecciones" element={<Proyecciones />} />
    </Routes>
  );
}

export default Pages;
