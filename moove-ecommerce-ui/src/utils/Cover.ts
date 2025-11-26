import default_cover from "../assets/default_cover.png";
import sfondoMooveVang from "../assets/Moove_Vanguards.png";



export default function getCoverImage(index: number) {

    switch(index) {
        case 0:
            return sfondoMooveVang;
        default:
            return default_cover;
    }
}