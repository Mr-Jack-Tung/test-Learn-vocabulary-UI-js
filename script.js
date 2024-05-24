// document.addEventListener('DOMContentLoaded', () => {
//   const fileInput = document.getElementById('file-input');
//   const readingParagraph = document.getElementById('readingParagraph')
//   const loadButton = document.getElementById('loadButton')


document.getElementById('file-input').addEventListener('change', handleFileInput);

function handleFileInput(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('readingParagraph').textContent = e.target.result;
    };
    reader.readAsText(file);
  }
}

document.getElementById('loadUrlButton').addEventListener('click', function() {
  var url = document.getElementById('urlInput').value;
  if (url) {
    fetchContent(url);
  } else {
    displayError('Please enter a valid URL.');
  }
});

function fetchContent(url) {
    // Using the CORS proxy to handle cross-origin requests
    // var proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);
    // var proxyUrl = url
  fetch(url)
        // .then(response => response.json())
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.text();
  })
  // .then(data => {
  //     if (data.contents) {
  //         document.getElementById('content').textContent = sanitizeHTML(data.contents);
  //         document.getElementById('content').classList.remove('hidden');
  //         document.getElementById('error').classList.add('hidden');
  //     } else {
  //         throw new Error('No content found.');
  //     }
  // })
  .then(data => {
    document.getElementById('readingParagraph').textContent = sanitizeHTML(data);
            // document.getElementById('content').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
  })
  .catch(error => {
    document.getElementById('readingParagraph').textContent = url
    displayError('There was a problem fetching the content: ' + error.message);
  });
}

// function sanitizeHTML(html) {
//     var doc = new DOMParser().parseFromString(html, 'text/html');

//     // return doc.body.textContent || '';

//     // Extract and return the text content from the document body
//     return doc.body.innerText || '';
// }

function sanitizeHTML(html) {
    // Create a new DOM parser
  var parser = new DOMParser();
    // Parse the HTML string into a document
  var doc = parser.parseFromString(html, 'text/html');

    // Recursively extract text content from the document body
  function getTextFromNode(node) {
    let text = '';
    for (let child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent.trim() + ' ';
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
        text += getTextFromNode(child);
      }
    }
    return text.trim();
  }

  return getTextFromNode(doc.body);
}

function displayError(message) {
  var errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  document.getElementById('content').classList.add('hidden');
}


let selectedRange;

function deleteSelectedText() {
  if (!selectedRange) return;
  selectedRange.deleteContents();

  selectedRange = null;
  document.activeElement.blur();
}

// Function to highlight selected text
function highlightSelectedText() {
  if (!selectedRange) return;
  const span = document.createElement("span");
  span.className = "highlight";
  span.textContent = selectedRange.toString();
  selectedRange.deleteContents();
  selectedRange.insertNode(span);

  selectedRange = null;
  document.activeElement.blur();
}

// Function to remove highlight selected text
function removeHighlight() {
  if (!selectedRange) return;

  const range = selectedRange;
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  function unwrap(node) {
    const parent = node.parentNode;
    while (node.firstChild) {
      parent.insertBefore(node.firstChild, node);
    }
    parent.removeChild(node);
  }

  function unwrapIfHighlighted(node) {
    // Check and unwrap container if it's highlighted
    if (node.nodeType === Node.TEXT_NODE && node.parentElement.classList.contains('highlight')) {
      unwrap(node.parentElement);
    }
  }

  unwrapIfHighlighted(startContainer);
  unwrapIfHighlighted(endContainer);

  range.cloneContents().querySelectorAll('.highlight').forEach(unwrap);
  
  selectedRange = null;
  document.activeElement.blur();
}

let vocab = [];

// Function to add highlighted text to vocabulary list
function addHighlightedTextToVocab() {
  if (selectedRange) {
    const selectedText = selectedRange.toString().trim();
    if (selectedText) {
      const span = document.createElement("span");
      span.textContent = selectedText;
      // span.className = "selected editable"; // Added "editable" class
      span.className = "selected"; // Added "editable" class
      selectedRange.deleteContents();
      selectedRange.insertNode(span);
      document.getElementById("vocabWord").value = selectedText;

      addToList()
    } else {
      alert("Please select a word to add.");
    }
  }

  selectedRange = null;
  document.activeElement.blur();
}


function handleLoadVocab() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        vocab = JSON.parse(e.target.result);
        renderVocabList();
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function renderVocabList() {
  document.getElementById("vocabList").innerHTML = '';
  vocab.forEach(item => {
    const li = document.createElement('li');
        // li.className = 'vocab-item';
    li.innerHTML = `<span class="remove-btn" onclick="removeVocabulary(this)">[ x ]</span> ${item.vocab}: <span class="editable" contenteditable="true">${item.meaning}</span>`;
    vocabList.appendChild(li);
  });
}

