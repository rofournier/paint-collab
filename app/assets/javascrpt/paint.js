"use strict";

class Paint {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.canvas.focus()
    this.ctx = this.canvas.getContext("2d");
    this.drawing = false
    this.isFilling = false
    this.ctx.lineCap = "round";
    this.currentSize = 5
    this.currentPart = "head"
    this.currentColor = "black"
    this.points = []
    this.history = []
    this.legsDisplay = document.querySelector(".legs_img")
    this.bodyDisplay = document.querySelector(".body_img")
    this.headDisplay = document.querySelector(".head_img")
    this.listeners()
    setTimeout(() => {
      this.setBase();
    }, 100);
  }

  fill = (color) => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setBase = () => {
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = 3;
    console.log("setting base for " + this.currentPart)
    this.fill("white")
    this.ctx.beginPath();
    if (this.currentPart === "head") {
      this.ctx.moveTo(340, 600);
      this.ctx.lineTo(340, 590);
      this.ctx.moveTo(460, 600);
      this.ctx.lineTo(460, 590);
      this.ctx.stroke();
    } else if (this.currentPart === "body") {
      this.ctx.moveTo(340, 0);
      this.ctx.lineTo(340, 10);
      this.ctx.moveTo(460, 0);
      this.ctx.lineTo(460, 10);

      this.ctx.moveTo(300, 600);
      this.ctx.lineTo(300, 590);
      this.ctx.moveTo(490, 600);
      this.ctx.lineTo(490, 590);
      this.ctx.stroke();
    } else if (this.currentPart === "legs") {
      this.ctx.moveTo(300, 0);
      this.ctx.lineTo(300, 10);
      this.ctx.moveTo(490, 0);
      this.ctx.lineTo(490, 10);
      this.ctx.stroke();
    }
    this.ctx.closePath();
  }

  getMousePos = (evt) => {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  save = () => {
    var dataURL = this.canvas.toDataURL();
    var img = document.createElement("img");
    img.src = dataURL;

    fetch("/drawing", {
      method: 'post',
      body: JSON.stringify({
        drawing: {
          image: dataURL,
          part: this.currentPart
        }
      }),
      headers: {
        "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(() => {
      this.fill("white")
    }).catch((error) => {
      console.log(error)
    })
  }

  randomize = () => {

    fetch("/randomize", {
      method: 'get',
      headers: {
        "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content
      }
    }).then(response => response.json())
      .then(data => {
        this.headDisplay.src = data.head || this.headDisplay.src;
        this.bodyDisplay.src = data.body || this.bodyDisplay.src;
        this.legsDisplay.src = data.legs || this.legsDisplay.src;
      })
      .catch(error => {
        console.error('Error fetching random parts:', error);
      });
  }

  hexToRgb = (hex) => {
    // Remove the leading # if it exists
    hex = hex.replace(/^#/, '');

    // Convert each color component
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = 255; // Assuming full opacity

    // Return the color in the desired object format with integer values
    return {
      r: r,
      g: g,
      b: b,
      a: a
    };
  }

  handleMouseDown = (e) => {
    if (this.isFilling) {
      const pos = this.getMousePos(e);
      this.ctx.fillStyle = this.currentColor;
      this.ctx.fillFlood(pos.x, pos.y)
      this.isFilling = false;
      this.canvas.style.cursor = "pointer"
      return;
    }
    let pos = this.getMousePos(e);
    this.drawing = true

    this.points = [];
    this.points.push({ x: pos.x, y: pos.y })

    this.ctx.moveTo(pos.x, pos.y)
    this.ctx.beginPath();
    this.ctx.lineWidth = this.currentSize;
    console.log(this.currentSize)
    this.ctx.strokeStyle = this.currentColor;
  }

  checkBoundaries = (e) => {
    let in_boundaries = e.clientX - this.canvas.getBoundingClientRect().left >= 1 && e.clientY - this.canvas.getBoundingClientRect().top >= 1 && e.clientX - this.canvas.getBoundingClientRect().left <= this.canvas.width && e.clientY - this.canvas.getBoundingClientRect().top <= this.canvas.height
    if (!in_boundaries) {
      this.drawing = false
      console.log("drawing off")
    }
    return in_boundaries
  }

  redraw = () => {
    // delete everything
    this.fill("white");
    // draw all the paths in the paths array
    this.history.forEach(path => {
      this.ctx.beginPath();
      this.ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(path[i].x, path[i].y);
      }
      this.ctx.stroke();
    })
  }


  listeners = () => {

    this.canvas.addEventListener("mousedown", (e) => {
      this.handleMouseDown(e)
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.drawing) {
        this.checkBoundaries(e)
        let pos = this.getMousePos(e);
        this.points.push({ x: pos.x, y: pos.y })
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.drawing = false;
      this.history.push(this.points);
      console.log("not drawing")
    });


    document.getElementById('colorpicker').addEventListener('change', (e) => {
      this.currentColor = e.target.value;
      console.log(this.currentColor, "color")
    });

    document.getElementById('reset').addEventListener('click', (e) => {
      this.fill("white");
    });

    document.getElementById('controlSize').addEventListener('change', (e) => {
      this.currentSize = e.target.value;
    });

    document.getElementById('save').addEventListener('click', (e) => {
      this.save();
    });

    document.getElementById('fill').addEventListener('click', (e) => {
      console.log("filling on")
      this.isFilling = true;
      this.canvas.style.cursor = "crosshair"
    });

    document.querySelectorAll('.part').forEach((part) => {
      part.addEventListener('click', (e) => {
        this.currentPart = e.target.id;
        this.setBase()
      });
    });

    document.querySelector(".spinner").addEventListener('click', event => {
      this.randomize()
    })

    document.querySelector(".undo").addEventListener('click', event => {
      console.log(this.history)
      this.history.splice(-1, 1);
      this.redraw();
    })

    document.querySelectorAll(".displayItem").forEach((item) => {
      // Attach the event listener to each `item`
      item.addEventListener('click', event => {
        console.log(item); // Debugging: Log the item to ensure it's being captured correctly
        // Correct attribute name used in `getAttribute`
        let part = item.getAttribute('part');
        console.log(part); // Debugging: Log the retrieved attribute to ensure it's correct

        // Use `part` in the URL
        fetch(`/part/${part}`, {
          method: 'get',
          headers: {
            "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content
          }
        }).then(response => response.json())
          .then(data => {
            // Dynamic reference to display elements based on `part`
            this[`${part}Display`].src = data.src || this.headDisplay.src;
          })
          .catch(error => {
            console.error('Error fetching random parts:', error);
          });
      });
    });

  }
}

window.addEventListener("load", new Paint().fill("white"));