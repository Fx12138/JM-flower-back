
//创建牌
function creatPoker() {
    let pokers = [];
    let color = ["♠", "♥", "♣", "♦"];
    let number = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
        "A",
    ];
    for (let i = 0; i < number.length; i++) {
        let forNum = number[i];
        for (let j = 0; j < color.length; j++) {
            let forColor = color[j];
            pokers.push({
                color: forColor,
                number: forNum,
                name: forColor + forNum,
                order: i * 4 + j,
                power: i,
                // path: "/static/images/cards/" + (i + 2) + "_" + (j + 1) + ".jpg",
                path: "../../assets/images/cards/" + (i + 2) + "_" + (j + 1) + ".jpg",
            });
        }
    }
    shufflePoker(pokers)
    return pokers;
}

//洗牌
function shufflePoker(pokers) {
    for (let i = 0; i < pokers.length; i++) {
        //通过循环随机的将牌进行交换，实现洗牌
        let ranNum = parseInt(Math.random() * pokers.length);
        [pokers[i], pokers[ranNum]] = [pokers[ranNum], pokers[i]];
    }
}

//排序
function orderPoker(cardsList) {
    // console.log(newCardList);
    cardsList.sort(function (a, b) {
        //a,b代表着排序过程中两个相互比较的元素
        return a.order - b.order;
    });
    return cardsList
}

module.exports = { shufflePoker, orderPoker, creatPoker }