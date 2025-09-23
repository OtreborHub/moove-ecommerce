export default function getCoverImage(index: number) {
    const covers = [
        "https://img.freepik.com/vettori-gratuito/set-di-loghi-di-criptovaluta-popolari_69286-369.jpg?",
        "https://sm.mashable.com/t/mashable_in/photo/default/new-project-35_vakg.1248.jpg",
    ];

    switch(index) {
        case 0:
            return covers[1];
        case 1:
            return covers[0];
        case 2:
            return covers[1];
        default:
            return covers[0];
    }
}