import { ponies } from "./ponies.js";

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
