const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 750;

const STARTING_COLORS = ["BUBBLEGUM", "FLUORESCENTPINK", "BRIGHTRED", "ORANGE", "YELLOW", "GREEN", "TURQUOISE", "AQUA", "BLUE", "VIOLET", "MIDNIGHT"];

let currentLayer;
let currentFill = 255;
let currentSize = 100;
let currentColors = [];

let layers = {};

let noDraw = false;

function setup() {
  let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("risoColorSandbox");

  background(255);

  // All color buttons setups
  for (let i = 0; i < RISOCOLORS.length; i++) {
    let rgb = RISOCOLORS[i].color;

    $("#navbarCollapse form").append(`
      <div class="text-nowrap d-inline">
        <div class="checkbox-container" style="background-color: rgba(` + rgb[0] +`, ` + rgb[1] + `, ` + rgb[2] + `, 1);">
          <input id="all_` + RISOCOLORS[i].name + `" type="checkbox" name="all_color_buttons" value="` + RISOCOLORS[i].name + `">
        </div><label for="all_` + RISOCOLORS[i].name + `" style="background-color: rgba(` + rgb[0] +`, ` + rgb[1] + `, ` + rgb[2] + `, 1);">` +
          RISOCOLORS_PRETTY_NAMES.find(c => c.name === RISOCOLORS[i].name).pretty_name +
        `</label>
      </div>`);
  }

  $("input[name='all_color_buttons']").on("click", function(e) {
    let color = $(this).val();
    let newColor = updateButtons(color);

    if (newColor) {
      $("#" + color).click();
    }
    else {
      $("#colorButtonsContainer").children("input[name='color_buttons']").first().click();
    }

    background(255);
    drawRiso();
  });

  // Click on all colors in currentColors
  for (let i = 0; i < STARTING_COLORS.length; i++) {
    $("#all_" + STARTING_COLORS[i]).click();
  }

  // Pre-select first option
  $("#colorButtonsContainer").children("input[name='color_buttons']").first().click();

  // Prep event listeners for rest of inputs
  $("#navbarCollapse").on("show.bs.collapse", function () {
    noDraw = true;
  });

  $("#navbarCollapse").on("hide.bs.collapse", function () {
    noDraw = false;
  });

  $("#ellipseRange").on("change", function() {
    currentSize = parseInt($(this).val());
  });

  $("#opacity255").on("change input", function() {
    currentFill = parseInt($(this).val());
    updateButtonColors();
  });

  $("button[name='clear']").on("click", function() {
    clearRiso();
    background(255);
  });

  $("button[name='saveRiso']").on("click", function() {
    exportRiso();
  });

  $("button[name='saveImage']").on("click", function() {
    save("riso_color_sandbox.jpg");
  });
}

function mousePressed() {
  if (!noDraw) {
    background(255);

    currentLayer.fill(currentFill);
    currentLayer.ellipse(mouseX, mouseY, currentSize);

    drawRiso();
  }
}

function updateButtons(color) {
  let newColor = false;

  let index = currentColors.indexOf(color);
  if (index > -1) {
    currentColors.splice(index, 1);
    $("#colorButtonsContainer input[value='" + color + "']").remove();
    $("#colorButtonsContainer label[for='" + color + "']").next().remove();
    $("#colorButtonsContainer label[for='" + color + "']").remove();
  }
  else {
    $("#colorButtonsContainer").append(`
      <input id="` + color + `" type="radio" name="color_buttons" value="` + color + `">
      <label for="` + color + `">` +
        RISOCOLORS_PRETTY_NAMES.find(c => c.name === color).pretty_name +
      `</label><br />`);

    $("#" + color).on("click", function() {
      currentLayer = layers[color];
    });

    currentColors.push(color);
    newColor = true;
  }

  updateButtonColors();
  updateLayers(color);

  return newColor;
}

function updateButtonColors() {
  $("input[name='color_buttons']").each(function() {
    let rgb = RISOCOLORS.find(c => c.name === $(this).val()).color
    let label = $("label[for='" + $(this).val() + "']");

    label.css("background", "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + map(currentFill, 0, 255, 0, 1) + ")");
    label.css("color", "rgb(" + currentFill + "," + currentFill + "," + currentFill + ")");
  });
}

function updateLayers(color) {
  let layer = Riso.channels.find(c => c.channelName == color);

  if (typeof layer !== "undefined") {
    Riso.channels.splice(Riso.channels.indexOf(layer), 1);
    delete layers[color];
  }
  else {
    layers[color] = new Riso(color);
    risoNoStroke();
  }
}
