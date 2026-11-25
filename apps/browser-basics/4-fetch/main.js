const API_URL = "https://ponyapi.net/v1/character/all?limit=6";

const list = document.getElementById("list");
const status = document.getElementById("status");
const more = document.querySelector("button");
let page = 0;

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

async function loadPage() {
  more.disabled = true;
  const url = new URL(API_URL, location.href);
  if (page > 0) url.searchParams.set("offset", String(6 * page));
  status.textContent = "Loading...";
  status.className = "";
  status.hidden = false;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`status ${response.status}`);
    const body = await response.json();
    if (body.data.length === 0) {
      const end = document.createElement("p");
      end.id = "end";
      end.textContent = "That is all of them.";
      more.replaceWith(end);
    }
    for (const pony of body.data) addCard(pony);
    page += 1;
    status.hidden = true;
  } catch (error) {
    status.textContent = `Could not load the ponies: ${error.message}`;
    status.className = "error";
  }
  more.disabled = false;
}

more.addEventListener("click", loadPage);
loadPage();
