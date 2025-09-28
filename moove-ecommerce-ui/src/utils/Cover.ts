//import sfondoCollection1 from "../assets/sfondoCollection1.png";
// import sfondoCollection2 from "../assets/sfondoCollection2.png";
// import sfondoCollection1 from "../assets/sfondoCollection1cutted.png";
// import sfondoCollection3 from "../assets/Moove-1.png";
import sfondoEVang from "../assets/E-Vanguards.png";
import sfondoMooveVang from "../assets/Moove_Vanguards.png";



export default function getCoverImage(index: number) {

    switch(index) {
        case 1:
            return sfondoEVang;
        default:
            return sfondoMooveVang;
    }
}