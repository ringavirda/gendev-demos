const API_URL = "https://ponyapi.net/v1/character/all?limit=6";

const list = document.getElementById("list");
const status = document.getElementById("status");

function addCard(pony) {
  const card = document.createElement("li");
  card.className = "card";

  if (pony.image && pony.image.length > 0) {
    const picture = document.createElement("img");
    picture.src = pony.image[0];
    picture.alt = pony.name;
    card.append(picture);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder";
    placeholder.textContent = "No picture";
    card.append(placeholder);
  }

  const name = document.createElement("h2");
  name.className = "name";
  name.textContent = pony.name;

  const kind = document.createElement("p");
  kind.className = "kind";
  kind.textContent = pony.kind ? pony.kind.join(", ") : "";

  card.append(name, kind);
  list.append(card);
}

async function loadPonies() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`status ${response.status}`);
    const body = await response.json();
    for (const pony of body.data) {
      addCard(pony);
    }
    status.hidden = true;
  } catch (error) {
    status.textContent = `Could not load the ponies: ${error.message}`;
    status.className = "error";
  }
}

loadPonies();
