const ponies = [
  {
    name: "Twilight Sparkle",
    kind: ["Alicorn", "Unicorn", "Human"],
    image: [
      "https://vignette.wikia.nocookie.net/mlp/images/b/bc/Princess_Twilight_Sparkle_ID_S4E26.png/revision/latest?cb=20160207045127",
    ],
  },
  {
    name: "Applejack",
    kind: ["Earth"],
    image: [
      "https://vignette.wikia.nocookie.net/mlp/images/d/d8/Applejack_S01E13_cropped.png/revision/latest?cb=20130419182236",
    ],
  },
  {
    name: "Fluttershy",
    kind: ["Pegasus"],
    image: [
      "https://vignette.wikia.nocookie.net/mlp/images/d/d6/Fluttershy_ID_S1E17.png/revision/latest?cb=20190410214903",
    ],
  },
  {
    name: "Rarity",
    kind: ["Unicorn"],
    image: [
      "https://vignette.wikia.nocookie.net/mlp/images/d/d1/Rarity_standing_S1E19_CROPPED.png/revision/latest?cb=20130418142043",
    ],
  },
  {
    name: "Pinkie Pie",
    kind: ["Human", "Earth"],
    image: [
      "https://vignette.wikia.nocookie.net/mlp/images/b/b2/Pinkie_Pie_ID_S4E11.png/revision/latest?cb=20190410214815",
    ],
  },
  {
    name: "Rainbow Dash",
    kind: ["Pegasus"],
    image: [
      "https://vignette.wikia.nocookie.net/mlp/images/4/4b/Rainbow_Dash_Wonderbolt_fantasy_cropped_S1E3.png/revision/latest?cb=20190410214837",
    ],
  },
];

const list = document.getElementById("list");

function addCard(pony) {
  const card = document.createElement("li");
  card.className = "card";

  const picture = document.createElement("img");
  picture.src = pony.image[0];
  picture.alt = pony.name;

  const name = document.createElement("h2");
  name.className = "name";
  name.textContent = pony.name;

  const kind = document.createElement("p");
  kind.className = "kind";
  kind.textContent = pony.kind.join(", ");

  card.append(picture, name, kind);
  list.append(card);
}

for (const pony of ponies) {
  addCard(pony);
}
