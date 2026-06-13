import { Link } from "react-router-dom";

function Banner() {
    return (
       <Link to="/register">
            <button>
                Começar Agora
            </button>
        </Link>
    )
}

export default Banner;