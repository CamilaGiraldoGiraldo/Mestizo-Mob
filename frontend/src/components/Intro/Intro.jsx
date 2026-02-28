import { useNavigate } from "react-router-dom";
import portada from "../../assets/portada.jpg"; // tu imagen
import "./Intro.css";

export default function Intro() {
  const navigate = useNavigate();

  const entrar = () => {
    navigate("/landing");
  };

  return (
    <div className="intro">
      <img src={portada} alt="Portada" className="intro-bg" />

      <div className="intro-overlay"></div>

      <div className="intro-content">
        <button onClick={entrar}>Bienvenido</button>
      </div>
    </div>
  );
}