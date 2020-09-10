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
Arr = new Array()
request.open('GET', 'https://api.cyberintelmatrix.com/training/feed', true);

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
  Arr.forEach(elem => {
    if (elem.type === "indicator") {
      const card = document.createElement('div');
      card.setAttribute('class', 'card');
      container.appendChild(card);

      const h2 = document.createElement('h2');
      h2.innerText = elem.getText()
      card.appendChild(h2);

      const content = document.createElement('div');
      content.setAttribute('class', 'content');
      content.hidden = true
      card.appendChild(content);

      //Changing header text with sroll to clicked element of list
      h2.onclick = function () {
        if (!elem.clicked) { card.scrollIntoView(true) }
        elem.negateClicked()
        h2.innerText = elem.getText();
        content.hidden = !content.hidden;
      }

      const pElem = document.createElement('p');
      pElem.innerText = elem.getFullData()
      content.appendChild(pElem);

      //Second level connects here
      const connectText = document.createElement('p');
      connectText.innerText = "Connections: "
      content.appendChild(connectText);

      //Looking for second element
      elem.connections.forEach(subElemID => {
        const pSub = document.createElement('div');
        pSub.setAttribute('class', 'card')
        connectText.appendChild(pSub);

        const hSub = document.createElement('h3');
        pSub.appendChild(hSub);

        const content2 = document.createElement('div');
        content2.hidden = true
        pSub.appendChild(content2);

        const pSubText = document.createElement('p');
        pSubText.hidden = true;
        content2.appendChild(pSubText);

        //Third level connects here
        const connectText2 = document.createElement('p');
        connectText2.innerText = "Connections: "
        content2.hidden = true
        content2.appendChild(connectText2);

        //Only first layer has changing header text and scroll
        hSub.onclick = function () {
          pSubText.hidden = !pSubText.hidden;
          content2.hidden = !content2.hidden;
        }
        //Looking for second level element texts and thrid level
        for (i = 0; i < Arr.length; i++) {
          if (subElemID === Arr[i].id) {
            //Second level texts
            hSub.innerText = "Name: " + Arr[i].name
            pSubText.innerText = [Arr[i].getText(), Arr[i].getFullData()].join('\n')
            //Third level
            Arr[i].connections.forEach(subSubElemID => {
              if (elem.id !== subSubElemID) {
                const pSubSub = document.createElement('div');
                pSubSub.setAttribute('class', 'card')
                content2.appendChild(pSubSub)

                const hSubSub = document.createElement('h4');
                pSubSub.appendChild(hSubSub);

                const pSubSubText = document.createElement('p');
                pSubSubText.hidden = true;
                pSubSub.appendChild(pSubSubText);

                //Only first layer has changing header text and scroll
                hSubSub.onclick = function () {
                  pSubSubText.hidden = !pSubSubText.hidden;
                }
                //Looking for third level element texts
                for (j = 0; j < Arr.length; j++) {
                  if (subSubElemID === Arr[j].id) {
                    //Third level texts without the original item (elem)
                    hSubSub.innerText = "Name: " + Arr[j].name
                    pSubSubText.innerText = [Arr[j].getText(), Arr[j].getFullData()].join('\n')
                  }
                }
              }
            });
          }
        }
      });
    }
  });
}

request.send();