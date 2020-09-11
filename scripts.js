const app = document.getElementById('root');

const logo = document.createElement('img');
logo.src = 'CIM_logo.png';

const container = document.createElement('div');
container.setAttribute('class', 'container');
const header = document.createElement('h1');
header.textContent = "Kiber támadási adatok"

app.appendChild(logo);
app.appendChild(header);
app.appendChild(container);

//For the easy accessybility
class Element {
  constructor(id, type, name, created, desc, mod, omr, labels) {
    this.id = id
    this.type = type
    this.name = name
    this.created = created
    this.description = desc

    this.data = new Array()
    this.data.push("ID:\t\t\t\t\t\t" + id)
    this.data.push("Modified:\t\t\t\t" + mod)
    this.data.push("Object marking refs:\t" + omr)
    if (labels !== undefined) {
      this.data.push("Labels:\t\t\t\t\t" + labels)
    }

    this.clicked = false
    this.connections = new Array()
  }
  getConLength() {
    return this.connections.length
  }
  getConAtIndex(index) {
    if (index < this.connections.length) {
      return this.connections[index]
    }
    return false;
  }
  negateClicked() {
    this.clicked = !this.clicked
  }
  getText() {
    if (this.clicked) {
      return ("Name:\t\t\t\t\t" + this.name)
    } else {
      return ("Name:\t\t\t\t\t" + this.name +
        "\nCreated:\t\t\t\t" + this.created +
        "\nDescription:\t\t\t" + this.description)
    }
  }
  getFullData() {
    return this.data.join('\n')
  }
  addConnection(id) {
    this.connections.push(id)
  }
}

const request = new XMLHttpRequest();

request.open('GET', 'https://api.cyberintelmatrix.com/training/feed', true);
Arr = new Array()
headers = ['h2', 'h3', 'h4', 'h5', 'h6']

//Recursive function to draw card elements
//elem is the current card, currentLevel goes deeper until it reaches numOfLevels and adds itself to the parentContainer.
//Excluding the current element from the upcoming level's connections 
function drawCards(elem, currentLevel, numOfLevels, parentContainer, excludeConnections) {
  const card = document.createElement('div');
  card.setAttribute('class', 'card');
  parentContainer.appendChild(card);

  //First level headers have changing texts based on if it's selected or not
  const h = document.createElement(headers[currentLevel]);
  if (currentLevel < 1) {
    h.innerText = elem.getText();
  } else {
    h.innerText = elem.name
  }
  card.appendChild(h);

  const content = document.createElement('div');
  content.hidden = true
  card.appendChild(content);

  
  
  h.onclick = function () {
    //Changing header text if neccesary
    //First level header also has scroll set to it's top so it will be in full screen
    if (currentLevel < 1) {
      if (!elem.clicked) { card.scrollIntoView(true) }
      elem.negateClicked()
      h.innerText = elem.getText();
    }
    //Revealing deeper level connections
    content.hidden = !content.hidden;
  }
  //Data of the element
  const p = document.createElement('p');
  p.innerText = [elem.getText(), elem.getFullData()].join('\n')
  content.appendChild(p);

  //Excluding current id from upcoming levels connection list
  excludeConnections.push(elem.id)

  //Do we need to go deeper?
  if (currentLevel < numOfLevels) {
    //Next level connects here
    const connectText = document.createElement('p');
    connectText.innerText = "Connections: "
    content.appendChild(connectText);

    elem.connections.forEach(subElemID => {
      for (i = 0; i < Arr.length; i++) {
        b = true;
        //Excluding already listed connections
        for (j = 0; j < excludeConnections.length; j++) {
          if (Arr[i].id === excludeConnections[j]) {
            b = false
          }
        }
        if (b && (subElemID === Arr[i].id)) {
          drawCards(Arr[i], currentLevel + 1, numOfLevels, connectText, excludeConnections)
        }
      }
    });
  }
  return;
}
request.onload = function () {
  // Begin accessing JSON data here
  const data = JSON.parse(this.response).data;

  if (request.status >= 200 && request.status < 400) {
    //Setting up connections
    data.forEach(attack => {
      if (attack.type === "relationship") {
        for (i = 0; i < Arr.length; i++) {
          if (Arr[i].id === attack.source_ref) {
            Arr[i].addConnection(attack.target_ref)
          }
          if (Arr[i].id === attack.target_ref) {
            Arr[i].addConnection(attack.source_ref)
          }
        }
      } else {
        //Filling up the Array
        Arr.push(new Element(attack.id, attack.type, attack.name, attack.created, attack.description, attack.modified, attack.object_marking_refs, attack.labels))
      }
    });
  } else {
    window.alert(`Failed to carry out request, status code: ${request.status}`);
  }
  Arr.sort((a, b) => (a.id > b.id) ? 1 : -1)

  //Creating output
  Arr.forEach(element => {
    const exclude = new Array()
    //for every list item, we want to create a 3 layer deep connection list within itself
    drawCards(element, 0, 2, container, exclude)
  });
}

request.send();