// Function to add text to vocabulary list
function addToList() {
  const word = document.getElementById("vocabWord").value.trim().toLowerCase();
  const meaning = document.getElementById("vocabMeaning").value.trim();

  if (word && !vocab.some(v => v.vocab === word)) {
    const vocabItem = { vocab: word, meaning: meaning };
    vocab.push(vocabItem);

    console.log('vocab:',vocab)

  // if (word) {
    const ul = document.getElementById("vocabList");
    const li = document.createElement("li");
    li.innerHTML += '<span class="remove-btn" onclick="removeVocabulary(this)">[ x ]</span>';
    // li.className = "vocab-word";

    li.appendChild(document.createTextNode(` ${word}: `));
    const meaningSpan = document.createElement("span");
    meaningSpan.textContent = meaning;
    meaningSpan.className = "editable"; // Added "editable" class
    meaningSpan.setAttribute("contenteditable", "true"); // Added contenteditable attribute
    li.appendChild(meaningSpan);
    ul.appendChild(li);

    document.getElementById("vocabWord").value = "";
    document.getElementById("vocabMeaning").value = "";
    document.activeElement.blur();
  } else {
    // alert("Please enter both the word and its meaning.");
    alert("The word is duplicated.");
  }
}

function removeVocabulary(element) {
  var vocabList = document.getElementById("vocabList");
  var listItem = element.parentNode;
  vocabList.removeChild(listItem);
}

// Function to remove text to vocabulary list
function removeSelectedVocab() {
  const selectedVocab = document.querySelector('.selected');
  if (selectedVocab) {
    // selectedVocab.parentNode.removeChild(selectedVocab);
    selectedVocab.remove();
  } else {
    alert("No vocabulary item is selected.");
  }
}

function saveVocabulary() {
  const vocabJson = JSON.stringify(vocab, null, 2);
  const blob = new Blob([vocabJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocab.json';
  a.click();
}

// function saveVocabulary() {
//   var vocabList = document.getElementById("vocabList");
//   var items = vocabList.getElementsByTagName("li");
//   var vocabArray = [];

//     console.log('items.length:',items.length); // Debugging log

//     // node.parentElement.classList.contains('highlight')

//     for (var i = 0; i < items.length; i++) {

//         // vocabArray.push(items[i].childNodes[0].nodeValue.trim());
//         vocabArray.push(items[i].innerText); //.innerHTML
//         console.log('items.innerHTML:',items[i].innerText)
//       }

//       var json = JSON.stringify(vocabArray, null, 2);
//       var blob = new Blob([json], { type: "application/json" });
//       var url = URL.createObjectURL(blob);

//       var a = document.createElement("a");
//       a.href = url;
//       a.download = "vocabulary.json";
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     }


// Function to handle right-click and show custom menu
function handleRightClick(event) {
  event.preventDefault(); // to cancel the default action that belongs to the event.
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    selectedRange = selection.getRangeAt(0).cloneRange();
  }

  const customMenu = document.getElementById("customMenu");
  customMenu.style.display = 'block';
  customMenu.style.left = `${event.pageX}px`;
  customMenu.style.top = `${event.pageY}px`;

  console.log('handleRightClick clicked'); // Debugging log
  // console.log(selectedRange)
}

// Function to hide custom menu
function hideCustomMenu() {
  const customMenu = document.getElementById("customMenu");
  customMenu.style.display = 'none';
}

// Add event listener for right-click to show custom menu
document.getElementById("readingParagraph").addEventListener("contextmenu", handleRightClick);

// Add event listeners for custom menu options
document.getElementById("highlightOption").addEventListener("click", function() {
  console.log('Highlight option clicked'); // Debugging log
  highlightSelectedText();
  hideCustomMenu();
});

document.getElementById("removeHighlightOption").addEventListener("click", function() {
  console.log('Remove Highlight option clicked'); // Debugging log
  removeHighlight();
  hideCustomMenu();
});

document.getElementById("addVocabOption").addEventListener("click", function() {
  console.log('Add to Vocabulary option clicked'); // Debugging log
  addHighlightedTextToVocab();
  hideCustomMenu();
});

// document.getElementById("removeVocabOption").addEventListener("click", function() {
//   console.log('Remove Vocabulary option clicked'); // Debugging log
//   removeSelectedVocab();
//   hideCustomMenu();
// });

document.getElementById("deleteSeletedOption").addEventListener("click", function() {
  console.log('deleteSelectedText()'); // Debugging log
  deleteSelectedText();
  hideCustomMenu();
});

// Add event listener to hide custom menu when clicking elsewhere
document.addEventListener("click", function(event) {
  const customMenu = document.getElementById("customMenu");
  if (!customMenu.contains(event.target)) {
    hideCustomMenu();
  }
});

// Add event listener to vocabMeaning textbox for Enter key press
document.getElementById("vocabMeaning").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    addToList();
  }
});


document.getElementById("addButton").addEventListener("click", addToList);
document.getElementById("saveButton").addEventListener("click", saveVocabulary);
document.getElementById("loadButton").addEventListener("click", handleLoadVocab);

// Add event listener for editing vocab meaning
document.getElementById("vocabList").addEventListener("click", function(event) {
  const target = event.target;
  if (target.classList.contains("editable")) {
    target.contentEditable = true;
    target.focus();
  }
});

document.body.addEventListener('mouseover', function(event) {
    if(event.target !== document.body) {
        event.target.classList.add('border');
    }
});

document.body.addEventListener('mouseout', function(event) {
    if(event.target !== document.body) {
        event.target.classList.remove('border');
    }
});
        
// });



